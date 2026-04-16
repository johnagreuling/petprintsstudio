/**
 * ═══════════════════════════════════════════════════════════════════════
 *  PRINT UPSCALING
 *
 *  Takes a 1024×1536 image from gpt-image-1 and upscales via fal.ai
 *  Clarity Upscaler (portrait-optimized) to print-grade resolution
 *  (typically 4x = 4096×6144), suitable for large canvases at 200-300 DPI.
 *
 *  Called from the Stripe webhook after payment, BEFORE handing the image
 *  URL to Printify — so customers get high-res prints even though
 *  generation happens at 1024×1536.
 *
 *  Cost: ~$0.03 per upscale via Clarity. A no-op on a $79-199 canvas.
 *  Fail-safe: on any error, returns the original URL so orders never block.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const R2_PUBLIC_BASE = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

/**
 * Submit a job to fal.ai Clarity Upscaler and poll for completion.
 * Uses the fal.ai queue API (v1) for reliability on long-running jobs.
 */
async function callClarityUpscaler(imageUrl: string): Promise<string> {
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY
  if (!falKey) throw new Error('FAL_KEY is not configured')

  const MODEL = 'fal-ai/clarity-upscaler'
  const SUBMIT_URL = `https://queue.fal.run/${MODEL}`

  // Step 1: submit
  const submitRes = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${falKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: 'masterpiece, best quality, highres, portrait, fine art',
      upscale_factor: 2,              // 1024×1536 → 2048×3072 (plenty for print at 200 DPI on 16x20 canvas)
      creativity: 0.35,               // moderate detail enhancement — faithful to original
      resemblance: 0.6,               // preserve subject identity
      num_inference_steps: 18,
    }),
  })
  if (!submitRes.ok) {
    const txt = await submitRes.text()
    throw new Error(`Clarity submit ${submitRes.status}: ${txt.slice(0, 200)}`)
  }
  const { request_id, status_url, response_url } = await submitRes.json() as {
    request_id: string; status_url: string; response_url: string
  }
  if (!request_id) throw new Error('No request_id from fal.ai')

  // Step 2: poll status until completed (max ~90s)
  const started = Date.now()
  const maxMs = 90_000
  while (Date.now() - started < maxMs) {
    await new Promise(r => setTimeout(r, 2500))
    const statusRes = await fetch(status_url, {
      headers: { 'Authorization': `Key ${falKey}` },
    })
    if (!statusRes.ok) continue
    const status = await statusRes.json() as { status: string }
    if (status.status === 'COMPLETED') break
    if (status.status === 'FAILED') throw new Error('Upscale job failed')
  }

  // Step 3: fetch result
  const resultRes = await fetch(response_url, {
    headers: { 'Authorization': `Key ${falKey}` },
  })
  if (!resultRes.ok) throw new Error(`Clarity result ${resultRes.status}`)
  const result = await resultRes.json() as { image?: { url: string } }
  const upscaledUrl = result.image?.url
  if (!upscaledUrl) throw new Error('No upscaled image URL in response')
  return upscaledUrl
}

/**
 * Download an image from a URL and re-upload it to R2 under print/.
 * This guarantees the image URL stays stable (fal.ai URLs can expire).
 */
async function mirrorToR2(sourceUrl: string): Promise<string> {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Mirror fetch failed: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const ext = sourceUrl.toLowerCase().includes('.jpg') || sourceUrl.toLowerCase().includes('.jpeg') ? 'jpg' : 'png'
  const key = `print/${uuidv4()}.${ext}`
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: `image/${ext}`,
    CacheControl: 'public, max-age=31536000',
  }))
  return `${R2_PUBLIC_BASE}/${key}`
}

/**
 * Main entrypoint: upscale an image for print.
 * Returns a stable R2 URL of the upscaled image.
 * On ANY error, returns the original URL — never blocks orders.
 */
export async function upscaleForPrint(sourceUrl: string): Promise<{
  url: string
  upscaled: boolean
  error?: string
  durationMs: number
}> {
  const start = Date.now()
  try {
    console.log(`🔍 Upscaling for print: ${sourceUrl.slice(0, 80)}...`)
    const upscaledRemoteUrl = await callClarityUpscaler(sourceUrl)
    const r2Url = await mirrorToR2(upscaledRemoteUrl)
    const durationMs = Date.now() - start
    console.log(`✅ Upscaled in ${durationMs}ms → ${r2Url}`)
    return { url: r2Url, upscaled: true, durationMs }
  } catch (err: any) {
    const durationMs = Date.now() - start
    console.error(`❌ Upscale failed (${durationMs}ms): ${err?.message || err}`)
    return { url: sourceUrl, upscaled: false, error: String(err?.message || err), durationMs }
  }
}
