import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Your Custom Pet Portrait — Upload & Go',
  description: 'Upload a photo of your pet, choose from our curated fine art portrait library, and get a custom portrait + original song. Delivered to your door in 5-7 days.',
  keywords: ['create pet portrait', 'custom pet portrait upload', 'ai pet portrait', 'pet portrait from photo'],
  alternates: {
    canonical: 'https://petprintsstudio.com/create',
  },
  openGraph: {
    title: 'Create Your Custom Pet Portrait — Upload & Go',
    description: 'Upload a photo of your pet, choose from our curated fine art portrait library, and get a custom portrait + original song. Delivered to your door in 5-7 days.',
    url: 'https://petprintsstudio.com/create',
  },
  twitter: {
    title: 'Create Your Custom Pet Portrait — Upload & Go',
    description: 'Upload a photo of your pet, choose from our curated fine art portrait library, and get a custom portrait + original song. Delivered to your door in 5-7 days.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
