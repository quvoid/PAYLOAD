import type { MetadataRoute } from 'next'

import { absoluteUrl, SITEMAPS } from '@/lib/seo'
import { ensureCatalog, settings } from '@/lib/store'

// Read on every request, so "Hide the whole site from search engines" applies at once.
export const dynamic = 'force-dynamic'

// Mirrors docs/robots.txt. AI search crawlers are deliberately NOT blocked: being cited by
// answer engines is the distribution strategy. Read docs/PLAN.md §7 before adding any bot block.
export default async function robots(): Promise<MetadataRoute.Robots> {
  await ensureCatalog()
  if (settings.hideFromSearch) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/search'] }],
    sitemap: SITEMAPS.map((id) => absoluteUrl(`/sitemap/${id}.xml`)),
  }
}
