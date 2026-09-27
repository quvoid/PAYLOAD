import { sitemapFile, sitemapIds } from '@/lib/sitemaps'
import { ensureCatalog } from '@/lib/store'

// One sitemap per page type at /sitemap/<type>.xml (sitemaps.org protocol), listed by the index at
// /sitemap.xml. Built from src/lib/sitemaps.ts: live, indexable, canonical pages only.
export const dynamic = 'force-dynamic'

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  await ensureCatalog()
  const id = (await params).file.replace(/\.xml$/, '')
  if (!sitemapIds().includes(id)) return new Response('Not found', { status: 404 })
  const urls = sitemapFile(id).map((e) => {
    const lastmod = e.lastModified ? `\n    <lastmod>${new Date(e.lastModified).toISOString()}</lastmod>` : ''
    return `  <url>\n    <loc>${escape(e.url)}</loc>${lastmod}\n  </url>`
  })
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
