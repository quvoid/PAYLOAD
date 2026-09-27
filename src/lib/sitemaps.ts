import type { MetadataRoute } from 'next'

import {
  allAuthors,
  allBestOf,
  allBrands,
  allComparisons,
  allPages,
  allProducts,
  allTags,
  allTopics,
  categoryComparisons,
  getCategory,
  leafCategories,
  productsByAuthor,
  productsByBrand,
  productsIn,
  silos,
  TAG_INDEX_MIN,
  taggedCount,
  topicRanking,
} from './catalog'
import { routes } from './routes'
import { absoluteUrl, SITEMAPS } from './seo'
import { settings } from './store'
import type { Seo } from './types'

// One sitemap per page type (docs/PLAN.md §7), so indexing problems show up per type. Only live,
// indexable, canonical pages are listed: nothing hidden in its SEO tab, nothing that redirects,
// and no thin pages the site itself marks noindex. lastModified comes from content dates.

export type SitemapType = (typeof SITEMAPS)[number]

/** The sitemaps.org limit per file. A type with more addresses is split: products, products-2… */
export const SITEMAP_LIMIT = 50_000

const latest = (dates: (string | undefined)[]) => dates.filter(Boolean).sort().at(-1) as string | undefined
const listed = (x: { seo?: Seo }) => !x.seo?.noindex && !x.seo?.canonical
const entry = (path: string, lastModified?: string) => ({ url: absoluteUrl(path), lastModified })
const updated = (slugs: string[]) =>
  latest(slugs.map((s) => allProducts().find((p) => p.slug === s)?.updatedAt))

/** Brand and author pages with no published products are thin: noindex, and not listed. */
export const brandIndexable = (slug: string) => productsByBrand(slug).some((p) => !p.draft)
export const authorIndexable = (slug: string) => productsByAuthor(slug).some((p) => !p.draft)

export function sitemapEntries(type: SitemapType): MetadataRoute.Sitemap {
  if (settings.hideFromSearch) return []
  switch (type) {
    case 'products':
      // Thin-data products are noindex, so they stay out too.
      return allProducts()
        .filter((p) => p.verdict !== 'thin-data' && !p.draft && listed(p))
        .map((p) => entry(routes.product(p.slug), p.updatedAt))
    case 'hubs':
      return [
        entry(routes.home(), latest(allProducts().map((p) => p.updatedAt))),
        entry(routes.categories(), latest(allProducts().map((p) => p.updatedAt))),
        ...[...silos(), ...leafCategories()]
          .filter((c) => productsIn(c.slug).length > 0 && listed(c))
          .map((c) => entry(routes.category(c), latest(productsIn(c.slug).map((p) => p.updatedAt)))),
      ]
    case 'lists':
      return [
        entry(routes.bestIndex()),
        ...allBestOf()
          .filter(listed)
          .map((b) => entry(routes.best(b.slug), updated(productsIn(b.category).map((p) => p.slug)))),
      ]
    case 'comparisons':
      return [
        entry(routes.compareIndex()),
        ...allComparisons().filter(listed).map((c) => entry(routes.compare(c.slug), updated(c.products))),
        ...categoryComparisons().map((c) => entry(routes.compare(c.slug), updated(productsIn(c.slug).map((p) => p.slug)))),
      ]
    case 'brands':
      return allBrands()
        .filter((b) => listed(b) && brandIndexable(b.slug))
        .map((b) => entry(routes.brand(b.slug), latest(productsByBrand(b.slug).map((p) => p.updatedAt))))
    case 'topics':
      // A guide with nothing to rank yet is noindex.
      return allTopics()
        .filter((t) => listed(t) && getCategory(t.silo) && topicRanking(t.silo, t.aspect).length > 0)
        .map((t) => entry(routes.topic(t.slug), latest(productsIn(t.silo).map((p) => p.updatedAt))))
    case 'trust':
      return [
        entry(routes.methodology()),
        entry(routes.sources()),
        ...allAuthors()
          .filter((a) => authorIndexable(a.slug))
          .map((a) => entry(routes.author(a.slug), latest(productsByAuthor(a.slug).map((p) => p.updatedAt)))),
      ]
    case 'pages':
      return [
        ...allPages().filter(listed).map((p) => entry(routes.page(p.slug), p.updatedAt)),
        ...allTags()
          .filter((t) => listed(t) && taggedCount(t.slug) >= TAG_INDEX_MIN)
          .map((t) => entry(routes.tag(t.slug))),
      ]
  }
}

/** Every sitemap file: one per type, more when a type passes the 50,000 limit. */
export const sitemapIds = () =>
  SITEMAPS.flatMap((type) => {
    const files = Math.max(1, Math.ceil(sitemapEntries(type).length / SITEMAP_LIMIT))
    return Array.from({ length: files }, (_, i) => (i === 0 ? type : `${type}-${i + 1}`))
  })

/** The addresses in one sitemap file, from its id (products, products-2…). */
export function sitemapFile(id: string): MetadataRoute.Sitemap {
  const [type, part] = id.split(/-(?=\d+$)/) as [SitemapType, string | undefined]
  const page = part ? Number(part) - 1 : 0
  return sitemapEntries(type).slice(page * SITEMAP_LIMIT, (page + 1) * SITEMAP_LIMIT)
}

/** For the sitemap index: when the newest address in a file changed. */
export const sitemapLastModified = (id: string) =>
  latest(sitemapFile(id).map((e) => (e.lastModified ? new Date(e.lastModified).toISOString() : undefined)))
