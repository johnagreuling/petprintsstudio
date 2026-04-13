import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@/components/Analytics'

export const metadata: Metadata = {
  title: 'Pet Prints Studio — AI Pet Portraits, Printed & Shipped',
  description: 'Upload your pet photo. Choose a canvas size. Get 12 stunning AI-generated portrait styles. We print and ship to your door. Style Transfer or fully personalized Memory Portraits.',
  openGraph: {
    title: 'Pet Prints Studio — AI Pet Portraits',
    description: 'Upload. Generate. Pick. Print. Your pet immortalized as fine art.',
    type: 'website',
    url: 'https://petprintsstudio.com',
  },
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
