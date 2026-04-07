import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url') || ''
  const size = parseInt(req.nextUrl.searchParams.get('size') || '300')

  if (!url) return NextResponse.json({ error: 'url param required' }, { status: 400 })

  // Use qrserver.com — free, reliable, no npm package needed
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=0A0A0A&bgcolor=F5F0E8&margin=2`
  return NextResponse.redirect(qrUrl, { status: 302 })
}
