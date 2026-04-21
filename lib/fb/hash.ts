import { createHash } from 'crypto'

/**
 * Meta requires PII fields (email, name, external_id) to be SHA-256 hashed
 * of the lowercased, trimmed value.
 *
 * See: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
export function hashSHA256(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().toLowerCase()
  if (!normalized) return undefined
  return createHash('sha256').update(normalized).digest('hex')
}

/**
 * Phone numbers must be digits-only (including country code) before hashing.
 * "+1 (910) 555-1234" → "19105551234" → sha256 hex
 */
export function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  if (!digits) return undefined
  return createHash('sha256').update(digits).digest('hex')
}
