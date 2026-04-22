import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ — Shipping, Sizes, Photos & Everything Else',
  description: 'Answers to common questions about custom pet portraits: shipping times, sizing, photo requirements, returns, and the custom song included.',
  keywords: ['pet portrait faq', 'pet portrait questions'],
  alternates: {
    canonical: 'https://petprintsstudio.com/faq',
  },
  openGraph: {
    title: 'FAQ — Shipping, Sizes, Photos & Everything Else',
    description: 'Answers to common questions about custom pet portraits: shipping times, sizing, photo requirements, returns, and the custom song included.',
    url: 'https://petprintsstudio.com/faq',
  },
  twitter: {
    title: 'FAQ — Shipping, Sizes, Photos & Everything Else',
    description: 'Answers to common questions about custom pet portraits: shipping times, sizing, photo requirements, returns, and the custom song included.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
