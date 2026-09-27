import type { UIFieldServerComponent } from 'payload'
import React from 'react'

import { nearestTo, publishedDocs, UNIQUENESS_THRESHOLD, type UniqueCollection } from '@/lib/uniqueness'

// Sidebar of products, lists, head-to-heads, guides and pages: how different this page's wording
// is from the most similar published page of the same type (docs: programmatic-seo). Checked
// against the last save.

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m)',
  padding: 'calc(var(--base) * 0.75)',
  marginBottom: 'var(--base)',
  background: 'var(--theme-elevation-50)',
}
const muted: React.CSSProperties = { color: 'var(--theme-elevation-600)', fontSize: 13, margin: 0 }

export const UniquenessPanel: UIFieldServerComponent = async ({ data, payload, collectionSlug }) => {
  const collection = collectionSlug as UniqueCollection
  if (!data?.id) {
    return (
      <div style={box}>
        <strong>Uniqueness</strong>
        <p style={{ ...muted, marginTop: 6 }}>Save to compare this page with the others.</p>
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
  const colour = result.tooShort ? 'var(--theme-elevation-600)' : ok ? '#2a7a3b' : '#b3261e'
  return (
    <div style={box}>
      <strong>Uniqueness</strong>
      {result.tooShort ? (
        <p style={{ ...muted, marginTop: 6 }}>Not enough wording yet to compare.</p>
      ) : (
        <>
          <p style={{ fontSize: 20, fontWeight: 600, margin: '8px 0', color: colour }}>
            {pct}% own wording {ok ? '✓' : '— too similar'}
          </p>
          {result.nearest && (
            <p style={muted}>
              Closest:{' '}
              <a href={`/admin/collections/${collection}/${result.nearest.id}`}>{result.nearest.title}</a>
            </p>
          )}
          <p style={{ ...muted, marginTop: 6 }}>
            {ok
              ? `Needs at least ${Math.round(threshold * 100)}%.`
              : `Needs at least ${Math.round(threshold * 100)}%. Rewrite the parts shared with the closest page${site.blockDuplicates ? ' — publishing is blocked until then.' : '.'}`}
          </p>
        </>
      )}
    </div>
  )
}
