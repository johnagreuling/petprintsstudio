import { hashSHA256, hashPhone } from './hash'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
// Optional: set in Vercel env to route events to Meta's Test Events panel
// instead of production. Remove once live.
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE

const GRAPH_API_VERSION = 'v19.0'

export type CapiUserData = {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  externalId?: string // e.g. Stripe customer id, hashed before send
  clientIpAddress?: string
  clientUserAgent?: string
  fbp?: string // _fbp cookie value
  fbc?: string // _fbc cookie value (click ID)
}

export type CapiEventInput = {
  eventName: string
  eventId: string
  eventTime?: number // unix seconds; defaults to now
  eventSourceUrl?: string
  actionSource?: 'website' | 'email' | 'app' | 'chat' | 'other_messaging' | 'phone_call' | 'physical_store' | 'system_generated' | 'business_messaging'
  userData: CapiUserData
  customData?: Record<string, unknown>
}

export type CapiSendResult =
  | { ok: true; response: unknown }
  | { ok: false; reason: 'missing_config' | 'api_error' | 'exception'; details?: unknown }

export async function sendCapiEvent(event: CapiEventInput): Promise<CapiSendResult> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn('[CAPI] Missing NEXT_PUBLIC_META_PIXEL_ID or META_CAPI_ACCESS_TOKEN — event dropped:', event.eventName)
    return { ok: false, reason: 'missing_config' }
  }

  const user_data: Record<string, unknown> = {}
  const u = event.userData

  // Meta expects these as arrays of hashed values
  if (u.email) user_data.em = [hashSHA256(u.email)]
  if (u.phone) user_data.ph = [hashPhone(u.phone)]
  if (u.firstName) user_data.fn = [hashSHA256(u.firstName)]
  if (u.lastName) user_data.ln = [hashSHA256(u.lastName)]
  if (u.externalId) user_data.external_id = [hashSHA256(u.externalId)]

  // These are sent in plain — Meta needs them unhashed
  if (u.clientIpAddress) user_data.client_ip_address = u.clientIpAddress
  if (u.clientUserAgent) user_data.client_user_agent = u.clientUserAgent
  if (u.fbp) user_data.fbp = u.fbp
  if (u.fbc) user_data.fbc = u.fbc

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: event.actionSource ?? 'website',
        user_data,
        custom_data: event.customData,
      },
    ],
  }

  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
    ACCESS_TOKEN
  )}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[CAPI] API error', res.status, json)
      return { ok: false, reason: 'api_error', details: json }
    }
    return { ok: true, response: json }
  } catch (err) {
    console.error('[CAPI] Exception', err)
    return { ok: false, reason: 'exception', details: String(err) }
  }
}
