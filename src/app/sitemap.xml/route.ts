import { absoluteUrl } from '@/lib/seo'
import { sitemapIds, sitemapLastModified } from '@/lib/sitemaps'
import { ensureCatalog, settings } from '@/lib/store'

// The sitemap index (sitemaps.org protocol): one entry per page-type sitemap, each with the date
// its newest page changed. robots.txt points here.
export const dynamic = 'force-dynamic'

export async function GET() {
  await ensureCatalog()
  const ids = settings.hideFromSearch ? [] : sitemapIds()
  const entries = await Promise.all(
    ids.map(async (id) => {
      const lastmod = sitemapLastModified(id)
      return `  <sitemap>\n    <loc>${absoluteUrl(`/sitemap/${id}.xml`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </sitemap>`
    }),
  )
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</sitemapindex>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
