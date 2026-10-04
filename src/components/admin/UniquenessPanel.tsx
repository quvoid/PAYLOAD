import type { UIFieldServerComponent } from 'payload'
import React from 'react'

import { Icon } from '@/components/Icon'
import { nearestTo, publishedDocs, UNIQUENESS_THRESHOLD, type UniqueCollection } from '@/lib/uniqueness'

// Sidebar of products, lists, head-to-heads, guides and pages: how different this page's wording
// is from the most similar published page of the same type (docs: programmatic-seo). Checked
// against the last save.

// Styles live in app/(payload)/custom.scss (.rl-panel, .rl-meter).

const title = (
  <strong>
    <Icon name="sparkle" className="rl-icon rl-icon--sm" />
    Uniqueness
  </strong>
)

export const UniquenessPanel: UIFieldServerComponent = async ({ data, payload, collectionSlug }) => {
  const collection = collectionSlug as UniqueCollection
  if (!data?.id) {
    return (
      <div className="rl-panel">
        {title}
        <p style={{ marginTop: 6 }}>Save to compare this page with the others.</p>
      </div>
    )
  }
  const [site, others] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    publishedDocs(payload, collection),
  ])
  const threshold = site.uniquenessThreshold ?? UNIQUENESS_THRESHOLD
  const result = nearestTo(collection, data, others)
  const pct = Math.round(result.distance * 100)
  const ok = result.distance >= threshold
  return (
    <div className="rl-panel">
      {title}
      {result.tooShort ? (
        <p style={{ marginTop: 6 }}>Not enough wording yet to compare.</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginTop: 10 }}>
            <span className="rl-num" style={{ fontSize: 28, color: ok ? 'var(--rl-ink)' : 'var(--rl-warn)' }}>{pct}%</span>
            <span className={`rl-chip ${ok ? 'rl-chip--buy' : 'rl-chip--skip'}`}>
              <Icon name={ok ? 'check' : 'alert'} className="rl-icon rl-icon--sm" />
              {ok ? 'Unique enough' : 'Too similar'}
            </span>
          </div>
          <div aria-hidden className={`rl-meter ${ok ? '' : 'rl-meter--warn'}`}>
            <span style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p>own wording, compared with the closest published page of this type.</p>
          {result.nearest && (
            <p>
              Closest:{' '}
              <a href={`/admin/collections/${collection}/${result.nearest.id}`}>{result.nearest.title}</a>
            </p>
          )}
          <p>
            {ok
              ? `Needs at least ${Math.round(threshold * 100)}%.`
              : `Needs at least ${Math.round(threshold * 100)}%. Rewrite the parts shared with the closest page${site.blockDuplicates ? ' — publishing is blocked until then.' : '.'}`}
          </p>
        </>
      )}
    </div>
  )
}
