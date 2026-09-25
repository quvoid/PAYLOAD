import fs from 'fs'
import path from 'path'

import type { Offer, PlatformStat, Product, Review } from '@/lib/types'

import { editorial } from './editorial'

// Real products collected by pipeline/collect.py and analysed by pipeline/analyse.py — one JSON
// file per product in this folder. They stay drafts until an editor approves them; their verdict
// is set by the site's rules in src/lib/catalog.ts, never stored here.

interface RealData {
  slug: string
  name: string
  shortName: string
  brand: string
  category: string
  collectedAt: string
  platformStats: PlatformStat[]
  offers: Offer[]
  specs: { label: string; value: string }[]
  reviews: (Omit<Review, 'rating' | 'url'> & { rating: number | null; url: string | null })[]
}

const dir = path.join(process.cwd(), 'src', 'data', 'real')

const load = (file: string): Product => {
  const d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as RealData
  const e = editorial[d.slug]
  const collected = d.collectedAt.slice(0, 10)
  return {
    slug: d.slug,
    name: d.name,
    shortName: d.shortName,
    brand: d.brand,
    category: d.category,
    variant: e?.variant ?? '',
    verdict: 'thin-data',
    answer:
      e?.answer ??
      `Draft: the written verdict for ${d.name} hasn't been drafted yet. Every figure on this page is computed from the reviews below.`,
    verdictBody: e?.verdictBody ?? [],
    claims: e?.claims ?? [],
    faq: e?.faq ?? [],
    specs: d.specs.filter((s) => s.value),
    valueQuantity: 0,
    offers: d.offers.map((o) => ({ ...o, url: o.url ?? undefined })),
    platformStats: d.platformStats,
    reviews: d.reviews.map(({ rating, url, ...r }) => ({
      ...r,
      ...(rating !== null && { rating }),
      ...(url && { url }),
    })),
    author: 'omkar',
    publishedAt: collected,
    updatedAt: collected,
    draft: true,
  }
}

export const realProducts: Product[] = fs.existsSync(dir)
  ? fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map(load)
  : []
