import type { MetadataRoute } from 'next'

import {
  allAuthors,
  allBestOf,
  allBrands,
  allComparisons,
  allProducts,
  allTopics,
  categoryComparisons,
  leafCategories,
  productsByBrand,
  productsIn,
  silos,
} from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { absoluteUrl, SITEMAPS } from '@/lib/seo'

// One sitemap per page type (docs/PLAN.md §7), so indexing problems show up per type.
// lastModified comes from content dates, never from build time.

export async function generateSitemaps() {
  return SITEMAPS.map((id) => ({ id }))
}

const latest = (dates: string[]) => dates.sort().at(-1)

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = (await props.id) as (typeof SITEMAPS)[number]
  const entry = (path: string, lastModified?: string) => ({ url: absoluteUrl(path), lastModified })
  const updated = (slugs: string[]) => latest(slugs.map((s) => allProducts().find((p) => p.slug === s)!.updatedAt))

  switch (id) {
    case 'products':
      // Thin-data products are noindex, so they stay out of the sitemap too.
      return allProducts()
        .filter((p) => p.verdict !== 'thin-data')
        .map((p) => entry(routes.product(p.slug), p.updatedAt))
    case 'hubs':
      return [
        entry(routes.home(), latest(allProducts().map((p) => p.updatedAt))),
        ...[...silos(), ...leafCategories()].map((c) =>
          entry(routes.category(c), latest(productsIn(c.slug).map((p) => p.updatedAt))),
        ),
      ]
    case 'lists':
      return [entry(routes.bestIndex()), ...allBestOf().map((b) => entry(routes.best(b.slug), updated(productsIn(b.category).map((p) => p.slug))))]
    case 'comparisons':
      return [
        entry(routes.compareIndex()),
        ...allComparisons().map((c) => entry(routes.compare(c.slug), updated(c.products))),
        ...categoryComparisons().map((c) => entry(routes.compare(c.slug), updated(productsIn(c.slug).map((p) => p.slug)))),
      ]
    case 'brands':
      return allBrands().map((b) => entry(routes.brand(b.slug), latest(productsByBrand(b.slug).map((p) => p.updatedAt))))
    case 'topics':
      return allTopics().map((t) => entry(routes.topic(t.slug)))
    case 'trust':
      return [
        entry(routes.methodology()),
        entry(routes.sources()),
        ...allAuthors().map((a) => entry(routes.author(a.slug))),
      ]
    default:
      return []
  }
}
