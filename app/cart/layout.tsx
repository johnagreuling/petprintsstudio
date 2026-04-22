import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Cart',
  description: 'Review your selection and proceed to checkout.',
  alternates: {
    canonical: 'https://petprintsstudio.com/cart',
  },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Your Cart',
    description: 'Review your selection and proceed to checkout.',
    url: 'https://petprintsstudio.com/cart',
  },
  twitter: {
    title: 'Your Cart',
    description: 'Review your selection and proceed to checkout.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
