import Link from 'next/link'
import React from 'react'

import { getAspect } from '@/lib/catalog'
import { formatINR, formatPct, formatRating, formatScore } from '@/lib/format'
import {
  aspectStat,
  compositeScore,
  lowestOffer,
  marketplaceAverage,
  netSentiment,
  productSentiment,
  shareOfVoice,
  valueFor,
  weightedRating,
} from '@/lib/metrics'
import { routes } from '@/lib/routes'
import type { Category, Product } from '@/lib/types'

import { VerdictBadge } from './review'

// The measures every comparison uses: stats, sentiment and share of voice. `better` says which
// direction wins; rows without one (share of voice) describe rather than rank.

interface Metric {
  key: string
  label: string
  value: (p: Product) => number | undefined
  format: (n: number) => string
  better?: 'higher' | 'lower'
}

export const compareMetrics = (category: Category): Metric[] => [
  { key: 'score', label: 'Composite score', value: compositeScore, format: (n) => `${formatScore(n)} / 10`, better: 'higher' },
  { key: 'weighted', label: 'Credibility-weighted ★', value: weightedRating, format: formatRating, better: 'higher' },
  { key: 'market', label: 'Marketplace average ★', value: (p) => marketplaceAverage(p).rating, format: formatRating },
  ...(category.valueMetric
    ? [{ key: 'value', label: `₹ ${category.valueMetric.label}`, value: valueFor, format: formatINR, better: 'lower' as const }]
    : []),
  { key: 'sov', label: 'Share of voice', value: (p) => shareOfVoice(p).share, format: formatPct },
  { key: 'psov', label: 'Share of positive voice', value: (p) => shareOfVoice(p).positiveShare, format: formatPct },
  {
    key: 'net',
    label: 'Net sentiment',
    value: (p) => netSentiment(productSentiment(p)),
    format: (n) => `${n >= 0 ? '+' : '−'}${Math.round(Math.abs(n) * 100)}`,
    better: 'higher',
  },
  ...category.aspects.map((a) => ({
    key: `aspect-${a.aspect}`,
    label: getAspect(a.aspect)!.label,
    value: (p: Product) => aspectStat(p, a.aspect)?.score ?? undefined,
    format: formatScore,
    better: 'higher' as const,
  })),
  { key: 'price', label: 'Lowest price', value: (p) => lowestOffer(p)?.price, format: formatINR, better: 'lower' },
]

const winnerOf = (metric: Metric, products: Product[]) => {
  if (!metric.better) return undefined
  const scored = products
    .map((p) => ({ p, v: metric.value(p) }))
    .filter((x): x is { p: Product; v: number } => x.v !== undefined)
  if (scored.length < 2) return undefined
  scored.sort((a, b) => (metric.better === 'higher' ? b.v - a.v : a.v - b.v))
  return scored[0].v === scored[1].v ? undefined : scored[0].p
}

function Cell({ metric, product, winner }: { metric: Metric; product: Product; winner?: Product }) {
  const v = metric.value(product)
  const wins = winner === product
  return (
    <td className={`whitespace-nowrap px-4 py-3 tabular-nums ${wins ? 'text-body-strong' : ''}`}>
      {v === undefined ? <span className="text-shade-50">—</span> : metric.format(v)}
      {wins && (
        <>
          <span aria-hidden className="ml-2 inline-block size-2 rounded-pill bg-pink align-middle" />
          <span className="sr-only"> (better)</span>
        </>
      )}
    </td>
  )
}

/** Two products, measures down the side. */
export function PairTable({ products, category }: { products: Product[]; category: Category }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <caption className="mb-4 text-left text-caption text-shade-60">
          Every measure is computed from reviews. A pink dot marks the better result where one direction is better.
        </caption>
        <thead>
          <tr className="border-b border-hairline">
            <td className="w-[40%]" />
            {products.map((p) => (
              <th key={p.slug} scope="col" className="px-4 py-4 align-bottom">
                <Link href={routes.product(p.slug)} className="text-heading-md underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                  {p.shortName}
                </Link>
                <div className="mt-3">
                  <VerdictBadge verdict={p.verdict} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {compareMetrics(category).map((m) => {
            const winner = winnerOf(m, products)
            return (
              <tr key={m.key} className="border-b border-hairline">
                <th scope="row" className="py-3 pr-4 text-caption font-normal text-shade-60">
                  {m.label}
                </th>
                {products.map((p) => (
                  <Cell key={p.slug} metric={m} product={p} winner={winner} />
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Every product in a category, one row each, measures across. */
export function CategoryTable({ products, category }: { products: Product[]; category: Category }) {
  const metrics = compareMetrics(category)
  return (
    <div className="relative overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full min-w-[1100px] border-collapse text-left text-caption">
        <caption className="sr-only">Every {category.name} product compared on the same measures</caption>
        <thead className="bg-cream">
          <tr>
            <th scope="col" className="sticky left-0 bg-cream px-4 py-3 font-normal text-shade-60">
              Product
            </th>
            <th scope="col" className="px-4 py-3 font-normal text-shade-60">
              Verdict
            </th>
            {metrics.map((m) => (
              <th key={m.key} scope="col" className="px-4 py-3 font-normal text-shade-60">
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.slug} className="border-t border-hairline">
              <th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left">
                <Link href={routes.product(p.slug)} className="text-body-strong underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                  {p.shortName}
                </Link>
              </th>
              <td className="px-4 py-3">
                <VerdictBadge verdict={p.verdict} />
              </td>
              {metrics.map((m) => (
                <Cell key={m.key} metric={m} product={p} winner={winnerOf(m, products)} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
