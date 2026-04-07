import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const { sessionId } = params
  try {
    const list = await r2.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: `sessions/${sessionId}`,
      MaxKeys: 10,
    }))
    const firstKey = list.Contents?.[0]?.Key
    if (!firstKey) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    const folder = firstKey.split('/').slice(0, 2).join('/') + '/'
    const obj = await r2.send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: `${folder}session.json`,
    }))
    const text = await obj.Body?.transformToString()
    if (!text) return NextResponse.json({ error: 'Session data not found' }, { status: 404 })
    return NextResponse.json(JSON.parse(text))
  } catch (err) {
    console.error('Session API error:', err)
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
}
