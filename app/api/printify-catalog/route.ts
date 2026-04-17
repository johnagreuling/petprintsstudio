import { NextResponse } from 'next/server'

const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN || ''
const BASE = 'https://api.printify.com/v1'

async function getProviders(blueprintId: number) {
  const res = await fetch(`${BASE}/catalog/blueprints/${blueprintId}/print_providers.json`, {
    headers: { Authorization: `Bearer ${PRINTIFY_TOKEN}` },
  })
  if (!res.ok) return []
  return res.json()
}

async function getVariants(blueprintId: number, providerId: number) {
  const res = await fetch(`${BASE}/catalog/blueprints/${blueprintId}/print_providers/${providerId}/variants.json`, {
    headers: { Authorization: `Bearer ${PRINTIFY_TOKEN}` },
  })
  if (!res.ok) return []
  return res.json()
}

export async function GET() {
  if (!PRINTIFY_TOKEN) return NextResponse.json({ error: 'No API token' }, { status: 500 })

  const lookups = [
    { bp: 522, name: 'Velveteen Plush Blanket' },
    { bp: 1126, name: 'Jumbo Mug 20oz' },
    { bp: 12, name: 'Bella Canvas 3001 Tee' },
    { bp: 562, name: 'Pet Bandana' },
    { bp: 1097, name: 'Pet Collar' },
    { bp: 585, name: 'Baby Swaddle Blanket' },
    { bp: 352, name: 'Beach Towel' },
    { bp: 1238, name: 'Canvas Print' },
    { bp: 804, name: 'Fine Art Print' },
    { bp: 1572, name: 'Throw Pillow' },
    { bp: 425, name: '15oz Mug' },
    { bp: 458, name: 'Hoodie' },
    { bp: 553, name: 'Canvas Tote' },
    { bp: 269, name: 'Phone Case' },
  ]

  const results: Record<string, any> = {}

  for (const { bp, name } of lookups) {
    try {
      const providers = await getProviders(bp)
      // Pick first US provider or first available
      const provider = providers[0]
      if (!provider) {
        results[name] = { blueprint: bp, error: 'No providers' }
        continue
      }
      const varData = await getVariants(bp, provider.id)
      const variants = varData.variants || varData
      results[name] = {
        blueprint: bp,
        provider_id: provider.id,
        provider_name: provider.title,
        variant_count: variants.length,
        variants: variants.map((v: any) => ({
          id: v.id,
          title: v.title,
        })),
      }
    } catch (e: any) {
      results[name] = { blueprint: bp, error: e.message }
    }
  }

  return NextResponse.json(results)
}
