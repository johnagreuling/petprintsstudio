import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Pet Portraits, Canvases & Luxury Pet Goods',
  description: 'Browse canvas prints, fine art prints, pillows, and blankets — all featuring custom portraits of your pet. Starting at $49.',
  keywords: ['pet portrait canvas', 'custom pet pillow', 'pet portrait blanket', 'pet gifts'],
  alternates: {
    canonical: 'https://petprintsstudio.com/shop',
  },
  openGraph: {
    title: 'Shop Pet Portraits, Canvases & Luxury Pet Goods',
    description: 'Browse canvas prints, fine art prints, pillows, and blankets — all featuring custom portraits of your pet. Starting at $49.',
    url: 'https://petprintsstudio.com/shop',
  },
  twitter: {
    title: 'Shop Pet Portraits, Canvases & Luxury Pet Goods',
    description: 'Browse canvas prints, fine art prints, pillows, and blankets — all featuring custom portraits of your pet. Starting at $49.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
