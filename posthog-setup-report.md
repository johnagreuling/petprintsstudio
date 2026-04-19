<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Pet Prints Studio. The setup covers the full customer journey — from the moment a user uploads their pet photo through to order fulfillment — plus post-purchase song engagement. Both client-side and server-side events are instrumented, with error tracking enabled via `capture_exceptions`.

**Files created:**
- `instrumentation-client.ts` — initializes `posthog-js` on the client using Next.js 15.3+ instrumentation with reverse proxy via `/ingest`
- `lib/posthog-server.ts` — singleton `posthog-node` client for server-side route handlers
- `next.config.ts` — updated with `/ingest` rewrites and `skipTrailingSlashRedirect`
- `.env.local` — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` set

**Files edited:**
- `app/create/page.tsx` — 5 events + exception capture
- `app/cart/page.tsx` — 1 event
- `app/order-success/page.tsx` — 1 event
- `app/song/[sessionId]/page.tsx` — 1 event
- `app/api/checkout/route.ts` — 1 server-side event
- `app/api/webhooks/stripe/route.ts` — 1 server-side event

| Event | Description | File |
|-------|-------------|------|
| `photo_uploaded` | User successfully uploads a pet photo | `app/create/page.tsx` |
| `style_selected` | User selects an art style from the picker | `app/create/page.tsx` |
| `portraits_generated` | Generation completes — includes portrait count and style count | `app/create/page.tsx` |
| `generation_failed` | Portrait generation fails (also captured as exception) | `app/create/page.tsx` |
| `portrait_added_to_cart` | Portrait or keepsake product added to cart | `app/create/page.tsx` |
| `checkout_started` | User clicks checkout from the cart page | `app/cart/page.tsx` |
| `order_completed` | Order success page rendered (client-side confirmation) | `app/order-success/page.tsx` |
| `song_played` | Customer plays their custom AI-generated pet song | `app/song/[sessionId]/page.tsx` |
| `checkout_session_created` | Server: Stripe checkout session created successfully | `app/api/checkout/route.ts` |
| `order_fulfilled` | Server: Stripe payment confirmed, Printify order submitted | `app/api/webhooks/stripe/route.ts` |

## Next steps

We've built a dashboard and five insights to track the most important user behaviors:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/388772/dashboard/1485764
- **Creation → Purchase Funnel:** https://us.posthog.com/project/388772/insights/D6upy7fF
- **Daily Orders:** https://us.posthog.com/project/388772/insights/mzutHQN5
- **Most Popular Art Styles:** https://us.posthog.com/project/388772/insights/Xy8l99Qq
- **Checkout Drop-off Rate:** https://us.posthog.com/project/388772/insights/rpv59b5d
- **Song Plays:** https://us.posthog.com/project/388772/insights/XSoftCBz

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
