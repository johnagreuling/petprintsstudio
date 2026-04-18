import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@/components/Analytics'

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
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
