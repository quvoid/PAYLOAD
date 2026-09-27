import {
  allBestOf,
  allComparisons,
  alternativesFor,
  bestOfFor,
  bestOfListing,
  categoryComparisons,
  childrenOf,
  comparisonsFor,
  comparisonsIn,
  getAspect,
  getBestOf,
  getBrand,
  getCategory,
  getComparison,
  getPage,
  getProduct,
  getTag,
  getTopic,
  listedChildren,
  listedSilos,
  productsByAuthor,
  productsByBrand,
  productsIn,
  rankBestOf,
  recentlyUpdated,
  resolveRelated,
  siteNavigation,
  taggedWith,
  topicRanking,
  topicsIn,
} from './catalog'
import { routes } from './routes'
import { SITEMAPS } from './seo'
import { sitemapEntries } from './sitemaps'
import type { Category, RelatedRef } from './types'

// Click depth (docs: site-architecture): how many clicks each indexable page is from the
// homepage, following the links the site actually renders. Keep everything within 3 clicks;
// a page no link reaches at all is an orphan. Shown on the admin dashboard and in `pnpm seo:audit`.

export const MAX_DEPTH = 3

const catPath = (c: Category) => routes.category(c)
const tagPaths = (tags?: string[]) => (tags ?? []).map((t) => routes.tag(t))
const relatedPaths = (refs?: RelatedRef[]) => resolveRelated(refs).map((l) => l.href)

/** Internal links inside a rich text page. */
function richTextLinks(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== 'object') return out
  const n = node as { type?: string; fields?: Record<string, unknown>; children?: unknown[]; root?: unknown }
  if (n.root) return richTextLinks(n.root, out)
  if (n.type === 'link' || n.type === 'autolink') {
    const f = n.fields ?? {}
    if (f.linkType === 'internal') {
      const doc = f.doc as { relationTo?: string; value?: { slug?: string } } | undefined
      const slug = doc?.value?.slug
      if (slug) {
        const map: Record<string, string> = {
          pages: `/${slug}`,
          products: routes.product(slug),
          'best-lists': routes.best(slug),
          comparisons: routes.compare(slug),
          guides: routes.topic(slug),
          brands: routes.brand(slug),
          tags: routes.tag(slug),
        }
        const cat = doc?.relationTo === 'categories' ? getCategory(slug) : undefined
        const path = cat ? catPath(cat) : map[doc?.relationTo ?? '']
        if (path) out.push(path)
      }
    } else if (typeof f.url === 'string' && f.url.startsWith('/')) out.push(f.url)
  }
  for (const c of n.children ?? []) richTextLinks(c, out)
  return out
}

/** Links in the header and footer, which every page has. */
function chrome(): string[] {
  const nav = siteNavigation()
  const header = nav.header.length ? nav.header.map((l) => l.href) : [routes.bestIndex(), routes.compareIndex(), routes.methodology()]
  const footer = nav.footerColumns.length
    ? nav.footerColumns.flatMap((c) => c.links.map((l) => l.href))
    : [routes.methodology(), routes.sources()]
  return [
    routes.home(),
    routes.categories(),
    ...listedSilos().flatMap((s) => [catPath(s), ...listedChildren(s.slug).map(catPath)]),
    ...allBestOf().map((b) => routes.best(b.slug)),
    ...categoryComparisons().map((c) => routes.compare(c.slug)),
    routes.compareIndex(),
    ...header,
    ...footer,
  ]
}

/** The links a page renders in its body, by page type. */
function bodyLinks(path: string): string[] {
  const [first, second] = path.split('/').filter(Boolean)
  if (!first) return [...recentlyUpdated(6).map((p) => routes.product(p.slug)), ...allBestOf().map((b) => routes.best(b.slug))]
  if (first === 'categories') return listedSilos().flatMap((s) => [catPath(s), ...listedChildren(s.slug).map(catPath)])
  if (first === 'best' && !second) return allBestOf().map((b) => routes.best(b.slug))
  if (first === 'compare' && !second)
    return [...allComparisons().map((c) => routes.compare(c.slug)), ...categoryComparisons().map((c) => routes.compare(c.slug))]
  if (first === 'methodology') return [routes.sources()]
  if (first === 'reviews') {
    const p = getProduct(second)
    if (!p) return []
    const cat = getCategory(p.category)
    return [
      ...(cat ? [catPath(cat)] : []),
      routes.brand(p.brand),
      ...(p.author ? [routes.author(p.author)] : []),
      ...tagPaths(p.tags),
      ...relatedPaths(p.related),
      ...alternativesFor(p).map((q) => routes.product(q.slug)),
      ...comparisonsFor(p.slug).map((c) => routes.compare(c.slug)),
      ...bestOfListing(p).map((x) => routes.best(x.list.slug)),
      ...(cat?.aspects ?? []).flatMap((a) => (getAspect(a.aspect)?.topic ? [routes.topic(getAspect(a.aspect)!.topic!)] : [])),
    ]
  }
  if (first === 'best') {
    const b = getBestOf(second)
    return b ? [...rankBestOf(b).map((p) => routes.product(p.slug)), ...tagPaths(b.tags), ...relatedPaths(b.related)] : []
  }
  if (first === 'compare') {
    const c = getComparison(second)
    if (c) return c.products.map((s) => routes.product(s))
    return productsIn(second).map((p) => routes.product(p.slug))
  }
  if (first === 'topics') {
    const t = getTopic(second)
    return t
      ? [...topicRanking(t.silo, t.aspect).map((r) => routes.product(r.product.slug)), ...tagPaths(t.tags), ...relatedPaths(t.related)]
      : []
  }
  if (first === 'tags') {
    const t = getTag(second)
    if (!t) return []
    const w = taggedWith(t.slug)
    return [
      ...w.products.map((p) => routes.product(p.slug)),
      ...w.lists.map((b) => routes.best(b.slug)),
      ...w.guides.map((g) => routes.topic(g.slug)),
      ...w.pages.map((p) => `/${p.slug}`),
    ]
  }
  if (first === 'brands') return getBrand(second) ? productsByBrand(second).map((p) => routes.product(p.slug)) : []
  if (first === 'authors') return productsByAuthor(second).map((p) => routes.product(p.slug))

  const cat = getCategory(second ?? first)
  if (cat && second) {
    return [
      ...productsIn(cat.slug).map((p) => routes.product(p.slug)),
      ...bestOfFor(cat.slug).map((b) => routes.best(b.slug)),
      ...comparisonsIn(cat.slug).map((c) => routes.compare(c.slug)),
      ...(categoryComparisons().includes(cat) ? [routes.compare(cat.slug)] : []),
      ...cat.aspects.flatMap((a) => (getAspect(a.aspect)?.topic ? [routes.topic(getAspect(a.aspect)!.topic!)] : [])),
    ]
  }
  if (cat) {
    return [
      ...childrenOf(cat.slug).map(catPath),
      ...productsIn(cat.slug).slice(0, 12).map((p) => routes.product(p.slug)),
      ...bestOfFor(cat.slug).map((b) => routes.best(b.slug)),
      ...comparisonsIn(cat.slug).map((c) => routes.compare(c.slug)),
      ...topicsIn(cat.slug).map((t) => routes.topic(t.slug)),
    ]
  }
  const page = getPage(first)
  return page ? [...tagPaths(page.tags), ...relatedPaths(page.related), ...richTextLinks(page.content)] : []
}

export interface ClickDepthReport {
  /** Every indexable page with its depth (Infinity when nothing links to it). */
  pages: { path: string; depth: number }[]
  deep: { path: string; depth: number }[]
  orphans: string[]
}

export function clickDepth(): ClickDepthReport {
  const shared = chrome()
  const depth = new Map<string, number>([['/', 0]])
  const queue = ['/']
  while (queue.length) {
    const path = queue.shift()!
    const d = depth.get(path)!
    for (const next of [...shared, ...bodyLinks(path)]) {
      const clean = next.split(/[?#]/)[0].replace(/(.)\/$/, '$1')
      if (!clean.startsWith('/') || depth.has(clean)) continue
      depth.set(clean, d + 1)
      queue.push(clean)
    }
  }
  const indexable = SITEMAPS.flatMap((t) => sitemapEntries(t)).map((e) => new URL(e.url).pathname.replace(/(.)\/$/, '$1'))
  const pages = [...new Set(indexable)].map((path) => ({ path, depth: depth.get(path) ?? Infinity }))
  return {
    pages,
    deep: pages.filter((p) => p.depth > MAX_DEPTH && p.depth !== Infinity),
    orphans: pages.filter((p) => p.depth === Infinity).map((p) => p.path),
  }
}
