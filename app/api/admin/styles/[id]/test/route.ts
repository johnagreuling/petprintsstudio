import { NextResponse, NextRequest } from 'next/server'
import OpenAI from 'openai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  readStyleById,
  buildPrompt,
  DEFAULT_COMPOSITION,
  recordTest,
  type SubjectProfile,
} from '@/lib/portrait-engine'

export const maxDuration = 90

interface RouteCtx { params: Promise<{ id: string }> | { id: string } }

// Lazy clients — instantiated per-request so build-time env-var checks pass
function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}
function getR2() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  })
}

const R2_BUCKET = process.env.R2_BUCKET_NAME || 'petprintsstudio'
const R2_PUBLIC = process.env.R2_PUBLIC_URL || 'https://pub-3b7e4ef250914cb9adac3dd43ed84fca.r2.dev'

// Default test pet profile — Mason. Override with body.subject if provided.
const DEFAULT_SUBJECT: SubjectProfile = {
  subjectType: 'pet',
  summary: 'a tan standard poodle dog with curly fur, dark eyes, and a black nose',
  traits: {
    species: 'dog',
    breed: 'standard poodle',
    coatColor: 'tan',
    coatTexture: 'curly',
  },
  mustPreserve: ['breed', 'coatColor', 'coatTexture'],
  rawAnalysis: '',
}
const DEFAULT_TEST_IMAGE_URL =
  process.env.ADMIN_TEST_IMAGE_URL ||
  `${R2_PUBLIC}/admin-test/mason-reference.jpg`

export async function POST(req: NextRequest, ctx: RouteCtx) {
  try {
    const params = await ctx.params
    const styleId = params.id

    const style = await readStyleById(styleId)
    if (!style) return NextResponse.json({ error: 'Style not found' }, { status: 404 })

    const body = await req.json().catch(() => ({})) as {
      imageUrl?: string
      subject?: Partial<SubjectProfile>
      quality?: 'low' | 'medium' | 'high'
    }

    const subject: SubjectProfile = {
      ...DEFAULT_SUBJECT,
      ...(body.subject || {}),
    } as SubjectProfile

    const sourceImageUrl = body.imageUrl || DEFAULT_TEST_IMAGE_URL
    const quality = body.quality || 'medium'

    // 1. Assemble prompt using the same builder production uses
    const promptPackage = buildPrompt(subject, style, DEFAULT_COMPOSITION)

    // 2. Fetch reference image
    const imgResp = await fetch(sourceImageUrl)
    if (!imgResp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch reference image: ${sourceImageUrl}` },
        { status: 400 }
      )
    }
    const imgBuffer = Buffer.from(await imgResp.arrayBuffer())
    // Convert to File-like for OpenAI SDK
    const imgFile = new File([imgBuffer], 'reference.jpg', { type: 'image/jpeg' })

    // 3. Generate single image
    const t0 = Date.now()
    const result = await getOpenAI().images.edit({
      model: 'gpt-image-2',
      image: imgFile,
      prompt: promptPackage.fullPrompt,
      size: '1024x1536',
      quality,
      n: 1,
    })
    const elapsedMs = Date.now() - t0

    const b64 = result.data?.[0]?.b64_json
    if (!b64) {
      return NextResponse.json(
        { error: 'No image returned from model' },
        { status: 502 }
      )
    }

    // 4. Upload to R2 under admin-tests/
    const buf = Buffer.from(b64, 'base64')
    const key = `admin-tests/${styleId}/${Date.now()}.png`
    await getR2().send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: 'image/png',
    }))
    const imageUrl = `${R2_PUBLIC}/${key}`

    // 5. Record cost (~$0.04 medium, ~$0.08 high)
    const costCents = quality === 'high' ? 8 : quality === 'low' ? 2 : 4
    await recordTest({ styleId, imageUrl, costCents })

    return NextResponse.json({
      ok: true,
      imageUrl,
      elapsedMs,
      costCents,
      quality,
      prompt: promptPackage.fullPrompt,
    })
  } catch (err: any) {
    console.error('Style test error:', err)
    return NextResponse.json(
      { error: 'Test generation failed', details: String(err?.message || err) },
      { status: 500 }
    )
  }
}
