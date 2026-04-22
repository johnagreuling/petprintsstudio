import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping & Returns — Fast US Shipping',
  description: 'Ships in 5-7 business days within the US. 30-day satisfaction guarantee. Details on our shipping and return policy.',
  keywords: ['pet portrait shipping', 'pet portrait returns'],
  alternates: {
    canonical: 'https://petprintsstudio.com/shipping',
  },
  openGraph: {
    title: 'Shipping & Returns — Fast US Shipping',
    description: 'Ships in 5-7 business days within the US. 30-day satisfaction guarantee. Details on our shipping and return policy.',
    url: 'https://petprintsstudio.com/shipping',
  },
  twitter: {
    title: 'Shipping & Returns — Fast US Shipping',
    description: 'Ships in 5-7 business days within the US. 30-day satisfaction guarantee. Details on our shipping and return policy.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
