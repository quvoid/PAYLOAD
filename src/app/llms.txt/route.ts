import { llmsTxt } from '@/lib/markdown'
import { ensureCatalog, settings } from '@/lib/store'

// /llms.txt: an index of the site for AI tools and answer engines (lib/markdown.ts). Google
// ignores it; Perplexity, Claude and others read it. Rebuilt on request, cached briefly.
export const dynamic = 'force-dynamic'

export async function GET() {
  await ensureCatalog()
  if (settings.hideFromSearch) return new Response('Not found', { status: 404 })
  return new Response(llmsTxt(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
  })
}
