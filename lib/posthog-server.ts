import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogClient() {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    })
  }
  return posthogClient
}


/**
 * [I1.1] Defensive wrapper - capture an event but never let a PostHog failure
 * break a money-critical route. If capture throws, we log and swallow.
 */
export async function safeCapture(args: Parameters<PostHog['capture']>[0]) {
  try {
    const client = getPostHogClient()
    client.capture(args)
    await client.flush().catch(e => console.warn('[posthog] flush failed (non-fatal):', e))
  } catch (e) {
    console.warn('[posthog] safeCapture failed (non-fatal):', e)
  }
}
