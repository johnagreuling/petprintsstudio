import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || ''
  const size = parseInt(req.nextUrl.searchParams.get('size') || '300')

  if (!url) return NextResponse.json({ error: 'url param required' }, { status: 400 })

  try {
    // Dynamic import so it doesn't crash build if package missing
    const QRCode = (await import('qrcode')).default
    const pngBuffer: Buffer = await QRCode.toBuffer(url, {
      type: 'png',
      width: size,
      margin: 2,
      color: { dark: '#0A0A0A', light: '#F5F0E8' },
      errorCorrectionLevel: 'M',
    })

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('QR generation error:', err)
    // Fallback: redirect to a QR API if qrcode package not available
    const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`
    return NextResponse.redirect(fallback)
  }
}
