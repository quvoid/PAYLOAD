import type { MetadataRoute } from 'next'

import { absoluteUrl, SITEMAPS } from '@/lib/seo'

// Mirrors docs/robots.txt. AI search crawlers are deliberately NOT blocked: being cited by
// answer engines is the distribution strategy. Read docs/PLAN.md §7 before adding any bot block.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/search'] }],
    sitemap: SITEMAPS.map((id) => absoluteUrl(`/sitemap/${id}.xml`)),
  }
}
