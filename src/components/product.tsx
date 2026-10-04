import { getAspect, isApp } from '@/lib/catalog'
import { formatCount, formatDate, formatINR, formatPct, formatPrice, formatRate, formatScore } from '@/lib/format'
import {
  claimEvidence,
  compositeScore,
  confidence,
  countedReviews,
  failedDealBreakers,
  lowestOffer,
  claimQuotes,
  notableCons,
  sourceById,
  suspiciousCount,
  valueFor,
} from '@/lib/metrics'
import { reviewAnchor } from '@/lib/routes'
import type { Category, Claim, Product, Review } from '@/lib/types'
import { verdictLabel } from '@/lib/verdict'

import { Icon } from './Icon'

function ClaimItem({ product, claim, quote }: { product: Product; claim: Claim; quote: Review }) {
  const evidence = claimEvidence(product, claim)
  const aspect = getAspect(claim.aspect)!
  return (
    <li id={`claim-${claim.aspect}-${claim.sentiment}`} className="border-t border-hairline py-5 first:border-0 first:pt-0">
      <p className="text-body-strong">{claim.text}</p>
      <p className="mt-1 text-caption text-shade-60 tabular-nums">
        {aspect.label} · mentioned by {formatPct(evidence.share)} of reviewers ·{' '}
        <cite className="not-italic">
          <a href={`#${reviewAnchor(quote.id)}`} className="text-ink underline decoration-pink underline-offset-4">
            {evidence.count} reviews
          </a>
        </cite>
      </p>
      <blockquote className="mt-3 rounded-r-md border-l-2 border-pink bg-cream py-3 pr-4 pl-4 text-caption text-shade-60">
        <p>&ldquo;{quote.body}&rdquo;</p>
        <footer className="mt-1 text-micro">
          — {quote.author}, {sourceById(quote.source).name}
          {quote.rating !== undefined && `, ${quote.rating}★`}
        </footer>
      </blockquote>
    </li>
  )
}

/** Pros and cons with receipts: a claim is only shown when enough reviews back it. */
export function ProsCons({ product }: { product: Product }) {
  // One quote per claim, never the same review twice on the page.
  const quotes = claimQuotes(product)
  const backed = product.claims.filter((c) => quotes.has(c))
  const columns = [
    {
      title: 'What reviewers praise',
      claims: backed.filter((c) => c.sentiment === 'positive'),
      className: 'pros',
      icon: 'check' as const,
      badge: 'bg-indigo text-white',
    },
    {
      title: 'What reviewers criticise',
      claims: backed.filter((c) => c.sentiment === 'negative'),
      className: 'cons',
      icon: 'x' as const,
      badge: 'bg-blush text-indigo',
    },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {columns.map((col) => (
        <div key={col.className} className="rounded-lg border border-hairline bg-white">
          <h3 className="flex items-center gap-3 border-b border-hairline px-6 py-4 text-heading-md">
            <span className={`flex size-8 items-center justify-center rounded-pill ${col.badge}`}>
              <Icon name={col.icon} className="size-4" />
            </span>
            {col.title}
            <span className="ml-auto text-caption text-shade-60 tabular-nums">{col.claims.length}</span>
          </h3>
          <div className="p-6">
            {col.claims.length ? (
              <ul className={col.className}>
                {col.claims.map((c) => (
                  <ClaimItem key={c.text} product={product} claim={c} quote={quotes.get(c)!} />
                ))}
              </ul>
            ) : (
              <p className="text-shade-60">Nothing mentioned by enough reviewers to report.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Which rule produced the verdict, so the reasoning is checkable rather than asserted. */
export function VerdictRationale({ product }: { product: Product }) {
  const cons = notableCons(product)
  const failed = failedDealBreakers(product)
  const counted = countedReviews(product).length
  const rows: { label: string; value: string }[] = [
    { label: 'Reviews counted', value: `${formatCount(counted)} (${confidence(product)} confidence)` },
    { label: 'Satisfaction score', value: `${formatScore(compositeScore(product))} / 10` },
    {
      label: 'Deal-breakers failed',
      value: failed.length ? failed.map((s) => `${s.aspect.label} (${formatRate(s.problemRate)} of reviewers report a problem)`).join(', ') : 'None',
    },
    {
      label: 'Notable cons',
      value: cons.length ? cons.map((s) => `${s.aspect.label} (${formatRate(s.problemRate)} of reviewers)`).join(', ') : 'None',
    },
    { label: 'Flagged as likely manipulated', value: `${suspiciousCount(product)} reviews, excluded from counts` },
  ]
  return (
    <div className="rounded-lg border border-hairline bg-white">
      <p className="flex items-center gap-2 border-b border-hairline px-6 py-4 text-body-strong">
        <Icon name="scale" className="size-5 text-pink" />
        Why “{verdictLabel(product.verdict, isApp(product))}”
      </p>
      <dl className="divide-y divide-hairline px-6 text-caption">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 py-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
            <dt className="text-shade-60">{r.label}</dt>
            <dd className="tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Where to buy: prices per source, with the platform's own rating attributed to it. */
export function PriceTable({ product, category }: { product: Product; category: Category }) {
  const lowest = lowestOffer(product)
  const value = valueFor(product)
  const free = product.offers.every((o) => o.price === 0)
  return (
    <div className="rounded-lg bg-cream p-6">
      <h2 className="text-heading-md">{free ? 'Where to get it' : 'Where to buy'}</h2>
      <p className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-white px-2.5 py-1 text-micro text-shade-60">
        <Icon name="shield" className="size-3.5 text-indigo" />
        No affiliate links
      </p>
      <table className="mt-4 w-full text-left text-caption">
        <caption className="sr-only">Current prices and platform ratings by store</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Store</th>
            <th scope="col">Price</th>
          </tr>
        </thead>
        <tbody>
          {product.offers.map((o) => {
            const stat = product.platformStats.find((s) => s.source === o.source)
            return (
              <tr key={o.source} className="border-t border-hairline">
                <th scope="row" className="py-3 pr-2 font-normal">
                  <span className="block text-body-strong">{sourceById(o.source).name}</span>
                  {stat && (
                    <span className="text-micro text-shade-60 tabular-nums">
                      {stat.rating.toFixed(1)}★ from {stat.total.toLocaleString('en-IN')} ratings
                    </span>
                  )}
                </th>
                <td className="py-3 text-right tabular-nums">
                  {o.inStock ? (
                    <>
                      <span className="block text-body-strong">{formatPrice(o.price)}</span>
                      {o === lowest && !free && (
                        <span className="mt-1 inline-block rounded-pill bg-blush px-2 py-0.5 text-micro">Lowest</span>
                      )}
                    </>
                  ) : (
                    <span className="text-shade-50">Out of stock</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {value !== undefined && category.valueMetric && (
        <p className="mt-4 border-t border-hairline pt-4 text-caption">
          <span className="text-body-strong tabular-nums">{formatINR(value)}</span> {category.valueMetric.label}, at the
          lowest price.
        </p>
      )}
      <p className="mt-3 text-micro text-shade-60">
        {free ? 'Checked' : 'Prices checked'} {formatDate(product.offers[0].checkedAt)}. We earn nothing from these links.
      </p>
    </div>
  )
}
