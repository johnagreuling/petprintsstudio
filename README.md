# Meta Pixel + Conversions API — PetPrintsStudio

Full dual-fire tracking (browser Pixel + server CAPI, deduplicated by shared `event_id`). Zero dependencies added — all native Next.js 16 + Node crypto.

Your Pixel ID: `1704826120512446`

---

## 1. Drop files into your repo

Copy these into your project, preserving paths:

```
components/MetaPixel.tsx
lib/fb/event-id.ts
lib/fb/hash.ts
lib/fb/capi.ts
lib/fb/track-client.ts
app/api/fb-capi/route.ts
types/fbq.d.ts
```

If your `tsconfig.json` doesn't already include the `types/` directory, add:

```jsonc
{
  "compilerOptions": {
    // ...
    "typeRoots": ["./node_modules/@types", "./types"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "types/**/*.d.ts"]
}
```

---

## 2. Env vars (Vercel → Project → Settings → Environment Variables)

| Name | Value | Exposure |
|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | `1704826120512446` | Public (ok — this ID is visible in page source anyway) |
| `META_CAPI_ACCESS_TOKEN` | `EAAx...` (from Meta Events Manager → dataset → Settings → Conversions API → Generate access token) | **Secret. Server-only.** |
| `META_CAPI_TEST_EVENT_CODE` | `TEST12345` (from Meta → Test events tab, optional) | Only set during initial testing, remove for production |

Apply to **Production, Preview, and Development** environments. Then redeploy.

---

## 3. Add Pixel to root layout

In `app/layout.tsx`:

```tsx
import MetaPixel from '@/components/MetaPixel'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MetaPixel />
        {children}
      </body>
    </html>
  )
}
```

That handles `PageView` on every route change automatically. Nothing else needed for PageView.

---

## 4. Wire events to your funnel

Use the `track()` helper from any **client component** (`'use client'` at top of file).

### ViewContent — fire on product detail pages

On each of your 25 product pages, e.g. `app/products/[slug]/page.tsx` or wherever the product component lives:

```tsx
'use client'
import { useEffect } from 'react'
import { track } from '@/lib/fb/track-client'

export function ProductPageTracker({ product }: { product: { id: string; name: string; price: number } }) {
  useEffect(() => {
    track('ViewContent', {
      customData: {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'USD',
      },
    })
  }, [product.id, product.name, product.price])

  return null
}
```

Drop `<ProductPageTracker product={product} />` into each product page.

### AddToCart — fire on the Generate+Pick step or "Add to Cart" button

In your existing `/create` flow, wherever the user picks their portrait + size/color + confirms:

```tsx
'use client'
import { track } from '@/lib/fb/track-client'

async function handleAddToCart(selection: { productId: string; variantId: string; price: number; medium: string; size: string }) {
  // your existing add-to-cart logic here
  // ...

  track('AddToCart', {
    customData: {
      content_ids: [selection.variantId],
      content_name: `${selection.medium} ${selection.size}`,
      content_type: 'product',
      value: selection.price,
      currency: 'USD',
    },
  })
}
```

### InitiateCheckout — fire when checkout page loads OR when user clicks "Proceed to checkout"

```tsx
'use client'
import { track } from '@/lib/fb/track-client'

function handleCheckoutClick(cart: { items: Array<{ variantId: string; price: number; qty: number }> }) {
  const totalValue = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const numItems = cart.items.reduce((sum, i) => sum + i.qty, 0)

  track('InitiateCheckout', {
    customData: {
      content_ids: cart.items.map((i) => i.variantId),
      num_items: numItems,
      value: totalValue,
      currency: 'USD',
    },
  })

  // then redirect to Stripe / your checkout
}
```

### Purchase — fire SERVER-SIDE from your Stripe webhook

This is the most important one — **do NOT rely on a browser-side Purchase event** because users often close the tab after Stripe redirects back to success. Fire it from your webhook so it's guaranteed.

In your Stripe webhook handler (wherever it lives, e.g. `app/api/stripe/webhook/route.ts`):

```ts
import { sendCapiEvent } from '@/lib/fb/capi'
import { generateEventId } from '@/lib/fb/event-id'

// Inside your 'checkout.session.completed' handler:
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // ... your existing order creation logic ...

  const orderId = session.id // or your internal order id
  const email = session.customer_details?.email ?? undefined
  const phone = session.customer_details?.phone ?? undefined
  const name = session.customer_details?.name ?? ''
  const [firstName, ...rest] = name.split(' ')
  const lastName = rest.join(' ') || undefined

  await sendCapiEvent({
    eventName: 'Purchase',
    // Use the order id as event_id — idempotent. If Stripe retries the webhook
    // for the same session, Meta dedupes automatically.
    eventId: `purchase_${orderId}`,
    actionSource: 'website',
    eventSourceUrl: session.success_url ?? undefined,
    userData: {
      email,
      phone,
      firstName,
      lastName,
      externalId: session.customer as string | undefined,
      // No fbp/fbc available from webhook context — that's fine, Meta still matches on email
    },
    customData: {
      value: (session.amount_total ?? 0) / 100, // Stripe amounts are in cents
      currency: (session.currency ?? 'usd').toUpperCase(),
      content_ids: [/* populate from line items if you have them */],
      num_items: /* total qty from line items */ 1,
    },
  })
}
```

**Note on dedup for Purchase:** since the browser-side Purchase is unreliable, you can either:
- **Server-only** (recommended): only fire from the webhook. No dedup needed.
- **Dual-fire**: pass the same `event_id` to both sides. On the success page, call `track('Purchase', ...)` passing a known-stable ID (e.g. order id from query param). In the webhook, use `eventId: \`purchase_${orderId}\`` with the same format. Meta dedupes.

Server-only is simpler and just as accurate. Start there.

---

## 5. Test before going live

1. In Vercel env vars, set `META_CAPI_TEST_EVENT_CODE` to a test code from Meta → Events Manager → dataset → **Test events** tab (it looks like `TEST12345`).
2. Redeploy.
3. Open your site in a browser, click through: product → add to cart → checkout.
4. In Meta → Test events panel, you'll see events appearing in real-time with a `(Server)` or `(Browser)` tag. Both should show up for each action.
5. Check the **Deduplication** column — it should say "Deduplicated" for pairs with the same `event_id`. If it says "Not deduplicated," something's wrong with the event_id passthrough.
6. Once you see clean dedupe → **remove `META_CAPI_TEST_EVENT_CODE` env var** and redeploy. Events now flow to production.

---

## 6. Domain verification (do this, it takes 2 min)

In Meta → Business Settings → Brand Safety → Domains → Add `petprintsstudio.com`. Verify via meta tag method: Meta gives you a `<meta name="facebook-domain-verification" content="..." />` tag. Add to `app/layout.tsx`:

```tsx
export const metadata = {
  other: {
    'facebook-domain-verification': 'your-code-here',
  },
}
```

Domain verification unlocks: Aggregated Event Measurement (iOS 14+ users), ability to configure which events are prioritized, and protects you if someone else tries to claim your domain.

---

## 7. What gets tracked where — summary

| Event | Browser Pixel | Server CAPI | Fires from |
|---|---|---|---|
| PageView | ✅ | — | `<MetaPixel />` in layout |
| ViewContent | ✅ | ✅ | Product page useEffect |
| AddToCart | ✅ | ✅ | Add-to-cart handler |
| InitiateCheckout | ✅ | ✅ | Checkout button / checkout page |
| Purchase | — | ✅ | Stripe webhook |

---

## 8. Troubleshooting

**"Events not appearing in Test events panel"**
- Check `NEXT_PUBLIC_META_PIXEL_ID` is set in Vercel and deployment was updated after
- Open browser devtools → Network → filter for `fbevents.js` — should load with 200
- In console, type `fbq` — should return a function, not undefined

**"Browser event fires but CAPI doesn't"**
- Check `META_CAPI_ACCESS_TOKEN` is set (server-side only, no NEXT_PUBLIC_ prefix)
- Check Vercel function logs for `[CAPI]` error lines — most common: expired/revoked token

**"Events show 'Not deduplicated'"**
- Make sure you're using the `track()` helper on both sides, not calling `fbq()` directly with a separate hardcoded event_id
- For Purchase, confirm browser side (if used) and webhook both use `purchase_${orderId}` format

**"Meta blocks my Pixel / Business Manager again"**
- Don't use browser automation on Meta properties. Don't use VPNs when admining the account. Log in from the same device/network consistently for the first few weeks.
