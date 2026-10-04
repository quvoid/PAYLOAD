import { getProduct } from '@/lib/catalog'
import { productMarkdown } from '@/lib/markdown'
import { routes } from '@/lib/routes'
import { absoluteUrl } from '@/lib/seo'
import { ensureCatalog, settings } from '@/lib/store'

// /reviews/<product>.md (rewritten here by next.config.ts): the review as Markdown, for answer
// engines and AI tools. The Link header names the HTML page as canonical, so search engines
// treat this as a copy and rank the page itself.
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ product: string }> }) {
  await ensureCatalog()
  const p = getProduct((await params).product)
  if (!p || p.draft || settings.hideFromSearch) return new Response('Not found', { status: 404 })
  return new Response(productMarkdown(p), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      Link: `<${absoluteUrl(routes.product(p.slug))}>; rel="canonical"`,
      ...(p.verdict === 'thin-data' && { 'X-Robots-Tag': 'noindex' }),
    },
  })
}
