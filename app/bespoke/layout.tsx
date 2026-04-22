import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bespoke Pet Portraits — Work 1-on-1 With an Artist',
  description: 'Work directly with a human artist for a truly bespoke pet portrait. Hand-painted, fully customized, delivered in 10-14 days.',
  keywords: ['bespoke pet portrait', 'custom commissioned pet portrait', 'hand painted pet portrait'],
  alternates: {
    canonical: 'https://petprintsstudio.com/bespoke',
  },
  openGraph: {
    title: 'Bespoke Pet Portraits — Work 1-on-1 With an Artist',
    description: 'Work directly with a human artist for a truly bespoke pet portrait. Hand-painted, fully customized, delivered in 10-14 days.',
    url: 'https://petprintsstudio.com/bespoke',
  },
  twitter: {
    title: 'Bespoke Pet Portraits — Work 1-on-1 With an Artist',
    description: 'Work directly with a human artist for a truly bespoke pet portrait. Hand-painted, fully customized, delivered in 10-14 days.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
