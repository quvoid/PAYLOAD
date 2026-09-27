/**
 * SEO audit of a running site, against the SEO guides (README → SEO): status codes, robots.txt, the sitemap
 * index, titles/descriptions/canonicals, structured data, share images, security headers, click
 * depth and duplicate titles.
 *
 *   pnpm seo:audit                          # http://localhost:3000
 *   pnpm seo:audit https://reviewlens.in    # production
 *
 * Errors make it exit with code 1 (so it can run in CI); warnings are listed but don't fail.
 */

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const MAX_DEPTH = 3
const errors: string[] = []
const warnings: string[] = []
const err = (m: string) => errors.push(m)
const warn = (m: string) => warnings.push(m)

const get = (url: string) => fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'ReviewLens-SEO-Audit' } })
const pathOf = (url: string) => {
  const u = new URL(url, base)
  return u.pathname.replace(/(.)\/$/, '$1')
}
const attr = (html: string, re: RegExp) => html.match(re)?.[1]?.replace(/&amp;/g, '&').trim()
const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

async function main() {
  // --- robots.txt and sitemaps ----------------------------------------------------------------
  const robots = await get(`${base}/robots.txt`)
  const robotsText = await robots.text()
  if (robots.status !== 200) err(`robots.txt answered ${robots.status}`)
  if (!/^Sitemap: .*\/sitemap\.xml$/m.test(robotsText)) err('robots.txt does not point to /sitemap.xml')
  if (/^Disallow: \/\s*$/m.test(robotsText.split(/User-Agent:/i)[1] ?? '')) warn('robots.txt blocks the whole site for all crawlers (Hide from search engines is on)')

  const index = await get(`${base}/sitemap.xml`)
  if (index.status !== 200) err(`/sitemap.xml answered ${index.status}`)
  const sitemapUrls = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const listed = new Set<string>()
  for (const s of sitemapUrls) {
    const res = await get(s.replace(/^https?:\/\/[^/]+/, base))
    if (res.status !== 200) err(`${s} answered ${res.status}`)
    const urls = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    if (urls.length > 50_000) err(`${s} lists ${urls.length} addresses (limit 50,000)`)
    urls.forEach((u) => listed.add(pathOf(u)))
  }

  // --- crawl from the homepage, as a search engine would ----------------------------------------
  const depth = new Map<string, number>([['/', 0]])
  const queue = ['/']
  const pages = new Map<string, { status: number; html: string; location?: string }>()
  while (queue.length && pages.size < 3000) {
    const path = queue.shift()!
    const res = await get(`${base}${path}`)
    const html = res.status === 200 ? await res.text() : ''
    pages.set(path, { status: res.status, html, location: res.headers.get('location') ?? undefined })
    for (const m of html.matchAll(/<a [^>]*href="([^"#?]+)[^"]*"/g)) {
      const href = decode(m[1])
      if (!href.startsWith('/') || href.startsWith('//')) continue
      if (/^\/(admin|api|search|_next|og)(\/|$)/.test(href)) continue
      const p = pathOf(href)
      if (!depth.has(p)) {
        depth.set(p, depth.get(path)! + 1)
        queue.push(p)
      }
    }
  }
  // Sitemap pages the crawl didn't reach still get checked.
  for (const p of listed) {
    if (!pages.has(p)) {
      const res = await get(`${base}${p}`)
      pages.set(p, { status: res.status, html: res.status === 200 ? await res.text() : '' })
    }
  }

  // --- every page ---------------------------------------------------------------------------------
  const titles = new Map<string, string[]>()
  const descriptions = new Map<string, string[]>()
  for (const [path, page] of pages) {
    if (page.status >= 300 && page.status < 400) {
      if (listed.has(path)) err(`${path} is in a sitemap but redirects (${page.status})`)
      continue
    }
    if (page.status !== 200) {
      if (listed.has(path)) err(`${path} is in a sitemap but answered ${page.status}`)
      else err(`${path} is linked on the site but answered ${page.status}`)
      continue
    }
    const html = page.html
    const robotsMeta = attr(html, /<meta name="robots" content="([^"]+)"/) ?? ''
    const noindex = robotsMeta.includes('noindex')
    if (noindex && listed.has(path)) err(`${path} is in a sitemap but marked noindex`)
    if (noindex) continue
    if (!listed.has(path)) warn(`${path} is indexable but not in any sitemap`)

    const title = decode(attr(html, /<title>([^<]*)<\/title>/) ?? '')
    const desc = decode(attr(html, /<meta name="description" content="([^"]*)"/) ?? '')
    const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/)
    if (!title) err(`${path}: no <title>`)
    else if (title.length > 70) warn(`${path}: title is ${title.length} characters (aim for 50–60)`)
    if (!desc) err(`${path}: no meta description`)
    else if (desc.length > 170) warn(`${path}: description is ${desc.length} characters (aim for up to 160)`)
    if (!canonical) err(`${path}: no canonical link`)
    else if (pathOf(canonical) !== path) warn(`${path}: canonical points elsewhere (${canonical})`)
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length
    if (h1 !== 1) warn(`${path}: ${h1} <h1> headings (expected 1)`)
    if (!/<meta property="og:image" content="[^"]+"/.test(html)) warn(`${path}: no share image (og:image)`)
    titles.set(title, [...(titles.get(title) ?? []), path])
    if (desc) descriptions.set(desc, [...(descriptions.get(desc) ?? []), path])

    // Structured data: valid JSON, one connected page node.
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
    const nodes: Record<string, unknown>[] = []
    for (const b of blocks) {
      try {
        const json = JSON.parse(b)
        nodes.push(...(json['@graph'] ?? [json]))
      } catch {
        err(`${path}: structured data is not valid JSON`)
      }
    }
    const pageNode = nodes.find((n) => String(n['@id'] ?? '').endsWith('#webpage'))
    if (!pageNode) err(`${path}: no WebPage node in the structured data`)
    else if (!(pageNode.isPartOf as { '@id'?: string })?.['@id']?.endsWith('#website')) err(`${path}: WebPage not linked to the WebSite`)
    if (path !== '/' && !nodes.some((n) => n['@type'] === 'BreadcrumbList')) warn(`${path}: no BreadcrumbList`)
    if (!nodes.some((n) => n['@type'] === 'Organization')) err(`${path}: no Organization node`)
    if (path.startsWith('/reviews/')) {
      const product = nodes.find((n) => n['@type'] === 'Product' || n['@type'] === 'SoftwareApplication') as
        | { name?: string; review?: { reviewRating?: unknown } }
        | undefined
      if (!product?.name || !product.review?.reviewRating) err(`${path}: Product/SoftwareApplication without name or review rating`)
    }
    if ((depth.get(path) ?? Infinity) > MAX_DEPTH) {
      if (depth.has(path)) warn(`${path} is ${depth.get(path)} clicks from the homepage (keep within ${MAX_DEPTH})`)
      else err(`${path} is in a sitemap but no page links to it`)
    }
  }
  for (const [t, paths] of titles) if (paths.length > 1) err(`Duplicate title “${t}” on ${paths.join(', ')}`)
  for (const [d, paths] of descriptions) if (paths.length > 1) warn(`Duplicate description on ${paths.join(', ')}: “${d.slice(0, 60)}…”`)

  // --- headers, status codes, share images ---------------------------------------------------------
  const home = await get(`${base}/`)
  for (const h of ['strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'content-security-policy']) {
    if (!home.headers.get(h)) err(`Missing security header: ${h}`)
  }
  if (/preload/.test(home.headers.get('strict-transport-security') ?? '')) warn('HSTS includes preload')
  if (home.headers.get('x-powered-by')) err(`X-Powered-By header exposed: ${home.headers.get('x-powered-by')}`)
  const upper = await get(`${base}/Categories`)
  if (upper.status !== 301) err(`Uppercase address answered ${upper.status} (expected 301 to lowercase)`)
  const missing = await get(`${base}/this-page-does-not-exist-${Date.now()}`)
  if (missing.status !== 404) err(`A missing page answered ${missing.status} (expected 404)`)
  const ogSample = [...pages.values()].map((p) => attr(p.html, /<meta property="og:image" content="([^"]+)"/)).filter(Boolean).slice(0, 5)
  for (const og of ogSample) {
    const res = await get(og!.replace(/^https?:\/\/[^/]+/, base))
    if (res.status !== 200 || !res.headers.get('content-type')?.startsWith('image/')) err(`Share image ${og} answered ${res.status}`)
  }

  // --- report --------------------------------------------------------------------------------------
  const maxDepth = Math.max(...[...depth.entries()].filter(([p]) => pages.get(p)?.status === 200).map(([, d]) => d))
  console.log(`\nSEO audit of ${base}`)
  console.log(`  ${pages.size} pages checked · ${listed.size} in sitemaps (${sitemapUrls.length} files) · deepest page ${maxDepth} clicks\n`)
  for (const e of errors) console.log(`  ✗ ${e}`)
  for (const w of warnings) console.log(`  ! ${w}`)
  console.log(`\n  ${errors.length} errors, ${warnings.length} warnings\n`)
  process.exit(errors.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
