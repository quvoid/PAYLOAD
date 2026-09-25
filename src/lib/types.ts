// Shapes mirror the planned Payload collections (docs/PLAN.md §3, §12) so the sample
// catalogue in src/data can be swapped for Payload queries without touching pages.

export type Verdict = 'buy' | 'buy-with-caveats' | 'skip' | 'thin-data'
export type Sentiment = 'positive' | 'neutral' | 'negative'
export type SourceId = 'amazon' | 'flipkart' | 'nykaa' | 'brand-store' | 'reddit' | 'youtube'
export type Track = 'night' | 'light'

export interface Source {
  id: SourceId
  name: string
  kind: 'marketplace' | 'brand-store' | 'community' | 'video'
  /** Multiplier applied in the credibility-weighted rating. Brand-owned stores are down-weighted. */
  weight: number
  /** Whether reviews on this source carry a star rating. Reddit threads and YouTube videos don't. */
  hasRatings: boolean
  collection: string
}

export interface Aspect {
  slug: string
  label: string
  /** Question-shaped phrasing used for headings and FAQ. */
  question: string
  /** Topic hub that explains this aspect, if one is published. */
  topic?: string
}

export interface CategoryAspect {
  aspect: string
  weight: number
  /** A deal-breaker aspect with too many negative mentions forces a Skip. */
  dealBreaker?: boolean
}

export interface FAQ {
  q: string
  a: string
}

export interface Category {
  slug: string
  name: string
  /** Silo slug. Undefined means this category is a silo. */
  parent?: string
  tagline: string
  intro: string[]
  aspects: CategoryAspect[]
  valueMetric?: { label: string; basis: number }
  refreshDays: number
  faq: FAQ[]
}

export interface Brand {
  slug: string
  name: string
  about: string[]
  website?: string
  sameAs: string[]
}

export interface Author {
  slug: string
  name: string
  role: string
  bio: string[]
  credentials: string
}

export interface Offer {
  source: SourceId
  price: number
  mrp: number
  inStock: boolean
  checkedAt: string
  url?: string
}

/** Rating and rating count as reported by the platform itself (not what we collected). */
export interface PlatformStat {
  source: SourceId
  rating: number
  total: number
}

export interface Review {
  id: string
  source: SourceId
  rating?: number
  author: string
  date: string
  body: string
  /** The review as written, when it was translated for analysis (Hindi / Hinglish). */
  original?: { text: string; lang: 'hi' | 'hi-Latn' }
  aspects: { aspect: string; sentiment: Sentiment }[]
  verified: boolean
  /** 0–1. Low for bursts of generic 5★ reviews, unverified clusters, and similar signals. */
  credibility: number
  url?: string
}

/** A pro or con. Wording is editorial; every number shown next to it is computed from reviews. */
export interface Claim {
  aspect: string
  sentiment: 'positive' | 'negative'
  text: string
}

export interface Product {
  slug: string
  name: string
  shortName: string
  brand: string
  category: string
  variant: string
  verdict: Verdict
  /** Answer-first paragraph, ≤320 chars. */
  answer: string
  verdictBody: string[]
  claims: Claim[]
  faq: FAQ[]
  specs: { label: string; value: string }[]
  /** Units the category's value metric is priced against (g of protein, ml of product). */
  valueQuantity: number
  offers: Offer[]
  platformStats: PlatformStat[]
  reviews: Review[]
  author: string
  publishedAt: string
  updatedAt: string
}

export interface BestOf {
  slug: string
  title: string
  category: string
  /** Every best-of carries a qualifier so it never competes with its own category hub. */
  qualifier: string
  intro: string[]
  rule: { maxPrice?: number; aspect?: string }
  faq: FAQ[]
}

/** Head-to-head pair. Pairs are chosen by an editor. */
export interface PairComparison {
  slug: string
  category: string
  products: [string, string]
  judgement: string[]
  pickIf: Record<string, string>
}

export interface Topic {
  slug: string
  aspect: string
  silo: string
  title: string
  explainer: string[]
  faq: FAQ[]
}
