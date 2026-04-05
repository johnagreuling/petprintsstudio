import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json()
    const ext = filename?.split('.').pop()?.toLowerCase() || 'jpg'
    const key = `uploads/${uuidv4()}.${ext}`

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType || 'image/jpeg',
      }),
      { expiresIn: 300 }
    )

    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
    return NextResponse.json({ signedUrl, publicUrl: `${publicUrl}/${key}`, key })
  } catch (err: any) {
    console.error('Presign error:', err)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
