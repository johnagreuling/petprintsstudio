#!/usr/bin/env python3
"""Install Meta Pixel conversion events (Purchase, InitiateCheckout, AddToCart)."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(p):
    with open(os.path.join(ROOT, p)) as f:
        return f.read()

def write(p, content):
    full = os.path.join(ROOT, p)
    bak = full + '.bak.meta'
    if not os.path.exists(bak):
        with open(full) as orig, open(bak, 'w') as b:
            b.write(orig.read())
    with open(full, 'w') as f:
        f.write(content)

# ── Patch 1: Stripe webhook Purchase (server-side, 100% reliable) ──
WEBHOOK = 'app/api/webhooks/stripe/route.ts'
try:
    content = read(WEBHOOK)
    if '[META-CAPI Purchase]' in content:
        print('  SKIP  Purchase: already patched')
    else:
        anchor = "  } catch (err) {\n    console.error('Failed to record order in database:', err)\n  }\n\n  // Build shipping address"
        addition = """  } catch (err) {
    console.error('Failed to record order in database:', err)
  }

  // [META-CAPI Purchase] Server-side event to Meta. Idempotent via event_id.
  try {
    const { sendCapiEvent } = await import('@/lib/fb/capi')
    const _fullName = (customer.name || shipping?.name || '').trim()
    const [_firstName, ..._rest] = _fullName.split(' ')
    await sendCapiEvent({
      eventName: 'Purchase',
      eventId: `purchase_${session.id}`,
      actionSource: 'website',
      eventSourceUrl: session.success_url || 'https://petprintsstudio.com/order-success',
      userData: {
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        firstName: _firstName || undefined,
        lastName: _rest.join(' ') || undefined,
        externalId: (session.customer as string) || session.id,
      },
      customData: {
        value: totalCents / 100,
        currency: (session.currency || 'usd').toUpperCase(),
        content_ids: [meta.primaryProductId].filter(Boolean),
        content_name: `${meta.petName || 'Pet'} ${meta.styleName || 'Portrait'}`,
        content_type: 'product',
        num_items: lineItems.data.length,
      },
    })
    console.log(`Meta Purchase event sent for ${session.id}`)
  } catch (_err) {
    console.error('Meta CAPI Purchase send failed (non-fatal):', _err)
  }

  // Build shipping address"""
        if anchor not in content:
            print('  MISS  Purchase: anchor not found — manual wire needed')
        else:
            write(WEBHOOK, content.replace(anchor, addition, 1))
            print('  OK    Purchase event injected')
except FileNotFoundError:
    print(f'  SKIP  Purchase: {WEBHOOK} not found')

# ── Patch 2: Checkout page InitiateCheckout (browser + CAPI) ──
CHECKOUT = 'app/checkout/[sessionId]/page.tsx'
try:
    content = read(CHECKOUT)
    if '[META-CAPI InitiateCheckout]' in content:
        print('  SKIP  InitiateCheckout: already patched')
    else:
        old_import = "import { PRODUCTS, MEMORY_UPGRADE_PRICE, DIGITAL_BUNDLE_PRICE, ALL_IMAGES_PRICE, PET_SONG_PRICE } from '@/lib/config'"
        new_import = old_import + "\nimport { track as metaTrack } from '@/lib/fb/track-client'"
        old_effect = """  // Default to 16x20 canvas
  useEffect(() => {
    const defaultProduct = PRODUCTS.find(p => p.id === 'canvas_16x20')
    if (defaultProduct) setPrimaryProduct(defaultProduct)
  }, [])"""
        new_effect = old_effect + """

  // [META-CAPI InitiateCheckout] fire once when page loads with valid data
  const [firedInitCheckout, setFiredInitCheckout] = useState(false)
  useEffect(() => {
    if (!imageUrl || !primaryProduct || firedInitCheckout) return
    setFiredInitCheckout(true)
    metaTrack('InitiateCheckout', {
      customData: {
        value: primaryProduct.price + (isMemory ? MEMORY_UPGRADE_PRICE : 0),
        currency: 'USD',
        content_ids: [primaryProduct.id],
        content_name: `${petName || 'Pet'} ${styleName}`,
        content_type: 'product',
        num_items: 1,
      },
    })
  }, [imageUrl, primaryProduct, isMemory, petName, styleName, firedInitCheckout])"""
        if old_import not in content:
            print('  MISS  InitiateCheckout: import anchor not found')
        elif old_effect not in content:
            print('  MISS  InitiateCheckout: useEffect anchor not found')
        else:
            new = content.replace(old_import, new_import, 1).replace(old_effect, new_effect, 1)
            write(CHECKOUT, new)
            print('  OK    InitiateCheckout event injected')
except FileNotFoundError:
    print(f'  SKIP  InitiateCheckout: {CHECKOUT} not found')

# ── Patch 3: Create page AddToCart (next to existing posthog hook) ──
CREATE = 'app/create/page.tsx'
try:
    content = read(CREATE)
    if '[META-CAPI AddToCart]' in content:
        print('  SKIP  AddToCart: already patched')
    else:
        old_import = "import posthog from 'posthog-js'"
        new_import = old_import + "\nimport { track as metaTrack } from '@/lib/fb/track-client'"
        anchor = "posthog.capture('portrait_added_to_cart', { product_id: p.id, product_name: p.name, product_category: p.category, unit_price: p.price, quantity: qty, style_name: picked.styleName });"
        addition = anchor + " metaTrack('AddToCart', /* [META-CAPI AddToCart] */ { customData: { content_ids: [p.id], content_name: p.name, content_type: 'product', value: p.price * qty, currency: 'USD', num_items: qty } });"
        if old_import not in content:
            print('  MISS  AddToCart: posthog import anchor not found')
        elif anchor not in content:
            print('  MISS  AddToCart: posthog.capture anchor not found')
        else:
            new = content.replace(old_import, new_import, 1).replace(anchor, addition, 1)
            write(CREATE, new)
            print('  OK    AddToCart event injected')
except FileNotFoundError:
    print(f'  SKIP  AddToCart: {CREATE} not found')

print('')
print('Done. Review: git diff')
print('Build check: npm run build')
