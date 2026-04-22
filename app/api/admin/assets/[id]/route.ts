import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import {
  getBrandAssetById,
  updateBrandAsset,
  deleteBrandAsset,
  BRAND_ASSET_CATEGORIES,
  initializeDatabase,
} from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// PATCH /api/admin/assets/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth(req);
  if (authError) return authError;
  try {
    await initializeDatabase();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await req.json();
    const updates: { category?: string; tags?: string[]; notes?: string } = {};

    if (typeof body.category === 'string') {
      if (!(BRAND_ASSET_CATEGORIES as readonly string[]).includes(body.category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
      updates.category = body.category;
    }
    if (Array.isArray(body.tags)) {
      updates.tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
    }
    if (typeof body.notes === 'string') {
      updates.notes = body.notes;
    }

    const asset = await updateBrandAsset(id, updates);
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ asset });
  } catch (err: any) {
    console.error('PATCH /api/admin/assets/[id] error:', err);
    return NextResponse.json({ error: 'Update failed', detail: err?.message }, { status: 500 });
  }
}

// DELETE /api/admin/assets/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdminAuth(req);
  if (authError) return authError;
  try {
    await initializeDatabase();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const asset = await getBrandAssetById(id);
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Best-effort R2 delete; even if this fails, we still remove the DB row
    try {
      await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: asset.r2_key,
      }));
    } catch (e: any) {
      console.error(`R2 delete failed for key=${asset.r2_key}:`, e?.message);
    }

    await deleteBrandAsset(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE /api/admin/assets/[id] error:', err);
    return NextResponse.json({ error: 'Delete failed', detail: err?.message }, { status: 500 });
  }
}
