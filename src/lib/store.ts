import type { Payload } from 'payload'

import { RESERVED_SEGMENTS } from './routes'
import { RULES } from './rules'
import type {
  Aspect,
  Author,
  BestOf,
  Brand,
  Category,
  FAQ,
  PairComparison,
  Product,
  Review,
  Source,
  SourceId,
  Topic,
} from './types'

// The catalogue the site renders, loaded from Payload. Pages call `await ensureCatalog()` first;
// after that the read functions in catalog.ts and metrics.ts work synchronously on these arrays.
// A counter in the `catalog-state` global moves whenever an editor changes anything, so each
// render costs one tiny query and the full reload happens only after a change.

export const products: Product[] = [] // published only
export const categories: Category[] = []
export const brands: Brand[] = []
export const aspects: Aspect[] = []
export const sources: Source[] = []
export const bestOf: BestOf[] = []
export const comparisons: PairComparison[] = []
export const topics: Topic[] = []
export const authors: Author[] = []

/** The latest version of every document, drafts included. Only preview mode reads these. */
export const drafts = {
  products: new Map<string, Product>(),
  bestOf: new Map<string, BestOf>(),
  comparisons: new Map<string, PairComparison>(),
  topics: new Map<string, Topic>(),
}

export const settings = {
  showBanner: true,
  bannerText: '',
  heroEyebrow: 'Reviews from everywhere · one honest answer',
  heroTitle: 'Should you buy it? Every review, weighed.',
  heroText: '',
  steps: [] as { title: string; body: string }[],
}

export const getPayloadClient = async (): Promise<Payload> => {
  const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
  return getPayload({ config })
}

let loadedVersion = -1
let inflight: Promise<void> | null = null

export async function ensureCatalog(): Promise<void> {
  const payload = await getPayloadClient()
  const state = await payload.findGlobal({ slug: 'catalog-state', depth: 0 })
  const version = state.version ?? 0
  if (version === loadedVersion) return
  inflight ??= load(payload)
    .then(() => {
      loadedVersion = version
    })
    .finally(() => {
      inflight = null
    })
  await inflight
}

// ------------------------------------------------------------------ mapping helpers

type Rel = number | { id: number } | null | undefined
const idOf = (r: Rel) => (r && typeof r === 'object' ? r.id : r) ?? undefined
const paragraphs = (text?: string | null) =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
const faqOf = (rows?: { q: string; a: string }[] | null): FAQ[] => (rows ?? []).map(({ q, a }) => ({ q, a }))
const replace = <T,>(target: T[], items: T[]) => target.splice(0, target.length, ...items)

// Loose shapes for documents read with depth 0 (relationships are ids).
/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = Record<string, any>

async function load(payload: Payload) {
  const all = { pagination: false, depth: 0, sort: 'createdAt' } as const
  const [
    cats,
    asps,
    srcs,
    brs,
    users,
    published,
    latest,
    reviewRows,
    lists,
    listDrafts,
    pairs,
    pairDrafts,
    guides,
    guideDrafts,
    site,
    rules,
  ] = await Promise.all([
    payload.find({ collection: 'categories', ...all }),
    payload.find({ collection: 'aspects', ...all }),
    payload.find({ collection: 'sources', ...all }),
    payload.find({ collection: 'brands', ...all }),
    payload.find({ collection: 'users', ...all }),
    payload.find({ collection: 'products', ...all, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'products', ...all, draft: true }),
    payload.find({
      collection: 'reviews',
      pagination: false,
      depth: 0,
      where: { hidden: { not_equals: true } },
      select: {
        product: true,
        externalId: true,
        source: true,
        rating: true,
        author: true,
        date: true,
        body: true,
        original: true,
        aspects: true,
        verified: true,
        credibility: true,
        sentiment: true,
        url: true,
      },
    }),
    payload.find({ collection: 'best-lists', ...all, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'best-lists', ...all, draft: true }),
    payload.find({ collection: 'comparisons', ...all, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'comparisons', ...all, draft: true }),
    payload.find({ collection: 'guides', ...all, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'guides', ...all, draft: true }),
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.findGlobal({ slug: 'scoring-rules', depth: 0 }),
  ])

  const slugBy = (docs: Doc[]) => new Map(docs.map((d) => [d.id as number, d.slug as string]))
  const catSlug = slugBy(cats.docs)
  const aspectSlug = slugBy(asps.docs)
  const sourceSlug = slugBy(srcs.docs)
  const brandSlug = slugBy(brs.docs)
  const userSlug = slugBy(users.docs)
  const productSlug = slugBy(latest.docs)

  // Scoring rules first: everything downstream reads RULES.
  const r = rules as Doc
  Object.assign(RULES, {
    minEvidencePerClaim: r.minEvidencePerClaim ?? RULES.minEvidencePerClaim,
    confidence: { high: r.minReviewsHigh ?? RULES.confidence.high, medium: r.minReviewsMedium ?? RULES.confidence.medium },
    suspiciousBelow: r.suspiciousBelow ?? RULES.suspiciousBelow,
    verdict: { buy: r.buyScore ?? RULES.verdict.buy, caveats: r.caveatsScore ?? RULES.verdict.caveats },
    dealBreakerProblemRate: r.dealBreakerProblemRate ?? RULES.dealBreakerProblemRate,
    notableConProblemRate: r.notableConProblemRate ?? RULES.notableConProblemRate,
    minMentionsPerAspect: r.minMentionsPerAspect ?? RULES.minMentionsPerAspect,
  })

  const s = site as Doc
  Object.assign(settings, {
    showBanner: s.showBanner ?? true,
    bannerText: s.bannerText ?? '',
    heroEyebrow: s.heroEyebrow || settings.heroEyebrow,
    heroTitle: s.heroTitle || settings.heroTitle,
    heroText: s.heroText ?? '',
    steps: (s.steps ?? []).map((x: Doc) => ({ title: x.title, body: x.body })),
  })

  const topicFor = new Map<string, string>()
  for (const g of guides.docs as Doc[]) topicFor.set(aspectSlug.get(idOf(g.aspect)!)!, g.slug)

  replace(
    sources,
    (srcs.docs as Doc[]).map((d) => ({
      id: d.slug as SourceId,
      name: d.name,
      kind: d.kind,
      weight: d.weight ?? 1,
      hasRatings: Boolean(d.hasRatings),
      collection: d.collection ?? '',
    })),
  )
  replace(
    aspects,
    (asps.docs as Doc[]).map((d) => ({ slug: d.slug, label: d.label, question: d.question, topic: topicFor.get(d.slug) })),
  )
  replace(
    categories,
    (cats.docs as Doc[]).map((d) => ({
      slug: d.slug,
      name: d.name,
      parent: d.parent ? catSlug.get(idOf(d.parent)!) : undefined,
      tagline: d.tagline ?? '',
      intro: paragraphs(d.intro),
      aspects: (d.measures ?? []).map((m: Doc) => ({
        aspect: aspectSlug.get(idOf(m.aspect)!)!,
        weight: m.weight ?? 1,
        dealBreaker: Boolean(m.dealBreaker),
      })),
      valueMetric:
        d.valueMetric?.label && d.valueMetric?.basis ? { label: d.valueMetric.label, basis: d.valueMetric.basis } : undefined,
      appCategory: d.isApp ? d.appCategory || 'UtilitiesApplication' : undefined,
      refreshDays: d.refreshDays ?? 21,
      faq: faqOf(d.faq),
    })),
  )
  for (const c of categories) {
    if (!c.parent && RESERVED_SEGMENTS.has(c.slug)) console.warn(`Category "${c.slug}" clashes with another page.`)
  }
  replace(
    brands,
    (brs.docs as Doc[]).map((d) => ({
      slug: d.slug,
      name: d.name,
      about: paragraphs(d.about),
      website: d.website || undefined,
      sameAs: (d.sameAs ?? []).map((x: Doc) => x.url),
    })),
  )
  replace(
    authors,
    (users.docs as Doc[])
      .filter((d) => d.slug)
      .map((d) => ({ slug: d.slug, name: d.name ?? d.email, role: d.jobTitle || 'Editor', bio: paragraphs(d.bio), credentials: d.credentials ?? '' })),
  )

  // Reviews, grouped by product.
  const reviewsFor = new Map<number, Review[]>()
  for (const d of reviewRows.docs as Doc[]) {
    const list = reviewsFor.get(idOf(d.product)!) ?? []
    list.push({
      // externalId is "<product>:<review id>"; pages anchor reviews by the review id.
      id: d.externalId ? String(d.externalId).split(':').pop()! : String(d.id),
      source: d.source,
      ...(typeof d.rating === 'number' && { rating: d.rating }),
      author: d.author ?? '',
      date: d.date,
      body: d.body,
      ...(d.original && { original: d.original }),
      aspects: Array.isArray(d.aspects) ? d.aspects : [],
      verified: Boolean(d.verified),
      credibility: d.credibility ?? 0.5,
      ...(d.sentiment && { sentiment: d.sentiment }),
      ...(d.url && { url: d.url }),
    })
    reviewsFor.set(idOf(d.product)!, list)
  }

  const toProduct = (d: Doc): Product => ({
    slug: d.slug,
    name: d.name,
    shortName: d.shortName || d.name,
    brand: brandSlug.get(idOf(d.brand)!) ?? '',
    category: catSlug.get(idOf(d.category)!) ?? '',
    variant: d.variant ?? '',
    verdict: 'thin-data', // set below by the rules
    answer: d.answer ?? '',
    verdictBody: paragraphs(d.verdictBody),
    claims: (d.claims ?? []).map((c: Doc) => ({
      aspect: aspectSlug.get(idOf(c.aspect)!)!,
      sentiment: c.sentiment,
      text: c.text,
    })),
    faq: faqOf(d.faq),
    specs: (d.specs ?? []).map((x: Doc) => ({ label: x.label, value: x.value })),
    valueQuantity: d.valueQuantity ?? 0,
    offers: (d.offers ?? []).map((o: Doc) => ({
      source: sourceSlug.get(idOf(o.source)!) as SourceId,
      price: o.price ?? 0,
      mrp: o.mrp ?? o.price ?? 0,
      inStock: o.inStock !== false,
      checkedAt: o.checkedAt ?? d.updatedAt,
      url: o.url || undefined,
    })),
    platformStats: (d.platformStats ?? []).map((x: Doc) => ({
      source: sourceSlug.get(idOf(x.source)!) as SourceId,
      rating: x.rating,
      total: x.total,
    })),
    reviews: (reviewsFor.get(d.id) ?? []).sort((a, b) => b.date.localeCompare(a.date)),
    author: userSlug.get(idOf(d.author)!) ?? '',
    publishedAt: d.approvedAt ?? d.createdAt,
    updatedAt: d.dataUpdatedAt ?? d.updatedAt,
    draft: d._status !== 'published',
    sample: Boolean(d.sample),
  })

  const toList = (d: Doc): BestOf => ({
    slug: d.slug,
    title: d.title,
    category: catSlug.get(idOf(d.category)!) ?? '',
    qualifier: d.qualifier ?? '',
    intro: paragraphs(d.intro),
    rule: {
      ...(d.maxPrice && { maxPrice: d.maxPrice }),
      ...(d.rankBy === 'fewest-problems' && d.aspect && { aspect: aspectSlug.get(idOf(d.aspect)!) }),
    },
    faq: faqOf(d.faq),
  })
  const toPair = (d: Doc): PairComparison => {
    const [a, b] = (d.products ?? []).map((p: Rel) => productSlug.get(idOf(p)!)!)
    return {
      slug: d.slug,
      category: catSlug.get(idOf(d.category)!) ?? '',
      products: [a, b],
      judgement: paragraphs(d.judgement),
      pickIf: Object.fromEntries((d.pickIf ?? []).map((x: Doc) => [productSlug.get(idOf(x.product)!), x.text])),
    }
  }
  const toTopic = (d: Doc): Topic => ({
    slug: d.slug,
    aspect: aspectSlug.get(idOf(d.aspect)!) ?? '',
    silo: catSlug.get(idOf(d.section)!) ?? '',
    title: d.title,
    explainer: paragraphs(d.explainer),
    faq: faqOf(d.faq),
  })

  replace(products, (published.docs as Doc[]).map(toProduct))
  const publishedSlugs = new Set(products.map((p) => p.slug))
  replace(bestOf, (lists.docs as Doc[]).map(toList))
  // A head-to-head only goes live once both of its products are published.
  replace(
    comparisons,
    (pairs.docs as Doc[]).map(toPair).filter((c) => c.products.every((s) => publishedSlugs.has(s))),
  )
  replace(topics, (guides.docs as Doc[]).map(toTopic))

  drafts.products = new Map((latest.docs as Doc[]).map((d) => [d.slug, toProduct(d)]))
  drafts.bestOf = new Map((listDrafts.docs as Doc[]).map((d) => [d.slug, toList(d)]))
  drafts.comparisons = new Map((pairDrafts.docs as Doc[]).filter((d) => d.slug).map((d) => [d.slug, toPair(d)]))
  drafts.topics = new Map((guideDrafts.docs as Doc[]).map((d) => [d.slug, toTopic(d)]))

  // Verdicts are never stored: the rules decide them from the reviews, now that everything is loaded.
  const { ruleVerdict } = await import('./metrics')
  for (const p of [...products, ...drafts.products.values()]) p.verdict = ruleVerdict(p)
}
