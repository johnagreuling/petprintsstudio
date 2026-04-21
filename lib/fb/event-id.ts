/**
 * Generate a unique event ID used to dedup Meta Pixel (browser) vs
 * Conversions API (server) events. The same eventId must be sent on
 * both sides of a dual-fire for Meta to dedup correctly.
 *
 * See: https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events
 */
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for older runtimes
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}
