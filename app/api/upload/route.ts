import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// These two exports are the KEY to raising Vercel's body size limit
export const maxDuration = 60
export const runtime = 'nodejs'

// Tell Next.js NOT to parse the body — we handle it ourselves
// This bypasses the 4.5MB default body parser limit entirely
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
    // Use req.formData() which reads the raw request body directly
    // bypassing Next.js body parser size limits
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    
    const sizeMB = file.size / 1024 / 1024
    console.log(`Upload attempt: ${file.name}, ${sizeMB.toFixed(1)}MB, type: ${file.type}`)
    
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum is 50MB.' }, { status: 413 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const key = `uploads/${uuidv4()}.${ext}`
    
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
      CacheControl: 'public, max-age=86400',
    }))
    
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '')
    console.log(`Upload success: ${key}`)
    return NextResponse.json({ url: `${publicUrl}/${key}`, key })
    
  } catch (err: any) {
    console.error('Upload error:', err?.message || err)
    return NextResponse.json({ error: 'Upload failed', detail: err?.message }, { status: 500 })
  }
}
