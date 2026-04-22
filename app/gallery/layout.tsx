import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pet Portrait Gallery — Real Customer Portraits',
  description: 'Real pet portraits from real customers. Browse our gallery of custom canvas paintings — dogs, cats, and every pet in between.',
  keywords: ['pet portrait examples', 'custom pet portrait gallery', 'dog portrait gallery'],
  alternates: {
    canonical: 'https://petprintsstudio.com/gallery',
  },
  openGraph: {
    title: 'Pet Portrait Gallery — Real Customer Portraits',
    description: 'Real pet portraits from real customers. Browse our gallery of custom canvas paintings — dogs, cats, and every pet in between.',
    url: 'https://petprintsstudio.com/gallery',
  },
  twitter: {
    title: 'Pet Portrait Gallery — Real Customer Portraits',
    description: 'Real pet portraits from real customers. Browse our gallery of custom canvas paintings — dogs, cats, and every pet in between.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
