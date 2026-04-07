import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const list = await r2.send(new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: 'sessions/',
      Delimiter: '/',
    }))

    const sessionFolders = (list.CommonPrefixes || []).map(p => p.Prefix!)

    const sessions = await Promise.all(
      sessionFolders.map(async (folder) => {
        try {
          const obj = await r2.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: `${folder}session.json`,
          }))
          const text = await obj.Body?.transformToString()
          if (!text) return null
          return { ...JSON.parse(text), folder }
        } catch { return null }
      })
    )

    return NextResponse.json({
      sessions: sessions.filter(Boolean),
      count: sessions.filter(Boolean).length,
    })
  } catch (err) {
    console.error('Gallery API error:', err)
    return NextResponse.json({ sessions: [], error: String(err) })
  }
}
