import { bestOf, comparisons, topics } from '@/data/editorial'
import { products } from '@/data/products'
import { aspects, authors, brands, categories, sources } from '@/data/taxonomy'

import { aspectStat, compositeScore, lowestOffer } from './metrics'
import { RULES } from './rules'
import type { BestOf, Category, Product } from './types'

// The read API the pages use. Backed by the sample catalogue today; swap the bodies for
// Payload Local API queries once collections exist — page code shouldn't need to change.

/** True while the site is running on fictional sample data. Drives the banner. */
export const SAMPLE_DATA = true

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

const byComposite = (a: Product, b: Product) => compositeScore(b) - compositeScore(a)

/** Products in a category, or in every child category when given a silo. Best first. */
export const productsIn = (slug: string) => {
  const slugs = new Set([slug, ...childrenOf(slug).map((c) => c.slug)])
  return products.filter((p) => slugs.has(p.category)).sort(byComposite)
}

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
    .sort((a, b) =>
      list.rule.aspect
        ? (aspectStat(b, list.rule.aspect)?.score ?? 0) - (aspectStat(a, list.rule.aspect)?.score ?? 0)
        : byComposite(a, b),
    )

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
