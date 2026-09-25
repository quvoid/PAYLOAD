import Link from 'next/link'
import React from 'react'

import { getBrand, getCategory } from '@/lib/catalog'
import { formatINR, formatPct, formatRating, formatScore } from '@/lib/format'
import {
  compositeScore,
  marketplaceAverage,
  sourceById,
  valueFor,
  weightedRating,
  type AspectStat,
  type SentimentSplit,
} from '@/lib/metrics'
import { routes } from '@/lib/routes'
import type { Crumb } from '@/lib/seo'
import type { FAQ, Product, Track, Verdict } from '@/lib/types'
import { verdictMeta } from '@/lib/verdict'

// Verdict chips: indigo text on light fills (≥7:1), coloured text on night (≥6:1). Never colour
// alone — every verdict carries a glyph and a label.
const verdictLight: Record<Verdict, string> = {
  buy: 'bg-indigo text-white',
  'buy-with-caveats': 'bg-peach text-indigo',
  skip: 'bg-blush text-indigo',
  'thin-data': 'bg-shade-30 text-indigo',
}
const verdictNight: Record<Verdict, string> = {
  buy: 'border-aqua text-aqua',
  'buy-with-caveats': 'border-peach text-peach',
  skip: 'border-blush text-blush',
  'thin-data': 'border-shade-40 text-shade-40',
}

export function VerdictBadge({
  verdict,
  track = 'light',
  size = 'sm',
}: {
  verdict: Verdict
  track?: Track
  size?: 'sm' | 'lg'
}) {
  const meta = verdictMeta[verdict]
  const tone = track === 'night' ? `border ${verdictNight[verdict]}` : verdictLight[verdict]
  const sizing = size === 'lg' ? 'px-4 py-2 text-body-strong' : 'px-3 py-1 text-caption'
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-pill ${sizing} ${tone}`}>
      <span aria-hidden className="font-mono">
        {meta.glyph}
      </span>
      {meta.label}
    </span>
  )
}

export function Breadcrumbs({ crumbs, track = 'light' }: { crumbs: Crumb[]; track?: Track }) {
  const muted = track === 'night' ? 'text-shade-40 hover:text-aqua' : 'text-shade-60 hover:text-ink'
  return (
    <nav aria-label="Breadcrumb" className="py-5">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className={track === 'night' ? 'text-white' : 'text-ink'}>
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className={`underline-offset-4 hover:underline ${muted}`}>
                  {c.name}
                </Link>
              )}
              {!last && (
                <span aria-hidden className="text-shade-40">
                  ›
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Stand-in for product photography until the pipeline stores images: the brand initial on a
 * palette fill, so a missing photo never looks like a broken one.
 */
export function ProductMark({
  product,
  track = 'light',
  size = 'md',
}: {
  product: Product
  track?: Track
  size?: 'sm' | 'md' | 'lg'
}) {
  const brand = getBrand(product.brand)!
  const silo = getCategory(getCategory(product.category)!.parent!)!
  const fill =
    track === 'night' ? 'bg-night-elevated text-aqua shadow-l1' : silo.slug === 'skincare' ? 'bg-blush text-indigo' : 'bg-peach text-indigo'
  const box = { sm: 'size-14 text-heading-lg', md: 'size-20 text-display-sm', lg: 'size-28 md:size-36 text-display-md' }[size]
  return (
    <div aria-hidden className={`flex shrink-0 items-center justify-center rounded-lg font-display ${box} ${fill}`}>
      {brand.name.charAt(0)}
    </div>
  )
}

/** Horizontal bar. Always paired with the number as text — the bar is decoration. */
export function Meter({
  value,
  tone = 'indigo',
  className = '',
}: {
  value: number
  tone?: 'indigo' | 'pink' | 'shade' | 'aqua' | 'white'
  className?: string
}) {
  const fill = { indigo: 'bg-indigo', pink: 'bg-pink', shade: 'bg-shade-40', aqua: 'bg-aqua', white: 'bg-white' }[tone]
  const track = tone === 'aqua' || tone === 'white' ? 'bg-night-deep' : 'bg-hairline'
  return (
    <div aria-hidden className={`h-2 w-full overflow-hidden rounded-pill ${track} ${className}`}>
      <div className={`h-full rounded-pill ${fill}`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  )
}

export function SentimentBar({ split, label }: { split: SentimentSplit; label?: string }) {
  return (
    <div>
      {label && <p className="mb-2 text-caption text-shade-60">{label}</p>}
      <div aria-hidden className="flex h-3 w-full overflow-hidden rounded-pill bg-hairline">
        <div className="bg-indigo" style={{ width: `${split.positive * 100}%` }} />
        <div className="bg-shade-30" style={{ width: `${split.neutral * 100}%` }} />
        <div className="bg-pink" style={{ width: `${split.negative * 100}%` }} />
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-micro text-shade-60 tabular-nums">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-pill bg-indigo" /> Positive {formatPct(split.positive)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-pill bg-shade-30" /> Neutral {formatPct(split.neutral)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-pill bg-pink" /> Negative {formatPct(split.negative)}
        </span>
      </p>
    </div>
  )
}

/** Share of voice for every product in a category, with the current one picked out in pink. */
export function SovChart({
  rows,
  current,
}: {
  rows: { product: Product; share: number; positiveShare: number }[]
  current?: Product
}) {
  const max = Math.max(...rows.map((r) => r.share))
  return (
    <ul className="space-y-4">
      {rows.map((r) => {
        const isCurrent = r.product === current
        return (
          <li key={r.product.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5">
            {isCurrent ? (
              <span className="text-body-strong">{r.product.name}</span>
            ) : (
              <Link href={routes.product(r.product.slug)} className="text-body-md underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                {r.product.name}
              </Link>
            )}
            <span className="text-body-strong tabular-nums">{formatPct(r.share)}</span>
            <Meter value={r.share / max} tone={isCurrent ? 'pink' : 'shade'} className="col-span-2" />
            <span className="col-span-2 text-micro text-shade-60 tabular-nums">
              {formatPct(r.positiveShare)} of the category&apos;s positive voice
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function AspectTable({ stats, caption }: { stats: AspectStat[]; caption: string }) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <caption className="mb-4 text-left text-caption text-shade-60">{caption}</caption>
        <thead>
          <tr className="border-b border-hairline text-eyebrow uppercase text-shade-60">
            <th scope="col" className="py-3 pr-4 font-normal">Aspect</th>
            <th scope="col" className="py-3 pr-4 font-normal">Mentioned by</th>
            <th scope="col" className="py-3 pr-4 font-normal">Positive</th>
            <th scope="col" className="w-[35%] py-3 font-normal">Score / 10</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => (
            <tr key={s.aspect.slug} id={`aspect-${s.aspect.slug}`} className="border-b border-hairline">
              <th scope="row" className="py-4 pr-4 text-left text-body-strong">
                {s.aspect.topic ? (
                  <Link href={routes.topic(s.aspect.topic)} className="underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                    {s.aspect.label}
                  </Link>
                ) : (
                  s.aspect.label
                )}
                {s.dealBreaker && <span className="ml-2 align-middle text-micro text-shade-50">deal-breaker</span>}
              </th>
              <td className="py-4 pr-4 tabular-nums">
                {formatPct(s.mentionShare)} <span className="text-shade-50">({s.mentions})</span>
              </td>
              <td className="py-4 pr-4 tabular-nums">{s.mentions ? formatPct(s.positiveShare) : '—'}</td>
              <td className="py-4">
                {s.score === null ? (
                  <span className="text-caption text-shade-50">Too few mentions to score</span>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-body-strong tabular-nums">{formatScore(s.score)}</span>
                    <Meter value={s.score / 10} tone={s.negativeShare >= 0.35 ? 'pink' : 'indigo'} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Faq({ items }: { items: FAQ[] }) {
  return (
    <dl className="divide-y divide-hairline border-y border-hairline">
      {items.map((f) => (
        <div key={f.q} className="py-6">
          <dt className="text-heading-md">{f.q}</dt>
          <dd className="mt-2 max-w-[70ch] text-shade-60">{f.a}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Card used in every product listing. Same measures everywhere, so lists compare like with like. */
export function ProductCard({ product, track = 'light', rank }: { product: Product; track?: Track; rank?: number }) {
  const night = track === 'night'
  const category = getCategory(product.category)!
  const value = valueFor(product)
  return (
    <article
      className={`relative flex h-full flex-col gap-5 rounded-lg p-6 ${night ? 'bg-night-elevated shadow-l1' : 'bg-white shadow-l3'}`}
    >
      <div className="flex items-start gap-4">
        {rank !== undefined ? (
          <span className={`font-display text-display-sm tabular-nums ${night ? 'text-aqua' : 'text-pink'}`}>{rank}</span>
        ) : (
          <ProductMark product={product} track={track} size="sm" />
        )}
        <div className="min-w-0">
          <p className={`text-eyebrow uppercase ${night ? 'text-peach' : 'text-shade-60'}`}>
            {getBrand(product.brand)!.name} · {category.name}
          </p>
          <h3 className="mt-1 text-heading-md">
            <Link href={routes.product(product.slug)} className="after:absolute after:inset-0 after:rounded-lg">
              {product.name}
            </Link>
          </h3>
          <p className={`text-caption ${night ? 'text-shade-40' : 'text-shade-60'}`}>{product.variant}</p>
        </div>
      </div>
      <div>
        <VerdictBadge verdict={product.verdict} track={track} />
      </div>
      <dl className={`mt-auto grid grid-cols-3 gap-3 border-t pt-4 ${night ? 'border-hairline-night' : 'border-hairline'}`}>
        {[
          { label: 'Score', value: product.verdict === 'thin-data' ? '—' : formatScore(compositeScore(product)) },
          { label: 'Weighted ★', value: formatRating(weightedRating(product)) },
          { label: category.valueMetric ? `₹ ${category.valueMetric.label.replace('per ', '/ ')}` : 'Price', value: value ? formatINR(value) : '—' },
        ].map((s) => (
          <div key={s.label}>
            <dt className={`text-micro ${night ? 'text-shade-40' : 'text-shade-60'}`}>{s.label}</dt>
            <dd className="text-body-strong tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

/** Raw marketplace average next to our credibility-weighted one — we show our working. */
export function RatingPair({ product }: { product: Product }) {
  const market = marketplaceAverage(product)
  return (
    <dl className="grid gap-6 sm:grid-cols-2">
      <div className="rounded-lg border border-hairline p-6">
        <dt className="text-caption text-shade-60">Marketplace average</dt>
        <dd className="mt-2 font-display text-display-md tabular-nums">{formatRating(market.rating)}★</dd>
        <dd className="mt-1 text-caption text-shade-60">
          Across {market.total.toLocaleString('en-IN')} ratings on{' '}
          {product.platformStats
            .filter((s) => sourceById(s.source).kind !== 'brand-store')
            .map((s) => sourceById(s.source).name)
            .join(' and ')}
          , as the platforms report them.
        </dd>
      </div>
      <div className="rounded-lg bg-peach p-6">
        <dt className="text-caption">Credibility-weighted</dt>
        <dd className="mt-2 font-display text-display-md tabular-nums">{formatRating(weightedRating(product))}★</dd>
        <dd className="mt-1 text-caption">
          Our average of {product.reviews.filter((r) => r.rating !== undefined).length} collected ratings, discounting
          ones that look manipulated and brand-store reviews.
        </dd>
      </div>
    </dl>
  )
}
