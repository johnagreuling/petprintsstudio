import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import {
  insertBrandAsset,
  getBrandAssets,
  getBrandAssetCountsByCategory,
  initializeDatabase,
  BRAND_ASSET_CATEGORIES,
} from '@/lib/db';

export const maxDuration = 60;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function extFromNameOrType(name: string, type: string): string {
  const fromName = name.split('.').pop()?.toLowerCase();
  if (fromName && fromName.length <= 5) return fromName;
  if (type.startsWith('image/')) return type.split('/')[1];
  return 'bin';
}

// Extract width/height from image bytes (PNG/JPEG only — lightweight, no deps)
function readImageDimensions(buf: Buffer, contentType: string): { width: number | null; height: number | null } {
  try {
    // PNG: 8-byte signature + IHDR at offset 8, width=bytes 16-19, height=bytes 20-23
    if (contentType === 'image/png' || (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    // JPEG: scan for SOF0 (0xFFC0) / SOF2 (0xFFC2)
    if (contentType === 'image/jpeg' || (buf[0] === 0xff && buf[1] === 0xd8)) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
    // WEBP: "RIFF....WEBP" then chunks
    if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') {
      // VP8X extended
      if (buf.slice(12, 16).toString('ascii') === 'VP8X') {
        const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { width: w, height: h };
      }
      // VP8 lossy
      if (buf.slice(12, 16).toString('ascii') === 'VP8 ') {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      }
      // VP8L lossless
      if (buf.slice(12, 16).toString('ascii') === 'VP8L') {
        const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
        return { width: 1 + (((b1 & 0x3f) << 8) | b0), height: 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) };
      }
    }
  } catch {
    // fall through
  }
  return { width: null, height: null };
}

// GET /api/admin/assets?category=&search=
export async function GET(req: NextRequest) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const [assets, countRows] = await Promise.all([
      getBrandAssets({ category, search, limit: 500 }),
      getBrandAssetCountsByCategory(),
    ]);

    const counts: Record<string, number> = {};
    for (const row of countRows) counts[row.category] = row.count;

    return NextResponse.json({ assets, counts });
  } catch (err: any) {
    console.error('GET /api/admin/assets error:', err);
    return NextResponse.json({ error: 'Failed to fetch assets', detail: err?.message }, { status: 500 });
  }
}

// POST /api/admin/assets (multipart/form-data: file, category, tags?, notes?)
export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let category = (formData.get('category') as string) || 'uncategorized';
    const tagsRaw = (formData.get('tags') as string) || '';
    const notes = (formData.get('notes') as string) || '';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are supported in v1' }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum is 50MB.' }, { status: 413 });
    }
    if (!(BRAND_ASSET_CATEGORIES as readonly string[]).includes(category)) {
      category = 'uncategorized';
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { width, height } = readImageDimensions(buffer, file.type);
    const ext = extFromNameOrType(file.name, file.type);
    const r2_key = `brand-assets/${category}/${uuidv4()}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: r2_key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
    const url = `${publicUrl}/${r2_key}`;

    const tags = tagsRaw
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const asset = await insertBrandAsset({
      filename: file.name,
      url,
      r2_key,
      category,
      tags,
      file_size_bytes: file.size,
      content_type: file.type,
      width,
      height,
      notes,
    });

    return NextResponse.json({ asset });
  } catch (err: any) {
    console.error('POST /api/admin/assets error:', err);
    return NextResponse.json({ error: 'Upload failed', detail: err?.message }, { status: 500 });
  }
}
