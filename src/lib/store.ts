import type { Payload } from 'payload'

import { PAGE_TEXT_DEFAULTS, PAGE_TEXT_KEYS, type PageText, type PageTextKey } from './page-texts'
import { RESERVED_SEGMENTS } from './routes'
import { TEMPLATE_KINDS, type TemplateKind } from './seo-template-kinds'
import { RULES } from './rules'
import type {
  Aspect,
  Author,
  BestOf,
  Brand,
  Category,
  FAQ,
  MediaRef,
  NavLink,
  Page,
  PairComparison,
  RelatedRef,
  Product,
  Review,
  Source,
  Seo,
  SourceId,
  Tag,
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
export const tags: Tag[] = []
export const pages: Page[] = [] // published only
/** Old address → where it now lives. Checked before a page answers "not found". */
export const redirects = new Map<string, { status: 301 | 302 | 410; to?: string }>()

/** The latest version of every document, drafts included. Only preview mode reads these. */
export const drafts = {
  products: new Map<string, Product>(),
  bestOf: new Map<string, BestOf>(),
  comparisons: new Map<string, PairComparison>(),
  topics: new Map<string, Topic>(),
  pages: new Map<string, Page>(),
}

/** Fixed-page wording from Website → Page texts, with the defaults filling any gaps. */
export const pageTexts = Object.fromEntries(
  PAGE_TEXT_KEYS.map((k) => [k, { ...PAGE_TEXT_DEFAULTS[k] }]),
) as Record<PageTextKey, PageText & { shareImage?: MediaRef; noindex?: boolean }>

/** Menu and footer links chosen in Website → Navigation. Empty lists mean "use the standard ones". */
export const navigation = {
  header: [] as NavLink[],
  footerColumns: [] as { title: string; links: NavLink[] }[],
  footerAbout: '',
  footerNote: '',
  footerRight: '',
}

export const settings = {
  showBanner: true,
  bannerText: '',
  heroEyebrow: 'Reviews from everywhere · one honest answer',
  heroTitle: 'Should you buy it? Every review, weighed.',
  heroText: '',
  steps: [] as { title: string; body: string }[],
  hideFromSearch: false,
  metaDescription: '',
  shareImage: undefined as MediaRef | undefined,
  logo: undefined as MediaRef | undefined,
  googleVerification: '',
  bingVerification: '',
  twitterHandle: '',
  socialProfiles: [] as string[],
  gaMeasurementId: '',
  legalName: '',
  contactEmail: '',
  foundingDate: '',
  blockedPaths: [] as string[],
  allowAiSearch: true,
  allowAiTraining: true,
  /** Changes whenever any content changes (catalog-state), for cache-busting share images. */
  contentVersion: 0,
  templates: {} as Partial<Record<TemplateKind, { title?: string; description?: string }>>,
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
      settings.contentVersion = version
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
const urls = (rows?: { url?: string }[] | null) => (rows ?? []).map((r) => r.url).filter((u): u is string => Boolean(u))
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
    mediaDocs,
    tagDocs,
    pageDocs,
    pageDrafts,
    redirectDocs,
    nav,
    texts,
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
    payload.find({ collection: 'media', pagination: false, depth: 0 }),
    payload.find({ collection: 'tags', ...all }),
    // Depth 1 fills in the images and links inside the rich text.
    payload.find({ collection: 'pages', pagination: false, depth: 1, where: { _status: { equals: 'published' } } }),
    payload.find({ collection: 'pages', pagination: false, depth: 1, draft: true }),
    payload.find({ collection: 'redirects', pagination: false, depth: 1 }),
    payload.findGlobal({ slug: 'navigation', depth: 1 }),
    payload.findGlobal({ slug: 'page-texts', depth: 0 }),
  ])

  const slugBy = (docs: Doc[]) => new Map(docs.map((d) => [d.id as number, d.slug as string]))
  const catSlug = slugBy(cats.docs)
  const aspectSlug = slugBy(asps.docs)
  const sourceSlug = slugBy(srcs.docs)
  const brandSlug = slugBy(brs.docs)
  const userSlug = slugBy(users.docs)
  const productSlug = slugBy(latest.docs)
  const tagSlug = slugBy(tagDocs.docs)
  const slugsOf: Record<RelatedRef['kind'], Map<number, string>> = {
    products: productSlug,
    'best-lists': slugBy(listDrafts.docs),
    comparisons: slugBy(pairDrafts.docs),
    guides: slugBy(guideDrafts.docs),
    pages: slugBy(pageDrafts.docs),
  }
  const relatedOf = (list?: { relationTo: RelatedRef['kind']; value: Rel }[] | null): RelatedRef[] =>
    (list ?? []).flatMap((r) => {
      const slug = slugsOf[r.relationTo]?.get(idOf(r.value)!)
      return slug ? [{ kind: r.relationTo, slug }] : []
    })
  const tagsOf = (list: Rel[] | null | undefined) =>
    (list ?? []).map((t) => tagSlug.get(idOf(t)!)).filter((t): t is string => Boolean(t))

  const mediaById = new Map<number, Doc>((mediaDocs.docs as Doc[]).map((d) => [d.id, d]))
  const toMedia = (d: Doc | undefined, size?: string): MediaRef | undefined => {
    if (!d?.url) return undefined
    const sized = size && d.sizes?.[size]?.url ? d.sizes[size] : undefined
    return {
      url: (sized ?? d).url,
      alt: d.alt ?? '',
      width: (sized ?? d).width ?? undefined,
      height: (sized ?? d).height ?? undefined,
      ...(d.caption && { caption: d.caption }),
    }
  }
  const mediaOf = (r: Rel | Doc, size?: string) =>
    toMedia(r && typeof r === 'object' && 'url' in r ? (r as Doc) : mediaById.get(idOf(r as Rel)!), size)
  const seoOf = (meta: Doc | undefined): Seo | undefined => {
    if (!meta) return undefined
    const seo: Seo = {
      ...(meta.title && { title: meta.title }),
      ...(meta.description && { description: meta.description }),
      ...(meta.image && { image: mediaOf(meta.image, 'share') }),
      ...(meta.noindex && { noindex: true }),
      ...(meta.canonical && { canonical: meta.canonical }),
    }
    return Object.keys(seo).length ? seo : undefined
  }

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
    hideFromSearch: Boolean(s.hideFromSearch),
    metaDescription: s.metaDescription ?? '',
    shareImage: mediaOf(s.shareImage, 'share'),
    logo: mediaOf(s.logo),
    googleVerification: s.googleVerification ?? '',
    bingVerification: s.bingVerification ?? '',
    twitterHandle: s.twitterHandle ?? '',
    socialProfiles: (s.socialProfiles ?? []).map((x: Doc) => x.url).filter(Boolean),
    gaMeasurementId: s.gaMeasurementId ?? '',
    legalName: s.legalName ?? '',
    contactEmail: s.contactEmail ?? '',
    foundingDate: s.foundingDate ?? '',
    blockedPaths: (s.blockedPaths ?? []).map((x: Doc) => x.path).filter(Boolean),
    allowAiSearch: s.allowAiSearch !== false,
    allowAiTraining: s.allowAiTraining !== false,
    templates: Object.fromEntries(
      Object.keys(TEMPLATE_KINDS).map((k) => [k, s.templates?.[k.replace('-', '_')] ?? {}]),
    ),
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
    (asps.docs as Doc[]).map((d) => ({
      slug: d.slug,
      label: d.label,
      question: d.question,
      topic: topicFor.get(d.slug),
      sameAs: urls(d.sameAs),
    })),
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
      seo: seoOf(d.meta),
      sameAs: urls(d.sameAs),
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
      seo: seoOf(d.meta),
    })),
  )
  replace(
    authors,
    (users.docs as Doc[])
      .filter((d) => d.slug)
      .map((d) => ({ slug: d.slug, name: d.name ?? d.email, role: d.jobTitle || 'Editor', bio: paragraphs(d.bio), credentials: d.credentials ?? '', sameAs: urls(d.sameAs) })),
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
    seo: seoOf(d.meta),
    tags: tagsOf(d.tags),
    related: relatedOf(d.related),
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
    seo: seoOf(d.meta),
    tags: tagsOf(d.tags),
    related: relatedOf(d.related),
  })
  const toPair = (d: Doc): PairComparison => {
    const [a, b] = (d.products ?? []).map((p: Rel) => productSlug.get(idOf(p)!)!)
    return {
      slug: d.slug,
      category: catSlug.get(idOf(d.category)!) ?? '',
      products: [a, b],
      judgement: paragraphs(d.judgement),
      pickIf: Object.fromEntries((d.pickIf ?? []).map((x: Doc) => [productSlug.get(idOf(x.product)!), x.text])),
      seo: seoOf(d.meta),
    }
  }
  const toTopic = (d: Doc): Topic => ({
    slug: d.slug,
    aspect: aspectSlug.get(idOf(d.aspect)!) ?? '',
    silo: catSlug.get(idOf(d.section)!) ?? '',
    title: d.title,
    explainer: paragraphs(d.explainer),
    faq: faqOf(d.faq),
    seo: seoOf(d.meta),
    tags: tagsOf(d.tags),
    related: relatedOf(d.related),
  })
  const toPage = (d: Doc): Page => ({
    slug: d.slug,
    title: d.title ?? '',
    intro: d.intro ?? '',
    heroImage: mediaOf(d.heroImage, 'card'),
    content: d.content ?? null,
    tags: tagsOf(d.tags),
    related: relatedOf(d.related),
    seo: seoOf(d.meta),
    publishedAt: d.publishedAt ?? d.createdAt,
    updatedAt: d.updatedAt,
    draft: d._status !== 'published',
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
  replace(
    tags,
    (tagDocs.docs as Doc[]).map((d) => ({ slug: d.slug, name: d.name, description: d.description ?? '', seo: seoOf(d.meta) })),
  )
  replace(pages, (pageDocs.docs as Doc[]).map(toPage))

  // Where a document lives, for redirects and editor-chosen links (relationships read at depth 1).
  const docPath = (relationTo: string, d: Doc | undefined): string | undefined => {
    if (!d?.slug) return undefined
    const paths: Record<string, () => string> = {
      pages: () => `/${d.slug}`,
      products: () => `/reviews/${d.slug}`,
      brands: () => `/brands/${d.slug}`,
      'best-lists': () => `/best/${d.slug}`,
      comparisons: () => `/compare/${d.slug}`,
      guides: () => `/topics/${d.slug}`,
      tags: () => `/tags/${d.slug}`,
      categories: () => (d.parent ? `/${catSlug.get(idOf(d.parent)!)}/${d.slug}` : `/${d.slug}`),
    }
    return paths[relationTo]?.()
  }
  redirects.clear()
  for (const d of redirectDocs.docs as Doc[]) {
    if (!d.from) continue
    // 410 Gone: the page was removed on purpose, so search engines drop it faster than a 404.
    if (d.type === '410') {
      redirects.set(d.from, { status: 410 })
      continue
    }
    const to =
      d.to?.type === 'custom' ? d.to.url : docPath(d.to?.reference?.relationTo, d.to?.reference?.value as Doc)
    if (to && to !== d.from) redirects.set(d.from, { status: d.type === '302' ? 302 : 301, to })
  }

  const publishedPages = new Set(pages.map((p) => p.slug))
  const linkOf = (l: Doc): NavLink | undefined => {
    if (l.type === 'custom') return l.url ? { label: l.label, href: l.url, newTab: Boolean(l.newTab) } : undefined
    const page = l.page as Doc | undefined
    return page?.slug && publishedPages.has(page.slug) ? { label: l.label, href: `/${page.slug}` } : undefined
  }
  const links = (list?: Doc[]) => (list ?? []).map(linkOf).filter((l): l is NavLink => Boolean(l))
  for (const key of PAGE_TEXT_KEYS) {
    const t = ((texts as Doc)[key] ?? {}) as Doc
    const d = PAGE_TEXT_DEFAULTS[key]
    pageTexts[key] = {
      ...d,
      heading: t.heading || d.heading,
      intro: t.intro || d.intro,
      title: t.title || d.title,
      description: t.description || d.description,
      shareImage: mediaOf(t.shareImage, 'share'),
      noindex: Boolean(t.noindex),
    }
  }
  const n = nav as Doc
  Object.assign(navigation, {
    header: links(n.headerLinks),
    footerColumns: (n.footerColumns ?? []).map((c: Doc) => ({ title: c.title, links: links(c.links) })),
    footerAbout: n.footerAbout ?? '',
    footerNote: n.footerNote ?? '',
    footerRight: n.footerRight ?? '',
  })

  drafts.products = new Map((latest.docs as Doc[]).map((d) => [d.slug, toProduct(d)]))
  drafts.bestOf = new Map((listDrafts.docs as Doc[]).map((d) => [d.slug, toList(d)]))
  drafts.comparisons = new Map((pairDrafts.docs as Doc[]).filter((d) => d.slug).map((d) => [d.slug, toPair(d)]))
  drafts.topics = new Map((guideDrafts.docs as Doc[]).map((d) => [d.slug, toTopic(d)]))
  drafts.pages = new Map((pageDrafts.docs as Doc[]).filter((d) => d.slug).map((d) => [d.slug, toPage(d)]))

  // Verdicts are never stored: the rules decide them from the reviews, now that everything is loaded.
  const { ruleVerdict } = await import('./metrics')
  for (const p of [...products, ...drafts.products.values()]) p.verdict = ruleVerdict(p)
}
