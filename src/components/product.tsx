import React from 'react'

import { getAspect } from '@/lib/catalog'
import { formatDate, formatINR, formatPct, formatScore } from '@/lib/format'
import {
  claimEvidence,
  compositeScore,
  confidence,
  countedReviews,
  failedDealBreakers,
  lowestOffer,
  notableCons,
  pickQuote,
  sourceById,
  suspiciousCount,
  valueFor,
} from '@/lib/metrics'
import { reviewAnchor } from '@/lib/routes'
import { RULES } from '@/lib/rules'
import type { Category, Claim, Product, Review } from '@/lib/types'
import { verdictMeta } from '@/lib/verdict'

function ClaimItem({ product, claim, quote }: { product: Product; claim: Claim; quote: Review }) {
  const evidence = claimEvidence(product, claim)
  const aspect = getAspect(claim.aspect)!
  return (
    <li id={`claim-${claim.aspect}-${claim.sentiment}`} className="border-t border-hairline py-5">
      <p className="text-body-strong">{claim.text}</p>
      <p className="mt-1 text-caption text-shade-60 tabular-nums">
        {aspect.label} · mentioned by {formatPct(evidence.share)} of reviewers ·{' '}
        <cite className="not-italic">
          <a href={`#${reviewAnchor(quote.id)}`} className="text-ink underline decoration-pink underline-offset-4">
            {evidence.count} reviews
          </a>
        </cite>
      </p>
      <blockquote className="mt-3 border-l-2 border-pink pl-4 text-caption text-shade-60">
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
  const backed = product.claims.filter((c) => claimEvidence(product, c).count >= RULES.minEvidencePerClaim)
  // One quote per claim, never the same review twice on the page.
  const used = new Set<string>()
  const quotes = new Map(
    backed.map((c) => {
      const quote = pickQuote(product, c, used) ?? claimEvidence(product, c).reviews[0]
      used.add(quote.id)
      return [c, quote] as const
    }),
  )
  const columns = [
    { title: 'What reviewers praise', claims: backed.filter((c) => c.sentiment === 'positive'), className: 'pros' },
    { title: 'What reviewers criticise', claims: backed.filter((c) => c.sentiment === 'negative'), className: 'cons' },
  ]
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {columns.map((col) => (
        <div key={col.className}>
          <h3 className="mb-2 text-heading-md">{col.title}</h3>
          {col.claims.length ? (
            <ul className={col.className}>
              {col.claims.map((c) => (
                <ClaimItem key={c.text} product={product} claim={c} quote={quotes.get(c)!} />
              ))}
            </ul>
          ) : (
            <p className="border-t border-hairline py-5 text-shade-60">
              Nothing mentioned by enough reviewers to report.
            </p>
          )}
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
    { label: 'Reviews counted', value: `${counted} (${confidence(product)} confidence)` },
    { label: 'Composite score', value: `${formatScore(compositeScore(product))} / 10` },
    {
      label: 'Deal-breakers failed',
      value: failed.length ? failed.map((s) => `${s.aspect.label} (${formatPct(s.negativeShare)} negative)`).join(', ') : 'None',
    },
    {
      label: 'Notable cons',
      value: cons.length ? cons.map((s) => `${s.aspect.label} (${formatPct(s.negativeShare)} negative)`).join(', ') : 'None',
    },
    { label: 'Flagged as likely manipulated', value: `${suspiciousCount(product)} reviews, excluded from counts` },
  ]
  return (
    <div className="rounded-lg border border-hairline p-6">
      <p className="text-body-strong">Why “{verdictMeta[product.verdict].label}”</p>
      <dl className="mt-4 grid gap-x-6 gap-y-3 text-caption sm:grid-cols-[auto_minmax(0,1fr)]">
        {rows.map((r) => (
          <React.Fragment key={r.label}>
            <dt className="text-shade-60">{r.label}</dt>
            <dd className="tabular-nums">{r.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}

/** Where to buy: prices per source, with the platform's own rating attributed to it. */
export function PriceTable({ product, category }: { product: Product; category: Category }) {
  const lowest = lowestOffer(product)
  const value = valueFor(product)
  return (
    <div className="rounded-lg bg-cream p-6">
      <h2 className="text-heading-md">Where to buy</h2>
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
                      <span className="block text-body-strong">{formatINR(o.price)}</span>
                      {o === lowest && (
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
        Prices checked {formatDate(product.offers[0].checkedAt)}. We earn nothing from these links.
      </p>
    </div>
  )
}
