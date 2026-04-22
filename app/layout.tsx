import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/components/Analytics'
import { CartProvider } from '@/lib/cart-context'
import MetaPixel from '@/components/MetaPixel'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'block',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'block',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://petprintsstudio.com'),
  title: {
    default: 'Pet Prints Studio — Custom Pet Portraits, Songs & Luxury Goods',
    template: '%s | Pet Prints Studio',
  },
  description: 'Custom portraits, original songs, and fine luxury goods for pet people. Upload your pet, pick a style, get a one-of-a-kind portrait + song shipped to your door.',
  keywords: ['pet portrait', 'custom pet portrait', 'dog portrait canvas', 'pet memorial gift', 'ai pet portrait', 'custom pet song', 'personalized pet art'],
  authors: [{ name: 'Pet Prints Studio' }],
  creator: 'Pet Prints Studio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://petprintsstudio.com',
    siteName: 'Pet Prints Studio',
    title: 'Pet Prints Studio — Custom Pet Portraits, Songs & Luxury Goods',
    description: 'Custom portraits, original songs, and fine luxury goods for pet people.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pet Prints Studio — framed custom pet portrait in a modern living room',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pet Prints Studio — Custom Pet Portraits, Songs & Luxury Goods',
    description: 'Custom portraits, original songs, and fine luxury goods for pet people.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: 'https://petprintsstudio.com',
  },
  other: {
    'fb:app_id': '3303399379822169',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Paste Google Search Console HTML tag content here (e.g. 'abc123xyz')
    google: 'DEWfFcYLe0muMc194CkK15LyMGrKBDKuo5I9JBXfa24',
    // Paste Bing Webmaster verification code here
    other: {
      'msvalidate.01': 'DAF3A09D63E6A5D256D5C68728BA4076',
    },
  },
}

// Schema.org structured data for Google Rich Results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://petprintsstudio.com/#organization',
      name: 'Pet Prints Studio',
      url: 'https://petprintsstudio.com',
      logo: 'https://petprintsstudio.com/icon-512.png',
      description: 'Custom AI-generated pet portraits on fine art canvas, with an original song written about your pet.',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://petprintsstudio.com/#website',
      url: 'https://petprintsstudio.com',
      name: 'Pet Prints Studio',
      publisher: { '@id': 'https://petprintsstudio.com/#organization' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Product',
      name: 'Custom Pet Portrait on Canvas',
      description: 'Fine art canvas pet portrait in your choice of 8 painterly styles, with an original song written about your pet.',
      image: 'https://petprintsstudio.com/og-image.jpg',
      brand: { '@id': 'https://petprintsstudio.com/#organization' },
      offers: {
        '@type': 'AggregateOffer',
        url: 'https://petprintsstudio.com/create',
        priceCurrency: 'USD',
        lowPrice: '49',
        highPrice: '199',
        availability: 'https://schema.org/InStock',
      },
    },
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <MetaPixel />
        <CartProvider>
          {children}
          <Analytics />
        </CartProvider>
      </body>
    </html>
  )
}
