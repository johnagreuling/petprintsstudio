#!/usr/bin/env python3
"""Install complete OG/Twitter metadata + Schema.org structured data."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAYOUT = 'app/layout.tsx'
path = os.path.join(ROOT, LAYOUT)

with open(path) as f:
    content = f.read()

if 'facebook-domain-verification' in content or 'metadataBase' in content:
    print('  SKIP  layout.tsx already has OG metadata')
    raise SystemExit(0)

# Replace the simple metadata export with a comprehensive one
old_metadata = re.search(r"export const metadata: Metadata = \{.*?\n\}\n", content, re.DOTALL)
if not old_metadata:
    print('  MISS  could not find metadata export')
    raise SystemExit(1)

new_metadata = """export const metadata: Metadata = {
  metadataBase: new URL('https://petprintsstudio.com'),
  title: {
    default: 'Pet Prints Studio — Custom Pet Portraits With a Song',
    template: '%s | Pet Prints Studio',
  },
  description: 'Custom AI-generated pet portraits printed on fine art canvas, with an original song written about your pet. Upload a photo, pick a style, ship it to your door.',
  keywords: ['pet portrait', 'custom pet portrait', 'dog portrait canvas', 'pet memorial gift', 'ai pet portrait', 'custom pet song', 'personalized pet art'],
  authors: [{ name: 'Pet Prints Studio' }],
  creator: 'Pet Prints Studio',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://petprintsstudio.com',
    siteName: 'Pet Prints Studio',
    title: 'Pet Prints Studio — Custom Pet Portraits With a Song',
    description: 'Custom pet portraits on fine art canvas + an original song about your pet. Upload. Pick a style. Ship to your door.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pet Prints Studio — framed custom pet portrait in a modern living room',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pet Prints Studio — Custom Pet Portraits With a Song',
    description: 'Custom pet portraits + an original song about your pet. Upload a photo, pick a style, we ship it.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: 'https://petprintsstudio.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Schema.org structured data for Google Rich Results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://petprintsstudio.com/#organization',
      name: 'Pet Prints Studio',
      url: 'https://petprintsstudio.com',
      logo: 'https://petprintsstudio.com/icon-512.png',
      description: 'Custom AI-generated pet portraits on fine art canvas, with an original song written about your pet.',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://petprintsstudio.com/#website',
      url: 'https://petprintsstudio.com',
      name: 'Pet Prints Studio',
      publisher: { '@id': 'https://petprintsstudio.com/#organization' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'Product',
      name: 'Custom Pet Portrait on Canvas',
      description: 'Fine art canvas pet portrait in your choice of 8 painterly styles, with an original song written about your pet.',
      image: 'https://petprintsstudio.com/og-image.jpg',
      brand: { '@id': 'https://petprintsstudio.com/#organization' },
      offers: {
        '@type': 'AggregateOffer',
        url: 'https://petprintsstudio.com/create',
        priceCurrency: 'USD',
        lowPrice: '49',
        highPrice: '199',
        availability: 'https://schema.org/InStock',
      },
    },
  ],
}
"""

content = content.replace(old_metadata.group(0), new_metadata)

# Inject the JSON-LD script into the <html> tag in RootLayout
old_html = '<html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>'
new_html = '''<html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>'''

if old_html in content:
    content = content.replace(old_html, new_html, 1)
    print('  OK    JSON-LD injected into <head>')
else:
    print('  WARN  could not find <html> tag — JSON-LD not added')

with open(path, 'w') as f:
    f.write(content)

print('  OK    Full OG/Twitter/icons/Schema metadata installed')
print('')
print('Build check: npm run build')
