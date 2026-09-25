import {
  aspects,
  authors,
  bestOf,
  brands,
  categories,
  comparisons,
  drafts,
  products,
  settings,
  sources,
  topics,
} from './store'

import { byFewestProblems, compositeScore, lowestOffer } from './metrics'
import { RULES } from './rules'
import type { BestOf, Category, Product } from './types'

// The read API the pages use, over the catalogue loaded from Payload (store.ts). Every page calls
// `await ensureCatalog()` before using it.

/** The banner at the top of every page, from Site settings in the admin. */
export const banner = () => (settings.showBanner && settings.bannerText ? settings.bannerText : null)

const bySlug =
  <T extends { slug: string }>(list: T[]) =>
  (slug: string) =>
    list.find((x) => x.slug === slug)

export const getProduct = bySlug(products)
export const getCategory = bySlug(categories)
export const getBrand = bySlug(brands)
export const getAuthor = bySlug(authors)
export const getAspect = bySlug(aspects)
export const getBestOf = bySlug(bestOf)
export const getComparison = bySlug(comparisons)
export const getTopic = bySlug(topics)

// Preview mode (a logged-in editor viewing drafts): the latest version, published or not.
export const getProductForPreview = (slug: string) => drafts.products.get(slug) ?? getProduct(slug)
export const getBestOfForPreview = (slug: string) => drafts.bestOf.get(slug) ?? getBestOf(slug)
export const getComparisonForPreview = (slug: string) => drafts.comparisons.get(slug) ?? getComparison(slug)
export const getTopicForPreview = (slug: string) => drafts.topics.get(slug) ?? getTopic(slug)
/** Resolves a product slug in a draft comparison, where one product may not be published yet. */
export const getAnyProduct = (slug: string) => getProduct(slug) ?? drafts.products.get(slug)
export const getSource = (id: string) => sources.find((s) => s.id === id)

export const allProducts = () => products
export const allBrands = () => brands
export const allAuthors = () => authors
export const allSources = () => sources
export const allBestOf = () => bestOf
export const allComparisons = () => comparisons
export const allTopics = () => topics

export const silos = () => categories.filter((c) => !c.parent)
export const leafCategories = () => categories.filter((c) => c.parent)
export const childrenOf = (silo: string) => categories.filter((c) => c.parent === silo)
export const siloOf = (category: Category) =>
  category.parent ? getCategory(category.parent)! : category

/** App categories are free to download and get app wording ("Use it", "Where to get it"). */
export const isApp = (p: Product) => Boolean(getCategory(p.category)?.appCategory)

const byComposite = (a: Product, b: Product) => compositeScore(b) - compositeScore(a)

/** Products in a category, or in every child category when given a silo. Best first. */
export const productsIn = (slug: string) => {
  const slugs = new Set([slug, ...childrenOf(slug).map((c) => c.slug)])
  return products.filter((p) => slugs.has(p.category)).sort(byComposite)
}

/**
 * For menus, listings and the sitemap: only sections and categories with at least one published
 * product. A category an editor has just created stays out of navigation until something is live.
 */
export const listedSilos = () => silos().filter((s) => productsIn(s.slug).length > 0)
export const listedChildren = (silo: string) => childrenOf(silo).filter((c) => productsIn(c.slug).length > 0)

export const productsByBrand = (brand: string) =>
  products.filter((p) => p.brand === brand).sort(byComposite)

export const productsByAuthor = (author: string) =>
  products.filter((p) => p.author === author).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export const recentlyUpdated = (limit: number) =>
  [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit)

/** Same-category products nearest in composite score. Never crosses silos. */
export const alternativesFor = (p: Product) =>
  products
    .filter((q) => q.category === p.category && q !== p && q.verdict !== 'thin-data')
    .sort(
      (a, b) =>
        Math.abs(compositeScore(a) - compositeScore(p)) -
        Math.abs(compositeScore(b) - compositeScore(p)),
    )
    .slice(0, RULES.alternatives)

/** Ranked by rule, so lists regenerate as scores and prices move. Skip and Thin data never rank. */
export const rankBestOf = (list: BestOf) =>
  productsIn(list.category)
    .filter((p) => p.verdict !== 'skip' && p.verdict !== 'thin-data')
    .filter((p) => {
      const price = lowestOffer(p)?.price
      return list.rule.maxPrice === undefined || (price !== undefined && price <= list.rule.maxPrice)
    })
    .sort(list.rule.aspect ? byFewestProblems(list.rule.aspect) : byComposite)

/** Lists for a category, its silo, or (for a silo) any of its children. */
export const bestOfFor = (slug: string) => {
  const related = new Set([slug, getCategory(slug)?.parent, ...childrenOf(slug).map((c) => c.slug)])
  return bestOf.filter((b) => related.has(b.category))
}

export const bestOfListing = (p: Product) =>
  bestOf
    .map((list) => ({ list, rank: rankBestOf(list).indexOf(p) + 1 }))
    .filter((x) => x.rank > 0)

export const comparisonsFor = (productSlug: string) =>
  comparisons.filter((c) => c.products.includes(productSlug))

export const comparisonsIn = (category: string) => {
  const slugs = new Set([category, ...childrenOf(category).map((c) => c.slug)])
  return comparisons.filter((c) => slugs.has(c.category))
}

/** Categories large enough for a whole-category comparison table. */
export const categoryComparisons = () =>
  leafCategories().filter((c) => productsIn(c.slug).length >= RULES.categoryCompareMinProducts)

export const topicsIn = (silo: string) => topics.filter((t) => t.silo === silo)

/** Lowercase, strip punctuation, collapse spaces. Keeps any script, so Hindi queries survive. */
export const normalizeQuery = (s: string) =>
  s.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()

/**
 * Search the catalogue only (docs/README.md §5 — we never scrape live on a search). Products
 * must match every term; if none do, the closest partial matches are returned instead.
 */
export const searchCatalogue = (query: string) => {
  const terms = normalizeQuery(query).split(' ').filter(Boolean)
  if (!terms.length) return { products: [], categories: [], brands: [], exact: true }

  const hits = (text: string) => {
    const hay = normalizeQuery(text)
    return terms.filter((t) => hay.includes(t)).length
  }
  const productText = (p: Product) =>
    [p.name, p.shortName, p.variant, getBrand(p.brand)?.name, getCategory(p.category)?.name].join(' ')

  const scored = products.map((p) => ({ p, n: hits(productText(p)) })).filter((x) => x.n > 0)
  const exact = scored.filter((x) => x.n === terms.length)
  const ranked = (exact.length ? exact : scored).sort((a, b) => b.n - a.n || byComposite(a.p, b.p))

  return {
    products: ranked.map((x) => x.p),
    categories: categories.filter((c) => hits(c.name) === terms.length),
    brands: brands.filter((b) => hits(b.name) === terms.length),
    exact: exact.length > 0 || scored.length === 0,
  }
}
