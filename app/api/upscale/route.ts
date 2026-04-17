import { NextRequest, NextResponse } from 'next/server'
import { upscaleForPrint } from '@/lib/upscale'

export const maxDuration = 120   // Upscaling can take up to 90s

/**
 * POST /api/upscale
 * Body: { imageUrl: string }
 * Returns: { originalUrl, upscaledUrl, upscaled, durationMs, error? }
 *
 * Used by admin tools for testing, and can be called before order submission
 * for preview. In the production order flow, upscaling happens automatically
 * inside /api/webhooks/stripe before Printify is called.
 */
export async function POST(req: NextRequest) {
  try {
    const { imageUrl, sessionFolder } = await req.json()
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })
    }
    const result = await upscaleForPrint(imageUrl, sessionFolder)
    return NextResponse.json({
      originalUrl: imageUrl,
      upscaledUrl: result.url,
      upscaled: result.upscaled,
      durationMs: result.durationMs,
      error: result.error,
    })
  } catch (err: any) {
    console.error('Upscale endpoint error:', err)
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
