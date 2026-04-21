import { NextRequest, NextResponse } from 'next/server'
import { sendCapiEvent, type CapiUserData } from '@/lib/fb/capi'

// Node runtime required for `crypto.createHash` used in hash.ts
export const runtime = 'nodejs'

type IncomingPayload = {
  eventName?: string
  eventId?: string
  eventSourceUrl?: string
  userData?: Partial<CapiUserData>
  customData?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  let body: IncomingPayload
  try {
    body = (await req.json()) as IncomingPayload
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 })
  }

  if (!body.eventName || !body.eventId) {
    return NextResponse.json({ ok: false, reason: 'missing_required_fields' }, { status: 400 })
  }

  // Extract client IP + UA from request — Meta wants these in user_data
  const forwardedFor = req.headers.get('x-forwarded-for')
  const clientIp =
    forwardedFor?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined
  const clientUa = req.headers.get('user-agent') || undefined

  const result = await sendCapiEvent({
    eventName: body.eventName,
    eventId: body.eventId,
    eventSourceUrl: body.eventSourceUrl,
    actionSource: 'website',
    userData: {
      email: body.userData?.email,
      phone: body.userData?.phone,
      firstName: body.userData?.firstName,
      lastName: body.userData?.lastName,
      externalId: body.userData?.externalId,
      fbp: body.userData?.fbp,
      fbc: body.userData?.fbc,
      clientIpAddress: clientIp,
      clientUserAgent: clientUa,
    },
    customData: body.customData,
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
