import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
})

const ADMIN_KEY = process.env.ADMIN_KEY || 'pps-admin-2024'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY
}

// PATCH: update session with song URL after generating in Suno
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { sessionFolder, songUrl, songTitle } = await req.json()
    if (!sessionFolder || !songUrl) return NextResponse.json({ error: 'sessionFolder and songUrl required' }, { status: 400 })
    const obj = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: `${sessionFolder}/session.json` }))
    const existing = JSON.parse(await obj.Body!.transformToString())
    const updated = { ...existing, songUrl, songTitle: songTitle || existing.songTitle, songReady: true }
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: `${sessionFolder}/session.json`, Body: JSON.stringify(updated, null, 2), ContentType: 'application/json' }))
    return NextResponse.json({ ok: true, sessionFolder, songUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET: retrieve suno prompt for a session
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const folder = req.nextUrl.searchParams.get('folder')
  if (!folder) return NextResponse.json({ error: 'folder param required' }, { status: 400 })
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: `${folder}/session.json` }))
    const session = JSON.parse(await obj.Body!.transformToString())
    return NextResponse.json({ petName: session.petName, songTitle: session.songTitle, sunoPrompt: session.sunoPrompt, songUrl: session.songUrl, songReady: session.songReady || false })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
