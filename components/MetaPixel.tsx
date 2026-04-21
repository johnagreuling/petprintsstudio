'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

/**
 * Fires a PageView on every route change *after* the initial load.
 * The first PageView is triggered by the inline init script below.
 */
function RouteChangeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [pathname, searchParams])

  return null
}

/**
 * Drop `<MetaPixel />` inside <body> of app/layout.tsx (as high as possible).
 * Requires NEXT_PUBLIC_META_PIXEL_ID env var; renders nothing if missing
 * (so local dev without the env var doesn't crash).
 */
export default function MetaPixel() {
  if (!PIXEL_ID) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[MetaPixel] NEXT_PUBLIC_META_PIXEL_ID not set — Pixel disabled')
    }
    return null
  }

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
        `}
      </Script>

      {/* noscript fallback — fires PageView for users with JS disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  )
}
