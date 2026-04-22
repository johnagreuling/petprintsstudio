import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { requireAdminAuth } from '@/lib/admin-auth';

// ═══════════════════════════════════════════════════════════════════════
//  CURATE PICKS API
//  GET  → load current picks from R2 (showcase/picks.json)
//  POST → save new picks to R2
// ═══════════════════════════════════════════════════════════════════════

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const PICKS_KEY = 'showcase/picks.json'

export async function GET(request: Request) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;
  try {
    const res = await r2.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: PICKS_KEY,
    }))
    const body = await res.Body!.transformToString()
    const data = JSON.parse(body)
    return NextResponse.json(data)
  } catch (e: any) {
    // Not found → return empty
    if (e.name === 'NoSuchKey' || e.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ picks: {} })
    }
    console.error('Load picks failed:', e)
    return NextResponse.json({ picks: {}, error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdminAuth(req);
  if (authError) return authError;
  try {
    const { picks } = await req.json()
    if (!picks || typeof picks !== 'object') {
      return NextResponse.json({ error: 'Invalid picks' }, { status: 400 })
    }
    const data = {
      picks,
      updatedAt: new Date().toISOString(),
      count: Object.keys(picks).length,
    }
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: PICKS_KEY,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
      CacheControl: 'no-cache',
    }))
    return NextResponse.json({ ok: true, count: data.count })
  } catch (e) {
    console.error('Save picks failed:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
