import type { MetadataRoute } from 'next'

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
