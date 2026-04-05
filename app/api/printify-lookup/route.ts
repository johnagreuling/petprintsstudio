import { NextResponse } from 'next/server'

const BLUEPRINT_IDS = [
  { id: 1017, name: 'Canvas Print' },
  { id: 446,  name: 'Fine Art Print' },
  { id: 19,   name: 'Ceramic Mug' },
  { id: 469,  name: 'Sherpa Blanket' },
  { id: 28,   name: 'Throw Pillow' },
  { id: 12,   name: 'T-Shirt' },
  { id: 92,   name: 'Hoodie' },
  { id: 527,  name: 'Canvas Tote' },
  { id: 351,  name: 'Phone Case' },
  { id: 513,  name: 'Dad Hat' },
]

export async function GET() {
  const token = process.env.PRINTIFY_API_TOKEN
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 500 })

  const results: any[] = []

  for (const bp of BLUEPRINT_IDS) {
    try {
      const provRes = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${bp.id}/print_providers.json`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const providers = await provRes.json()
      const provider = providers.find((p: any) => p.id === 1) || providers[0]
      if (!provider) { results.push({ ...bp, error: 'no provider' }); continue }

      const varRes = await fetch(
        `https://api.printify.com/v1/catalog/blueprints/${bp.id}/print_providers/${provider.id}/variants.json`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const varData = await varRes.json()
      const variants = varData.variants || []

      results.push({
        blueprintId: bp.id,
        name: bp.name,
        providerId: provider.id,
        providerName: provider.title,
        variants: variants.slice(0, 15).map((v: any) => ({
          id: v.id,
          title: v.title,
          available: v.is_available,
        }))
      })
    } catch (e: any) {
      results.push({ ...bp, error: e.message })
    }
  }

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' }
  })
}
