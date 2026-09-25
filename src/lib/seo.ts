import type { Metadata } from 'next'

import { getAuthor, getBrand, getCategory, siloOf } from './catalog'
import { claimEvidence, compositeScore, lowestOffer } from './metrics'
import { routes } from './routes'
import type { FAQ, Product } from './types'

export const SITE = {
  name: 'ReviewLens',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_IN',
  description:
    'Every review of a product from across the internet, weighed honestly, with a straight answer on whether to buy it.',
}

export const absoluteUrl = (path: string) => `${SITE.url}${path}`

/** One sitemap per page type (docs/PLAN.md §7). Served at /sitemap/[id].xml. */
export const SITEMAPS = ['products', 'hubs', 'lists', 'comparisons', 'brands', 'topics', 'trust'] as const

interface PageMeta {
  title: string
  description: string
  path: string
  noindex?: boolean
}

/** Canonical, Open Graph and robots for one page. Titles are absolute: the brand is appended here. */
export const pageMetadata = ({ title, description, path, noindex }: PageMeta): Metadata => ({
  title: { absolute: `${title} | ${SITE.name}` },
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path, siteName: SITE.name, locale: SITE.locale, type: 'website' },
  robots: noindex ? { index: false, follow: true } : undefined,
})

export type Crumb = { name: string; path: string }

export const categoryCrumbs = (slug: string): Crumb[] => {
  const category = getCategory(slug)!
  const silo = siloOf(category)
  const crumbs: Crumb[] = [{ name: 'Home', path: routes.home() }, { name: silo.name, path: routes.category(silo) }]
  if (category !== silo) crumbs.push({ name: category.name, path: routes.category(category) })
  return crumbs
}

export const productCrumbs = (p: Product): Crumb[] => [
  ...categoryCrumbs(p.category),
  { name: p.name, path: routes.product(p.slug) },
]

// JSON-LD builders (docs/PLAN.md §6). Pages combine them into one @graph.

export const organizationLd = () => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  publishingPrinciples: absoluteUrl(routes.methodology()),
})

export const websiteLd = () => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  publisher: { '@id': `${SITE.url}/#organization` },
  inLanguage: 'en-IN',
})

export const breadcrumbLd = (crumbs: Crumb[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
})

export const faqLd = (faq: FAQ[]) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
})

export const itemListLd = (items: { name: string; path: string }[], ordered = true) => ({
  '@type': 'ItemList',
  itemListOrder: ordered ? 'https://schema.org/ItemListOrderAscending' : 'https://schema.org/ItemListUnordered',
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: absoluteUrl(item.path),
  })),
})

const notes = (p: Product, sentiment: 'positive' | 'negative') => ({
  '@type': 'ItemList',
  itemListElement: p.claims
    .filter((c) => c.sentiment === sentiment && claimEvidence(p, c).count > 0)
    .map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.text })),
})

/**
 * Product + our editorial Review. Deliberately no aggregateRating: marketplace ratings are not
 * ours to claim, so they appear only as attributed page content (docs/PLAN.md §6).
 */
export const productReviewLd = (p: Product) => {
  const brand = getBrand(p.brand)!
  const author = getAuthor(p.author)
  const offer = lowestOffer(p)
  const prices = p.offers.filter((o) => o.inStock).map((o) => o.price)
  return {
    '@type': 'Product',
    name: p.name,
    brand: { '@type': 'Brand', name: brand.name },
    category: getCategory(p.category)!.name,
    ...(offer && {
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: prices.length,
      },
    }),
    review: {
      '@type': 'Review',
      author: { '@id': `${SITE.url}/#organization` },
      ...(author && { editor: { '@type': 'Person', name: author.name, url: absoluteUrl(routes.author(author.slug)) } }),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(compositeScore(p).toFixed(1)),
        bestRating: 10,
        worstRating: 0,
      },
      reviewBody: p.answer,
      positiveNotes: notes(p, 'positive'),
      negativeNotes: notes(p, 'negative'),
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
    },
  }
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes })
