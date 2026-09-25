import { aspects, categories, products, sources } from './store'

import { RULES } from './rules'
import type { Aspect, Offer, Product, Review, Sentiment, Source, SourceId, Verdict } from './types'

// Every number the site shows is computed here, from reviews, by code. Nothing in this file is
// written by a model or typed by an editor — that is what makes the numbers citable.

export interface AspectStat {
  aspect: Aspect
  weight: number
  dealBreaker: boolean
  mentions: number
  positive: number
  neutral: number
  negative: number
  /** Share of all counted reviews that mention this aspect. */
  mentionShare: number
  positiveShare: number
  negativeShare: number
  /** Share of ALL counted reviewers who report a problem with this aspect. Drives the verdict. */
  problemRate: number
  /** Enough mentions to judge the aspect at all. */
  scored: boolean
  /** Positive share among the reviews that mention it, 0–10, or null when too few mentions. */
  score: number | null
}

export interface SentimentSplit {
  positive: number
  neutral: number
  negative: number
  total: number
}

const memo = <T,>(fn: (p: Product) => T) => {
  const cache = new WeakMap<Product, T>()
  return (p: Product): T => {
    if (!cache.has(p)) cache.set(p, fn(p))
    return cache.get(p)!
  }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export const sourceById = (id: SourceId): Source => sources.find((s) => s.id === id)!
const categoryOf = (p: Product) => categories.find((c) => c.slug === p.category)!

export const isSuspicious = (r: Review) => r.credibility < RULES.suspiciousBelow

/** Reviews that count toward statistics: everything we collected minus likely manipulation. */
export const countedReviews = memo((p) => p.reviews.filter((r) => !isSuspicious(r)))

export const suspiciousCount = (p: Product) => p.reviews.length - countedReviews(p).length

/** The average shoppers see: each platform's own star rating, weighted by its rating count. */
export const marketplaceAverage = memo((p) => {
  const rated = p.platformStats.filter((s) => sourceById(s.source).kind !== 'brand-store')
  const total = sum(rated.map((s) => s.total))
  const rating = total ? sum(rated.map((s) => s.rating * s.total)) / total : 0
  return { rating, total }
})

/** Our average: every collected star rating, weighted by review credibility and source weight. */
export const weightedRating = memo((p) => {
  const rated = p.reviews.filter((r) => r.rating !== undefined)
  const weights = rated.map((r) => r.credibility * sourceById(r.source).weight)
  const total = sum(weights)
  return total ? sum(rated.map((r, i) => r.rating! * weights[i])) / total : 0
})

export const aspectStats = memo((p): AspectStat[] => {
  const counted = countedReviews(p)
  return categoryOf(p).aspects.map(({ aspect: slug, weight, dealBreaker }) => {
    const tags = counted.flatMap((r) => r.aspects.filter((a) => a.aspect === slug))
    const count = (s: Sentiment) => tags.filter((t) => t.sentiment === s).length
    const [positive, neutral, negative] = [count('positive'), count('neutral'), count('negative')]
    const mentions = tags.length
    return {
      aspect: aspects.find((a) => a.slug === slug)!,
      weight,
      dealBreaker: Boolean(dealBreaker),
      mentions,
      positive,
      neutral,
      negative,
      mentionShare: counted.length ? mentions / counted.length : 0,
      positiveShare: mentions ? positive / mentions : 0,
      negativeShare: mentions ? negative / mentions : 0,
      problemRate: counted.length ? negative / counted.length : 0,
      scored: mentions >= RULES.minMentionsPerAspect,
      score:
        mentions >= RULES.minMentionsPerAspect ? (10 * (positive + neutral / 2)) / mentions : null,
    }
  })
})

export const aspectStat = (p: Product, slug: string) =>
  aspectStats(p).find((s) => s.aspect.slug === slug)

/**
 * Satisfaction score (0–10): how positive all counted reviews are, with neutral counted as half.
 * Problems are judged separately, per aspect, by problem rate.
 */
export const compositeScore = memo((p) => {
  const s = productSentiment(p)
  return 10 * (s.positive + s.neutral / 2)
})

export type Confidence = 'high' | 'medium' | 'low'

export const confidence = (p: Product): Confidence => {
  const n = countedReviews(p).length
  return n >= RULES.confidence.high ? 'high' : n >= RULES.confidence.medium ? 'medium' : 'low'
}

/** Aspects negative enough to turn Buy into Buy with caveats. */
/** Aspects enough reviewers report problems with to turn Buy into Buy with caveats. */
export const notableCons = (p: Product) =>
  aspectStats(p).filter((s) => s.scored && s.problemRate >= RULES.notableConProblemRate)

export const failedDealBreakers = (p: Product) =>
  aspectStats(p).filter((s) => s.dealBreaker && s.scored && s.problemRate >= RULES.dealBreakerProblemRate)

/** Fewer problems first; aspects too thinly discussed to judge sort last. */
export const byFewestProblems = (aspect: string) => (a: Product, b: Product) => {
  const x = aspectStat(a, aspect)
  const y = aspectStat(b, aspect)
  const rate = (s?: AspectStat) => (s && s.scored ? s.problemRate : Number.POSITIVE_INFINITY)
  return rate(x) - rate(y)
}

/** The verdict the rules produce. The model writes prose around it; it never picks it. */
export const ruleVerdict = (p: Product): Verdict => {
  if (confidence(p) === 'low') return 'thin-data'
  if (failedDealBreakers(p).length) return 'skip'
  const score = compositeScore(p)
  if (score < RULES.verdict.caveats) return 'skip'
  if (score >= RULES.verdict.buy && notableCons(p).length === 0) return 'buy'
  return 'buy-with-caveats'
}

export const claimEvidence = (p: Product, claim: { aspect: string; sentiment: Sentiment }) => {
  const counted = countedReviews(p)
  const matches = counted
    .filter((r) => r.aspects.some((a) => a.aspect === claim.aspect && a.sentiment === claim.sentiment))
    .sort((a, b) => b.credibility - a.credibility)
  return { reviews: matches, count: matches.length, share: matches.length / (counted.length || 1) }
}

/**
 * The review to quote under a claim: focused on the claim's aspect, with a star rating that
 * agrees with it, and credible. `exclude` keeps one review from being quoted twice on a page.
 */
export const pickQuote = (
  p: Product,
  claim: { aspect: string; sentiment: Sentiment },
  exclude: Set<string> = new Set(),
) => {
  // Both the stars and the review's overall tone must point the same way as the claim.
  const agrees = (r: Review) =>
    (r.rating === undefined || (claim.sentiment === 'positive' ? r.rating >= 4 : r.rating <= 3)) &&
    (r.sentiment === undefined || r.sentiment === claim.sentiment)
  const fit = (r: Review) => r.credibility - 0.2 * (r.aspects.length - 1) + (agrees(r) ? 0.5 : 0)
  const candidates = claimEvidence(p, claim).reviews.filter((r) => !exclude.has(r.id))
  return candidates.sort((a, b) => fit(b) - fit(a))[0]
}

/** The quoted review for every claim with enough evidence, never quoting one review twice. */
export const claimQuotes = memo((p) => {
  const used = new Set<string>()
  const quotes = new Map<Product['claims'][number], Review>()
  for (const claim of p.claims) {
    const evidence = claimEvidence(p, claim)
    if (evidence.count < RULES.minEvidencePerClaim) continue
    const quote = pickQuote(p, claim, used) ?? evidence.reviews[0]
    used.add(quote.id)
    quotes.set(claim, quote)
  }
  return quotes
})

export const reviewSentiment = (r: Review): Sentiment => {
  if (r.rating !== undefined) return r.rating >= 4 ? 'positive' : r.rating === 3 ? 'neutral' : 'negative'
  if (r.sentiment) return r.sentiment
  const pos = r.aspects.filter((a) => a.sentiment === 'positive').length
  const neg = r.aspects.filter((a) => a.sentiment === 'negative').length
  return pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
}

export const sentimentSplit = (reviews: Review[]): SentimentSplit => {
  const total = reviews.length || 1
  const count = (s: Sentiment) => reviews.filter((r) => reviewSentiment(r) === s).length
  return {
    positive: count('positive') / total,
    neutral: count('neutral') / total,
    negative: count('negative') / total,
    total: reviews.length,
  }
}

export const productSentiment = memo((p) => sentimentSplit(countedReviews(p)))

export const netSentiment = (split: SentimentSplit) => split.positive - split.negative

/**
 * Voice: how much a product is talked about. Marketplaces report their own rating counts, which
 * are far larger than the sample we collect, so we use those; for Reddit and YouTube we count
 * what we collected.
 */
export const voice = memo((p) => {
  const platform = sum(p.platformStats.map((s) => s.total))
  const community = p.reviews.filter((r) => !sourceById(r.source).hasRatings).length
  return platform + community
})

export const positiveVoice = (p: Product) => voice(p) * productSentiment(p).positive

const leafProducts = (category: string) => products.filter((p) => p.category === category)

/** Share of voice within the product's category, and share of positive voice. */
export const shareOfVoice = memo((p) => {
  // A draft being previewed isn't in the published list yet; measure it against its future peers.
  const published = leafProducts(p.category)
  const peers = published.some((q) => q.slug === p.slug) ? published.map((q) => (q.slug === p.slug ? p : q)) : [...published, p]
  const totalVoice = sum(peers.map(voice))
  const totalPositive = sum(peers.map(positiveVoice))
  const rows = peers
    .map((q) => ({
      product: q,
      share: voice(q) / totalVoice,
      positiveShare: positiveVoice(q) / totalPositive,
    }))
    .sort((a, b) => b.share - a.share)
  const own = rows.find((r) => r.product === p)!
  return { share: own.share, positiveShare: own.positiveShare, peers: rows }
})

export const lowestOffer = (p: Product): Offer | undefined =>
  p.offers.filter((o) => o.inStock).sort((a, b) => a.price - b.price)[0]

/** Rupees per the category's value basis (per 100 g protein, per 10 ml). */
export const valueFor = (p: Product): number | undefined => {
  const metric = categoryOf(p).valueMetric
  const offer = lowestOffer(p)
  if (!metric || !offer || p.valueQuantity <= 0) return undefined
  return (offer.price / p.valueQuantity) * metric.basis
}

export const sourcesUsed = memo((p) => {
  const ids = new Set<SourceId>([...p.platformStats.map((s) => s.source), ...p.reviews.map((r) => r.source)])
  return sources.filter((s) => ids.has(s.id))
})

export const reviewsBySource = (p: Product) =>
  sourcesUsed(p)
    .map((source) => {
      const reviews = countedReviews(p).filter((r) => r.source === source.id)
      return { source, count: reviews.length, sentiment: sentimentSplit(reviews) }
    })
    .filter((row) => row.count > 0)
