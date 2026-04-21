'use client'

import { generateEventId } from './event-id'

/**
 * Standard Meta events we track on PetPrintsStudio.
 * See: https://developers.facebook.com/docs/meta-pixel/reference#standard-events
 */
export type FbStandardEvent =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Search'
  | 'AddToWishlist'

export type TrackOptions = {
  /** Standard Meta custom_data fields: value, currency, content_ids, content_name, etc. */
  customData?: Record<string, unknown>
  /**
   * User data we have at the moment of the event. Will be hashed server-side.
   * Only include what you actually know — undefined fields are fine.
   */
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    externalId?: string
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export function getFbp(): string | undefined {
  return readCookie('_fbp')
}

export function getFbc(): string | undefined {
  // _fbc cookie is set by Pixel when a user clicks from an FB ad (fbclid param)
  return readCookie('_fbc')
}

/**
 * Fire a tracked event on both browser Pixel and server CAPI with the same
 * event_id so Meta dedups them. Call from any client component.
 *
 * @example
 * track('AddToCart', {
 *   customData: { value: 59, currency: 'USD', content_ids: ['canvas-16x20'] },
 *   userData: { email: user?.email }
 * })
 */
export async function track(eventName: FbStandardEvent | string, options: TrackOptions = {}): Promise<void> {
  const eventId = generateEventId()
  const { customData, userData } = options

  // 1. Browser Pixel — fires immediately via fbq
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, customData, { eventID: eventId })
  }

  // 2. Server CAPI — forwarded through our API route; dedupes via eventId
  try {
    const payload = {
      eventName,
      eventId,
      eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      userData: {
        ...userData,
        fbp: getFbp(),
        fbc: getFbc(),
      },
      customData,
    }

    // keepalive ensures the request still fires if the user navigates away
    // (critical for InitiateCheckout → external checkout redirects)
    await fetch('/api/fb-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch (err) {
    // Browser Pixel already fired — CAPI failure is non-fatal
    console.warn('[fb/track] CAPI forward failed', err)
  }
}
