import type { Metadata } from 'next'

import { getAuthor, getBrand, getCategory, siloOf } from './catalog'
import { claimEvidence, compositeScore, lowestOffer } from './metrics'
import { routes } from './routes'
import type { PageTextKey } from './page-texts'
import { pageTexts, settings } from './store'
import type { FAQ, MediaRef, Product, Seo } from './types'

export const SITE = {
  name: 'ReviewLens',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_IN',
  description:
    'Every review of a product from across the internet, weighed honestly, with a straight answer on whether to buy it.',
}

export const absoluteUrl = (path: string) => `${SITE.url}${path}`

/** One sitemap per page type (docs/PLAN.md §7). Served at /sitemap/[id].xml. */
export const SITEMAPS = ['products', 'hubs', 'lists', 'comparisons', 'brands', 'topics', 'trust', 'pages'] as const

interface PageMeta {
  title: string
  description: string
  path: string
  noindex?: boolean
  /** The document's SEO tab. Anything filled in there wins over the values above. */
  seo?: Seo
  /** A share image of the page's own, used when the SEO tab has none. */
  image?: MediaRef
  /** The page type's search-result template, filled in (Site settings → Programmatic SEO). */
  templated?: { title?: string; description?: string }
}

/**
 * Canonical, Open Graph, X card and robots for one page. Titles are absolute: the brand is
 * appended here, unless an editor wrote the full title in the SEO tab. Gaps fall back to the
 * defaults in Settings → Site settings → Search engines.
 */
export const pageMetadata = ({ title, description, path, noindex, seo, image, templated }: PageMeta): Metadata => {
  const fullTitle = seo?.title || templated?.title || `${title} | ${SITE.name}`
  const shareTitle = seo?.title || templated?.title || title
  const desc =
    seo?.description || templated?.description || description || settings.metaDescription || SITE.description
  // Editor's SEO image, then the page's own (a page's top image or its generated card), then the default.
  const img = seo?.image ?? image ?? settings.shareImage
  const images = img ? [{ url: img.url, alt: img.alt, width: img.width, height: img.height }] : undefined
  const hidden = noindex || seo?.noindex || settings.hideFromSearch
  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: seo?.canonical || path },
    openGraph: { title: shareTitle, description: desc, url: path, siteName: SITE.name, locale: SITE.locale, type: 'website', images },
    twitter: {
      card: img ? 'summary_large_image' : 'summary',
      title: shareTitle,
      description: desc,
      images: images?.map((i) => i.url),
      ...(settings.twitterHandle && { site: settings.twitterHandle, creator: settings.twitterHandle }),
    },
    // Indexable pages allow full snippets and large image previews in results.
    robots: hidden
      ? { index: false, follow: true }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

/** Metadata for a fixed page, from Website → Page texts. */
export const fixedPageMetadata = (key: PageTextKey, path: string, extra: Partial<PageMeta> = {}): Metadata => {
  const t = pageTexts[key]
  return pageMetadata({
    title: t.title,
    description: t.description,
    path,
    image: t.shareImage,
    noindex: t.noindex,
    ...extra,
  })
}

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
  ...(settings.legalName && { legalName: settings.legalName }),
  ...(settings.foundingDate && { foundingDate: settings.foundingDate.slice(0, 10) }),
  ...(settings.contactEmail && {
    email: settings.contactEmail,
    contactPoint: { '@type': 'ContactPoint', contactType: 'editorial', email: settings.contactEmail },
  }),
  ...(settings.logo && { logo: fullUrl(settings.logo.url) }),
  ...(settings.socialProfiles.length && { sameAs: settings.socialProfiles }),
})

/**
 * The share image made for a page from its own data (src/app/og). `version` changes whenever
 * content does, so link previews pick up a new image instead of a cached old one.
 */
export const ogImage = (kind: string, slug: string, alt: string): MediaRef => ({
  url: `/og/${kind}/${slug}?v=${settings.contentVersion}`,
  alt,
  width: 1200,
  height: 630,
})

/** Uploaded files may be stored with a path or a full address. */
const fullUrl = (url: string) => (url.startsWith('http') ? url : absoluteUrl(url))

// Stable @ids, so the same brand, person or topic is one entity across every page that mentions it.
export const brandId = (slug: string) => `${absoluteUrl(routes.brand(slug))}#brand`
export const personId = (slug: string) => `${absoluteUrl(routes.author(slug))}#person`

/** A topic the page is about, pinned to Wikipedia/Wikidata when the admin has the link. */
export const thingLd = (name: string, sameAs?: string[]) => ({
  '@type': 'Thing',
  name,
  ...(sameAs?.length && { sameAs: sameAs.length === 1 ? sameAs[0] : sameAs }),
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
  const brandNode = {
    '@type': 'Brand',
    '@id': brandId(brand.slug),
    name: brand.name,
    url: absoluteUrl(routes.brand(brand.slug)),
    ...(brand.sameAs.length && { sameAs: brand.sameAs }),
  }
  const category = getCategory(p.category)!
  const offer = lowestOffer(p)
  const prices = p.offers.filter((o) => o.inStock).map((o) => o.price)
  // Apps are described as software (Google's SoftwareApplication review snippets), not products.
  const entity = category.appCategory
    ? {
        '@type': 'SoftwareApplication',
        name: p.name,
        applicationCategory: category.appCategory,
        operatingSystem: 'Android, iOS',
        publisher: { '@type': 'Organization', name: brand.name, ...(brand.sameAs.length && { sameAs: brand.sameAs }) },
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'INR' },
      }
    : {
        '@type': 'Product',
        name: p.name,
        brand: brandNode,
        category: category.name,
        ...(offer && {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: prices.length,
          },
        }),
      }
  return {
    ...entity,
    review: {
      '@type': 'Review',
      author: { '@id': `${SITE.url}/#organization` },
      ...(author && {
        editor: { '@type': 'Person', '@id': personId(author.slug), name: author.name, url: absoluteUrl(routes.author(author.slug)) },
      }),
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

const PAGE_TYPES = new Set(['WebPage', 'CollectionPage', 'ItemPage', 'AboutPage', 'ProfilePage', 'ContactPage'])
const ENTITY_TYPES = new Set(['Product', 'SoftwareApplication', 'Article', 'Brand', 'Person'])

type Node = Record<string, unknown> & { '@type'?: string }

/**
 * One JSON-LD @graph for a page (docs: schema-markup-and-structured-data). Besides the nodes a page
 * passes, it adds the page itself: a WebPage (or CollectionPage, ItemPage, ProfilePage…) with a
 * stable @id, linked to the WebSite, to its BreadcrumbList and to its main entity, so search
 * engines read one connected graph. The page address comes from the breadcrumb's last item, or
 * from a page node's `url` (the home page has no breadcrumb).
 */
export const graph = (...input: object[]) => {
  const nodes = input.map((n) => ({ ...n }) as Node)
  const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList') as
    | (Node & { itemListElement?: { item: string }[] })
    | undefined
  let page = nodes.find((n) => n['@type'] && PAGE_TYPES.has(n['@type']))
  const url = crumbs?.itemListElement?.at(-1)?.item ?? (page?.url as string | undefined)
  if (!url) return { '@context': 'https://schema.org', '@graph': nodes }

  if (crumbs) crumbs['@id'] = `${url}#breadcrumb`
  const main = nodes.find((n) => n['@type'] && ENTITY_TYPES.has(n['@type']))
  if (main && !main['@id']) main['@id'] = `${url}#${String(main['@type']).toLowerCase()}`
  const list = nodes.find((n) => n['@type'] === 'ItemList')
  if (list && !list['@id']) list['@id'] = `${url}#list`

  if (!page) {
    page = { '@type': main?.['@type'] === 'Person' ? 'ProfilePage' : main ? 'ItemPage' : 'WebPage' }
    nodes.unshift(page)
  }
  const subject = main ?? list
  Object.assign(page, {
    '@id': `${url}#webpage`,
    url,
    name: page.name ?? main?.name ?? main?.headline,
    isPartOf: { '@id': `${SITE.url}/#website` },
    inLanguage: 'en-IN',
    ...(crumbs && { breadcrumb: { '@id': crumbs['@id'] } }),
    ...(subject && { mainEntity: { '@id': subject['@id'] } }),
  })
  if (main && ENTITY_TYPES.has(String(main['@type'])) && main['@type'] !== 'Person' && main['@type'] !== 'Brand') {
    main.mainEntityOfPage = { '@id': page['@id'] }
  }
  return { '@context': 'https://schema.org', '@graph': nodes }
}
