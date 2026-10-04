import Link from 'next/link'
import React from 'react'

import { getBrand, getCategory, isApp } from '@/lib/catalog'
import { formatCompact, formatCount, formatINR, formatPct, formatRate, formatRating, formatScore } from '@/lib/format'
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
import { RULES } from '@/lib/rules'
import type { Crumb } from '@/lib/seo'
import type { FAQ, Product, Track, Verdict } from '@/lib/types'
import { verdictLabel } from '@/lib/verdict'

import { Icon, Stars, type IconName } from './Icon'

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

const verdictIcon: Record<Verdict, IconName> = {
  buy: 'check',
  'buy-with-caveats': 'alert',
  skip: 'x',
  'thin-data': 'clock',
}

export function VerdictBadge({
  verdict,
  track = 'light',
  size = 'sm',
  app = false,
}: {
  verdict: Verdict
  track?: Track
  size?: 'sm' | 'lg'
  /** Apps get "Use it" wording instead of "Buy". */
  app?: boolean
}) {
  const tone = track === 'night' ? `border ${verdictNight[verdict]}` : verdictLight[verdict]
  const sizing = size === 'lg' ? 'gap-2 py-2 pr-5 pl-4 text-body-strong' : 'gap-1.5 py-1 pr-3 pl-2.5 text-caption'
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-pill ${sizing} ${tone}`}>
      <Icon name={verdictIcon[verdict]} className={size === 'lg' ? 'size-4.5' : 'size-3.5'} />
      {verdictLabel(verdict, app)}
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
              {!last && <Icon name="chevron" className="size-3 -rotate-90 text-shade-40" />}
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
  const lightFill: Record<string, string> = { skincare: 'bg-blush', apps: 'bg-shade-30' }
  const fill =
    track === 'night'
      ? 'bg-night-deep text-aqua shadow-l1'
      : `${lightFill[silo.slug] ?? 'bg-peach'} text-indigo ring-1 ring-inset ring-indigo/5`
  const box = { sm: 'size-12 rounded-md text-heading-lg', md: 'size-20 rounded-lg text-display-sm', lg: 'size-28 rounded-xl md:size-36 text-display-md' }[size]
  return (
    <div aria-hidden className={`relative flex shrink-0 items-center justify-center overflow-hidden font-display ${box} ${fill}`}>
      {/* The wordmark's five bars, faint, so the stand-in reads as ours rather than empty. */}
      <svg viewBox="0 0 40 40" className="absolute -right-1 -bottom-1 h-1/2 opacity-15">
        {[22, 32, 26, 18, 12].map((h, i) => (
          <rect key={i} x={2 + i * 8} y={40 - h} width={5} height={h} rx={2.5} fill="currentColor" />
        ))}
      </svg>
      <span className="relative">{brand.name.charAt(0)}</span>
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
      <div className={`h-full rounded-pill transition-[width] duration-500 ${fill}`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  )
}

export function SentimentBar({ split, label }: { split: SentimentSplit; label?: string }) {
  return (
    <div>
      {label && <p className="mb-2 text-caption text-shade-60">{label}</p>}
      <div aria-hidden className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-pill">
        <div className="rounded-l-pill bg-indigo" style={{ width: `${split.positive * 100}%` }} />
        <div className="bg-shade-30" style={{ width: `${split.neutral * 100}%` }} />
        <div className="rounded-r-pill bg-pink" style={{ width: `${split.negative * 100}%` }} />
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

/**
 * Aspect-by-aspect results. A table from the medium breakpoint up; below it each row becomes a
 * small card with its own labels (taken from data-label), so nothing scrolls sideways on a phone.
 */
export function AspectTable({ stats, caption }: { stats: AspectStat[]; caption: string }) {
  const cell = 'md:py-4 md:pr-4 max-md:flex max-md:items-baseline max-md:justify-between max-md:gap-4 max-md:before:text-micro max-md:before:text-shade-60 max-md:before:content-[attr(data-label)]'
  return (
    <div className="relative">
      <table className="w-full border-collapse text-left max-md:block">
        <caption className="mb-4 text-left text-caption text-shade-60 max-md:block">{caption}</caption>
        <thead className="max-md:sr-only">
          <tr className="border-b border-hairline text-eyebrow uppercase text-shade-60">
            <th scope="col" className="py-3 pr-4 font-normal">Aspect</th>
            <th scope="col" className="py-3 pr-4 font-normal">Mentioned by</th>
            <th scope="col" className="w-[38%] py-3 pr-4 font-normal">Problems reported by</th>
            <th scope="col" className="py-3 font-normal">Positive when mentioned</th>
          </tr>
        </thead>
        <tbody className="max-md:grid max-md:gap-3">
          {stats.map((s) => (
            <tr
              key={s.aspect.slug}
              id={`aspect-${s.aspect.slug}`}
              className="border-b border-hairline max-md:grid max-md:gap-2.5 max-md:rounded-lg max-md:border max-md:bg-white max-md:p-4"
            >
              <th scope="row" className="text-left text-body-strong md:py-4 md:pr-4">
                {s.aspect.topic ? (
                  <Link href={routes.topic(s.aspect.topic)} className="underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                    {s.aspect.label}
                  </Link>
                ) : (
                  s.aspect.label
                )}
                {s.dealBreaker && <span className="ml-2 align-middle text-micro text-shade-50">deal-breaker</span>}
              </th>
              <td data-label="Mentioned by" className={`tabular-nums ${cell}`}>
                <span>
                  {formatPct(s.mentionShare)} <span className="text-shade-50">({s.mentions})</span>
                </span>
              </td>
              <td data-label="Problems reported by" className={`max-md:flex-wrap ${cell}`}>
                {!s.scored ? (
                  <span className="text-caption text-shade-50">Too few mentions to judge</span>
                ) : (
                  <div className="flex items-center gap-3 max-md:contents">
                    <span className="w-12 text-body-strong tabular-nums max-md:w-auto">{formatRate(s.problemRate)}</span>
                    {/* Bar runs 0–40%; notable cons (≥10%) turn pink. */}
                    <Meter
                      value={s.problemRate / 0.4}
                      tone={s.problemRate >= RULES.notableConProblemRate ? 'pink' : 'indigo'}
                      className="max-md:basis-full"
                    />
                  </div>
                )}
              </td>
              <td data-label="Positive when mentioned" className={`tabular-nums md:py-4 ${cell.replace('md:pr-4 ', '')}`}>
                <span>{s.mentions ? formatPct(s.positiveShare) : '—'}</span>
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
    <dl className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {items.map((f) => (
        <div key={f.q} className="rounded-lg border border-hairline bg-white p-6">
          <dt className="flex gap-3 text-heading-sm">
            <Icon name="message" className="mt-0.5 size-5 text-pink" />
            {f.q}
          </dt>
          <dd className="mt-3 max-w-[70ch] pl-8 text-shade-60">{f.a}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * The satisfaction score as a ring gauge, the number printed in the middle — the ring is
 * decoration. Pink only when the verdict is Skip (a mark, never a fill behind text); a dashed
 * ring and a dash when there's too little data to score.
 */
export function ScoreRing({
  product,
  track = 'light',
  size = 'md',
}: {
  product: Product
  track?: Track
  size?: 'sm' | 'md' | 'lg'
}) {
  const night = track === 'night'
  const thin = product.verdict === 'thin-data'
  const score = compositeScore(product)
  const box = { sm: 'size-14', md: 'size-24', lg: 'size-32' }[size]
  const text = { sm: 'text-body-strong', md: 'text-heading-lg', lg: 'text-display-sm' }[size]
  const stroke = night ? 'stroke-aqua' : product.verdict === 'skip' ? 'stroke-pink' : 'stroke-indigo'
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <div className={`relative shrink-0 ${box}`}>
      <svg aria-hidden viewBox="0 0 40 40" className="size-full -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" strokeWidth={size === 'lg' ? 2.5 : 3.25} className={night ? 'stroke-night-deep' : 'stroke-hairline'} {...(thin && { strokeDasharray: '2 3' })} />
        {!thin && (
          <circle
            cx="20"
            cy="20"
            r={r}
            fill="none"
            strokeWidth={size === 'lg' ? 2.5 : 3.25}
            strokeLinecap="round"
            strokeDasharray={`${(Math.max(0, Math.min(10, score)) / 10) * c} ${c}`}
            className={stroke}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display leading-none tabular-nums ${text} ${night ? 'text-white' : 'text-ink'}`}>
          {thin ? '—' : formatScore(score)}
        </span>
        {size !== 'sm' && (
          <span className={`mt-1 text-micro ${night ? 'text-shade-40' : 'text-shade-60'}`}>{size === 'lg' ? 'out of 10' : '/ 10'}</span>
        )}
        <span className="sr-only">{thin ? 'Not scored' : ' out of 10'}</span>
      </div>
    </div>
  )
}

/** Card used in every product listing. Same measures everywhere, so lists compare like with like. */
export function ProductCard({ product, track = 'light', rank }: { product: Product; track?: Track; rank?: number }) {
  const night = track === 'night'
  const category = getCategory(product.category)!
  const value = valueFor(product)
  const muted = night ? 'text-shade-40' : 'text-shade-60'
  return (
    <article
      className={`group relative flex h-full flex-col gap-5 rounded-lg p-6 ${night ? 'bg-night-elevated shadow-l1' : 'card-lift bg-white'}`}
    >
      <div className="flex items-start gap-4">
        {rank !== undefined ? (
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-md font-display text-heading-xl tabular-nums ${night ? 'bg-night-deep text-aqua' : 'bg-cream text-pink'}`}
          >
            <span className="sr-only">Rank </span>
            {rank}
          </span>
        ) : (
          <ProductMark product={product} track={track} size="sm" />
        )}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-eyebrow uppercase ${night ? 'text-peach' : 'text-shade-60'}`}>
            {getBrand(product.brand)!.name} · {category.name}
          </p>
          <h3 className="mt-1 text-heading-md">
            <Link href={routes.product(product.slug)} className="after:absolute after:inset-0 after:rounded-lg">
              {product.name}
            </Link>
          </h3>
          <p className={`text-caption ${muted}`}>{product.variant}</p>
        </div>
        <ScoreRing product={product} track={track} size="sm" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={product.verdict} track={track} app={isApp(product)} />
        {(product.draft || product.sample) && (
          <span
            className={`rounded-pill px-2.5 py-0.5 text-micro ${night ? 'border border-hairline-night text-shade-40' : 'border border-hairline text-shade-60'}`}
          >
            {product.draft ? 'Draft' : 'Sample'}
          </span>
        )}
      </div>
      <div className={`mt-auto flex items-end gap-4 border-t pt-4 ${night ? 'border-hairline-night' : 'border-hairline'}`}>
        <dl className="grid flex-1 grid-cols-2 gap-3">
          {[
            {
              label: 'Weighted rating',
              value: (
                <span className="inline-flex items-center gap-1">
                  {formatRating(weightedRating(product))}
                  <span className={`text-caption ${night ? 'text-peach' : 'text-pink'}`} aria-hidden>
                    ★
                  </span>
                </span>
              ),
            },
            category.valueMetric
              ? { label: `₹ ${category.valueMetric.label.replace('per ', '/ ')}`, value: value ? formatINR(value) : '—' }
              : { label: 'Store ratings', value: formatCompact(marketplaceAverage(product).total) },
          ].map((s) => (
            <div key={s.label}>
              <dt className={`text-micro ${muted}`}>{s.label}</dt>
              <dd className="text-body-strong tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        <span
          aria-hidden
          className={`flex size-9 items-center justify-center rounded-pill transition-colors ${night ? 'border border-hairline-night text-white group-hover:border-aqua group-hover:text-aqua' : 'bg-cream text-ink group-hover:bg-indigo group-hover:text-white'}`}
        >
          <Icon name="arrow-up-right" className="size-4" />
        </span>
      </div>
    </article>
  )
}

/** Raw marketplace average next to our credibility-weighted one — we show our working. */
export function RatingPair({ product }: { product: Product }) {
  const market = marketplaceAverage(product)
  const rated = product.platformStats.filter((s) => sourceById(s.source).kind !== 'brand-store')
  const appStores = rated.every((s) => sourceById(s.source).kind === 'app-store')
  const hasBrandStore = product.reviews.some((r) => sourceById(r.source).kind === 'brand-store')
  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div className="rounded-lg border border-hairline bg-white p-6">
        <dt className="text-caption text-shade-60">{appStores ? 'App store average' : 'Marketplace average'}</dt>
        <dd className="mt-2 flex items-baseline gap-3">
          <span className="font-display text-display-md tabular-nums">{formatRating(market.rating)}</span>
          <span className="text-shade-50">
            <Stars rating={market.rating} />
          </span>
        </dd>
        <dd className="mt-1 text-caption text-shade-60">
          Across {market.total.toLocaleString('en-IN')} ratings on{' '}
          {rated.map((s) => sourceById(s.source).name).join(' and ')}
          , as the platforms report them.
        </dd>
      </div>
      <div className="rounded-lg bg-peach p-6">
        <dt className="flex items-center gap-2 text-caption">
          <Icon name="shield" className="size-4" />
          Credibility-weighted
        </dt>
        <dd className="mt-2 flex items-baseline gap-3">
          <span className="font-display text-display-md tabular-nums">{formatRating(weightedRating(product))}</span>
          <span className="text-indigo">
            <Stars rating={weightedRating(product)} />
          </span>
        </dd>
        <dd className="mt-1 text-caption">
          Our average of {formatCount(product.reviews.filter((r) => r.rating !== undefined).length)} collected ratings, discounting
          ones that look manipulated{hasBrandStore ? ' and brand-store reviews' : ''}.
        </dd>
      </div>
    </dl>
  )
}
