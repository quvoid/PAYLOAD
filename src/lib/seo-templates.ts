import {
  getAspect,
  getBestOf,
  getBestOfForPreview,
  getBrand,
  getCategory,
  getComparisonForPreview,
  getPageForPreview,
  getProduct,
  getProductForPreview,
  getTag,
  getTopicForPreview,
  isApp,
  productsByBrand,
  productsIn,
  rankBestOf,
  siloOf,
  taggedCount,
  topicRanking,
} from './catalog'
import { formatINR, formatScore } from './format'
import { compositeScore, countedReviews, lowestOffer } from './metrics'
import type { TemplateKind } from './seo-template-kinds'
import { settings } from './store'
import type { BestOf, Brand, Category, Page, PairComparison, Product, Tag, Topic } from './types'
import { verdictLabel } from './verdict'

// Search-result templates from Site settings → Programmatic SEO, filled in per page. A page's own
// SEO tab wins over these; these win over the standard wording.

export type Templated = { title?: string; description?: string }
type Vars = Record<string, string | number | undefined>

const fill = (template: string | undefined, vars: Vars) =>
  template
    ?.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.])/g, '$1')
    .trim() || undefined

const year = () => new Date().getFullYear()

export function templated(kind: TemplateKind, vars: Vars): Templated {
  const t = settings.templates[kind]
  const all = { year: year(), ...vars }
  return { title: fill(t?.title, all), description: fill(t?.description, all) }
}

export const productTemplated = (p: Product) =>
  templated('products', {
    name: p.name,
    brand: getBrand(p.brand)?.name,
    category: getCategory(p.category)?.name,
    verdict: verdictLabel(p.verdict, isApp(p)),
    score: formatScore(compositeScore(p)),
    reviews: countedReviews(p).length.toLocaleString('en-IN'),
    price: lowestOffer(p) ? formatINR(lowestOffer(p)!.price) : '',
  })

export const categoryTemplated = (c: Category) =>
  templated('categories', { name: c.name, section: siloOf(c).name, count: productsIn(c.slug).length })

export const brandTemplated = (b: Brand) =>
  templated('brands', { name: b.name, count: productsByBrand(b.slug).filter((p) => !p.draft).length })

export const listTemplated = (b: BestOf) => {
  const ranked = rankBestOf(b)
  return templated('best-lists', {
    name: b.title,
    qualifier: b.qualifier,
    category: getCategory(b.category)?.name,
    count: ranked.length,
    top: ranked[0]?.shortName,
  })
}

export const pairTemplated = (c: PairComparison) => {
  const [a, b] = c.products.map((s) => getProduct(s)?.shortName ?? s)
  return templated('comparisons', { a, b, category: getCategory(c.category)?.name })
}

export const guideTemplated = (t: Topic) =>
  templated('guides', {
    name: t.title,
    measure: getAspect(t.aspect)?.label,
    section: getCategory(t.silo)?.name,
    count: topicRanking(t.silo, t.aspect).length,
  })

export const tagTemplated = (t: Tag) => templated('tags', { name: t.name, count: taggedCount(t.slug) })

export const pageTemplated = (p: Page) => templated('pages', { name: p.title })

/** For the admin's "Auto-generate" buttons: the template filled in for the document being edited. */
export function templatedForDoc(collection: string, doc: Record<string, unknown>): Templated {
  const slug = String(doc.slug ?? '')
  switch (collection) {
    case 'products': {
      const p = getProductForPreview(slug)
      return p ? productTemplated(p) : {}
    }
    case 'categories': {
      const c = getCategory(slug)
      return c ? categoryTemplated(c) : {}
    }
    case 'brands': {
      const b = getBrand(slug)
      return b ? brandTemplated(b) : {}
    }
    case 'best-lists': {
      const b = getBestOfForPreview(slug) ?? getBestOf(slug)
      return b ? listTemplated(b) : {}
    }
    case 'comparisons': {
      const c = getComparisonForPreview(slug)
      return c ? pairTemplated(c) : {}
    }
    case 'guides': {
      const t = getTopicForPreview(slug)
      return t ? guideTemplated(t) : {}
    }
    case 'tags': {
      const t = getTag(slug)
      return t ? tagTemplated(t) : {}
    }
    case 'pages': {
      const p = getPageForPreview(slug)
      return p ? pageTemplated(p) : {}
    }
    default:
      return {}
  }
}
