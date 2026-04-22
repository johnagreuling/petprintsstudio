import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '8 Fine Art Portrait Styles — Browse Our Curated Library',
  description: 'From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet\'s portrait. All 8 curated styles included.',
  keywords: ['pet portrait styles', 'oil painting pet portrait', 'watercolor pet portrait', 'pet art styles'],
  alternates: {
    canonical: 'https://petprintsstudio.com/styles',
  },
  openGraph: {
    title: '8 Fine Art Portrait Styles — Browse Our Curated Library',
    description: 'From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet\'s portrait. All 8 curated styles included.',
    url: 'https://petprintsstudio.com/styles',
  },
  twitter: {
    title: '8 Fine Art Portrait Styles — Browse Our Curated Library',
    description: 'From classical oil paintings to modern editorial acrylics, choose the perfect style for your pet\'s portrait. All 8 curated styles included.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
