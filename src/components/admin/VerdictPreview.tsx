import type { UIFieldServerComponent } from 'payload'
import React from 'react'

import { Icon, type IconName } from '@/components/Icon'
import { getCategory, getProductForPreview } from '@/lib/catalog'
import { formatRate, formatScore } from '@/lib/format'
import { compositeScore, confidence, countedReviews, failedDealBreakers, notableCons, suspiciousCount } from '@/lib/metrics'
import { ensureCatalog } from '@/lib/store'
import type { Verdict } from '@/lib/types'
import { verdictLabel } from '@/lib/verdict'

// Product sidebar: what the scoring rules say about this product right now, so an editor can
// write the wording to match — and see why, without doing any maths. The score ring and verdict
// chip are the site's own (styles in app/(payload)/custom.scss).

const verdictIcon: Record<Verdict, IconName> = { buy: 'check', 'buy-with-caveats': 'alert', skip: 'x', 'thin-data': 'clock' }

export const VerdictPreview: UIFieldServerComponent = async ({ data }) => {
  const slug = typeof data?.slug === 'string' ? data.slug : undefined
  if (!slug) {
    return (
      <div className="rl-panel">
        <strong>
          <Icon name="scale" className="rl-icon rl-icon--sm" />
          What the rules say
        </strong>
        <p style={{ marginTop: 6 }}>Save the product to see what the scoring rules say about it.</p>
      </div>
    )
  }
  await ensureCatalog()
  const product = getProductForPreview(slug)
  if (!product || product.reviews.length === 0) {
    return (
      <div className="rl-panel">
        <strong>
          <Icon name="scale" className="rl-icon rl-icon--sm" />
          What the rules say
        </strong>
        <p style={{ marginTop: 6 }}>
          No reviews collected yet. Add store links under “Data collection” and run the review pipeline.
        </p>
      </div>
    )
  }
  const app = Boolean(getCategory(product.category)?.appCategory)
  const cons = notableCons(product)
  const failed = failedDealBreakers(product)
  const thin = product.verdict === 'thin-data'
  const score = compositeScore(product)
  return (
    <div className="rl-panel">
      <strong>
        <Icon name="scale" className="rl-icon rl-icon--sm" />
        What the rules say
      </strong>
      <div className="rl-score">
        <div className={`rl-ring ${product.verdict === 'skip' ? 'rl-ring--skip' : ''}`}>
          <svg aria-hidden viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="rl-ring__track" {...(thin && { strokeDasharray: '2 3' })} />
            {!thin && (
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${Math.max(0, Math.min(10, score)) * 10} 101`}
                className="rl-ring__arc"
              />
            )}
          </svg>
          <span className="rl-ring__value">{thin ? '—' : formatScore(score)}</span>
        </div>
        <div>
          <span className={`rl-chip rl-chip--${product.verdict}`}>
            <Icon name={verdictIcon[product.verdict]} className="rl-icon rl-icon--sm" />
            {verdictLabel(product.verdict, app)}
          </span>
          <p style={{ marginTop: 6 }}>Satisfaction score out of 10</p>
        </div>
      </div>
      <dl className="rl-facts">
        <div>
          <dt>Reviews counted</dt>
          <dd>
            {countedReviews(product).length.toLocaleString('en-IN')} ({confidence(product)} confidence)
          </dd>
        </div>
        <div>
          <dt>Set aside as likely fake</dt>
          <dd>{suspiciousCount(product).toLocaleString('en-IN')}</dd>
        </div>
        <div>
          <dt>Deal-breakers failed</dt>
          <dd>{failed.length ? failed.map((s) => `${s.aspect.label} (${formatRate(s.problemRate)})`).join(', ') : 'None'}</dd>
        </div>
        <div>
          <dt>Notable cons</dt>
          <dd>{cons.length ? cons.map((s) => `${s.aspect.label} (${formatRate(s.problemRate)})`).join(', ') : 'None'}</dd>
        </div>
      </dl>
      <p style={{ marginTop: 10 }}>
        The verdict is calculated from reviews and updates when they change. Write the short answer to match it.
      </p>
    </div>
  )
}
