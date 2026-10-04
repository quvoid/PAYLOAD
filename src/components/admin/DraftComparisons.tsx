'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import React, { useState } from 'react'

import { Icon } from '@/components/Icon'

// Category sidebar: draft head-to-heads between the category's best-scoring products, for an
// editor to write and publish. Nothing is published automatically.

type Result = { created: { id: number; slug: string }[]; skipped: number; message?: string }

// Styles live in app/(payload)/custom.scss (.rl-panel).

export function DraftComparisons() {
  const { id } = useDocumentInfo()
  const [top, setTop] = useState(3)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  if (!id) return null
  const run = async () => {
    setBusy(true)
    setResult(null)
    try {
      const res = await fetch(`/api/categories/${id}/draft-comparisons`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top }),
      })
      setResult(await res.json())
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="rl-panel">
      <strong>
        <Icon name="scale" className="rl-icon rl-icon--sm" />
        Head-to-heads
      </strong>
      <p style={{ margin: '6px 0' }}>
        Draft a comparison for every pair among this category’s best-scoring products. You write the judgement
        and publish.
      </p>
      <label style={{ fontSize: 13 }}>
        Top{' '}
        <select value={top} onChange={(e) => setTop(Number(e.target.value))}>
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>{' '}
        products ({(top * (top - 1)) / 2} pairs)
      </label>
      <div style={{ marginTop: 8 }}>
        <button type="button" className="btn btn--style-primary btn--size-small" disabled={busy} onClick={run}>
          {busy ? 'Drafting…' : 'Draft head-to-heads'}
        </button>
      </div>
      {result && (
        <div style={{ fontSize: 13, marginTop: 8 }}>
          {result.message ?? `${result.created.length} drafted, ${result.skipped} already existed.`}
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {result.created.map((c) => (
              <li key={c.id}>
                <a href={`/admin/collections/comparisons/${c.id}`}>{c.slug}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
