#!/usr/bin/env python3
"""Install SEO foundation: sitemap.ts, robots.ts, verification meta tag placeholders."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SITEMAP = """import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://petprintsstudio.com'
  const now = new Date()

  // Static routes — add new pages here as they launch
  const routes = [
    { url: '',              changeFrequency: 'weekly' as const,  priority: 1.0 },
    { url: '/create',       changeFrequency: 'weekly' as const,  priority: 0.95 },
    { url: '/shop',         changeFrequency: 'weekly' as const,  priority: 0.9 },
    { url: '/styles',       changeFrequency: 'monthly' as const, priority: 0.85 },
    { url: '/gallery',      changeFrequency: 'weekly' as const,  priority: 0.8 },
    { url: '/bespoke',      changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: '/about',        changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/faq',          changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: '/shipping',     changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: '/cart',         changeFrequency: 'weekly' as const,  priority: 0.4 },
  ]

  return routes.map(r => ({
    url: `${base}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
"""

ROBOTS = """import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/checkout/',
          '/order/',
          '/song/',
          '/order-success',
        ],
      },
    ],
    sitemap: 'https://petprintsstudio.com/sitemap.xml',
    host: 'https://petprintsstudio.com',
  }
}
"""

for rel, body in [('app/sitemap.ts', SITEMAP), ('app/robots.ts', ROBOTS)]:
    path = os.path.join(ROOT, rel)
    if os.path.exists(path):
        print(f'  SKIP  {rel} already exists')
        continue
    with open(path, 'w') as f:
        f.write(body)
    print(f'  OK    created {rel}')

# Patch layout.tsx metadata to include placeholder for Google + Bing verification
layout_path = os.path.join(ROOT, 'app/layout.tsx')
with open(layout_path) as f:
    content = f.read()

if 'verification:' in content:
    print('  SKIP  verification block already in layout.tsx')
else:
    anchor = "  robots: {\n    index: true,\n    follow: true,\n  },\n}"
    addition = """  robots: {
    index: true,
    follow: true,
  },
  verification: {
    // Paste Google Search Console HTML tag content here (e.g. 'abc123xyz')
    google: 'REPLACE_WITH_GOOGLE_VERIFICATION_CODE',
    // Paste Bing Webmaster verification code here
    other: {
      'msvalidate.01': 'REPLACE_WITH_BING_VERIFICATION_CODE',
    },
  },
}"""
    if anchor in content:
        content = content.replace(anchor, addition, 1)
        with open(layout_path, 'w') as f:
            f.write(content)
        print('  OK    verification placeholders added to layout.tsx')
    else:
        print('  MISS  could not find robots anchor in layout.tsx')

print('')
print('Next: npm run build && git push')
