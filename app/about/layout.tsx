import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Pet Prints Studio — Our Story',
  description: 'Built by pet lovers for pet lovers. Learn why we started Pet Prints Studio in Wilmington, NC and how we make every portrait personal.',
  keywords: ['about pet prints studio', 'pet portrait company'],
  alternates: {
    canonical: 'https://petprintsstudio.com/about',
  },
  openGraph: {
    title: 'About Pet Prints Studio — Our Story',
    description: 'Built by pet lovers for pet lovers. Learn why we started Pet Prints Studio in Wilmington, NC and how we make every portrait personal.',
    url: 'https://petprintsstudio.com/about',
  },
  twitter: {
    title: 'About Pet Prints Studio — Our Story',
    description: 'Built by pet lovers for pet lovers. Learn why we started Pet Prints Studio in Wilmington, NC and how we make every portrait personal.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
