import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Our Curated Library of Fine Art Pet Portraits',
  description: 'From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet\'s portrait. All 8 curated styles included.',
  keywords: ['pet portrait styles', 'oil painting pet portrait', 'watercolor pet portrait', 'pet art styles'],
  alternates: {
    canonical: 'https://petprintsstudio.com/styles',
  },
  openGraph: {
    title: 'Browse Our Curated Library of Fine Art Pet Portraits',
    description: 'From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet\'s portrait. All 8 curated styles included.',
    url: 'https://petprintsstudio.com/styles',
  },
  twitter: {
    title: 'Browse Our Curated Library of Fine Art Pet Portraits',
    description: 'From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet\'s portrait. All 8 curated styles included.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
