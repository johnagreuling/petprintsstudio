// Meta Pixel (fbq) global type declarations
export {}

declare global {
  interface Window {
    fbq?: {
      (command: 'init', pixelId: string, advancedMatching?: Record<string, unknown>): void
      (command: 'track', eventName: string, params?: Record<string, unknown>, options?: { eventID?: string }): void
      (command: 'trackCustom', eventName: string, params?: Record<string, unknown>, options?: { eventID?: string }): void
      (command: 'consent', action: 'grant' | 'revoke'): void
      queue?: unknown[]
      loaded?: boolean
      version?: string
      callMethod?: (...args: unknown[]) => void
      push?: unknown
    }
    _fbq?: Window['fbq']
  }
}
