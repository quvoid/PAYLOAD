import type { UIFieldServerComponent } from 'payload'
import React from 'react'

import { getCategory, getProductForPreview } from '@/lib/catalog'
import { formatRate, formatScore } from '@/lib/format'
import { compositeScore, confidence, countedReviews, failedDealBreakers, notableCons } from '@/lib/metrics'
import { ensureCatalog } from '@/lib/store'
import { verdictLabel } from '@/lib/verdict'

// Product sidebar: what the scoring rules say about this product right now, so an editor can
// write the wording to match — and see why, without doing any maths.

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m)',
  padding: 'calc(var(--base) * 0.75)',
  marginBottom: 'var(--base)',
  background: 'var(--theme-elevation-50)',
}
const muted: React.CSSProperties = { color: 'var(--theme-elevation-600)', fontSize: 13, margin: 0 }

export const VerdictPreview: UIFieldServerComponent = async ({ data }) => {
  const slug = typeof data?.slug === 'string' ? data.slug : undefined
  if (!slug) {
    return (
      <div style={box}>
        <p style={muted}>Save the product to see what the scoring rules say about it.</p>
      </div>
    )
  }
  await ensureCatalog()
  const product = getProductForPreview(slug)
  if (!product || product.reviews.length === 0) {
    return (
      <div style={box}>
        <strong>What the rules say</strong>
        <p style={{ ...muted, marginTop: 6 }}>
          No reviews collected yet. Add store links under “Data collection” and run the review pipeline.
        </p>
      </div>
    )
  }
  const app = Boolean(getCategory(product.category)?.appCategory)
  const cons = notableCons(product)
  const failed = failedDealBreakers(product)
  return (
    <div style={box}>
      <strong>What the rules say</strong>
      <p style={{ fontSize: 20, fontWeight: 600, margin: '8px 0', color: '#440381' }}>
        {verdictLabel(product.verdict, app)}
      </p>
      <p style={muted}>
        Satisfaction {formatScore(compositeScore(product))} / 10 · {countedReviews(product).length.toLocaleString('en-IN')}{' '}
        reviews ({confidence(product)} confidence)
      </p>
      {failed.length > 0 && (
        <p style={{ ...muted, marginTop: 8 }}>
          <strong>Deal-breakers failed:</strong>{' '}
          {failed.map((s) => `${s.aspect.label} (${formatRate(s.problemRate)})`).join(', ')}
        </p>
      )}
      <p style={{ ...muted, marginTop: 8 }}>
        <strong>Notable cons:</strong>{' '}
        {cons.length ? cons.map((s) => `${s.aspect.label} (${formatRate(s.problemRate)} report a problem)`).join(', ') : 'none'}
      </p>
      <p style={{ ...muted, marginTop: 8 }}>
        The verdict is calculated from reviews and updates when they change. Write the short answer to match it.
      </p>
    </div>
  )
}
