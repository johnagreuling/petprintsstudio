import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Analytics } from '@/components/Analytics'
import { CartProvider } from '@/lib/cart-context'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pet Prints Studio — AI Pet Portraits, Printed & Shipped',
  description: 'Upload your pet photo. Pick a style from our curated library. Get a stunning AI-generated portrait — printed and shipped to your door. Style Transfer or fully personalized Memory Portraits.',
  openGraph: {
    title: 'Pet Prints Studio — AI Pet Portraits',
    description: 'Upload. Generate. Pick. Print. Your pet immortalized as fine art.',
    type: 'website',
    url: 'https://petprintsstudio.com',
  },
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
      <body>
        <CartProvider>
          {children}
          <Analytics />
        </CartProvider>
      </body>
    </html>
  )
}
