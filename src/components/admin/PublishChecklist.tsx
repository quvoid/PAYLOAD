'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { Icon } from '@/components/Icon'

// Product sidebar: "Ready to publish?" — what's done and what's left, ticking off live as the
// editor types. Each open item jumps to the tab and field that finishes it. Reviews come from
// the pipeline, so that one is read from the server. Styles: app/(payload)/custom.scss.

type Fields = Record<string, { value?: unknown } | undefined>

const text = (f: Fields, path: string) => (typeof f[path]?.value === 'string' ? (f[path]!.value as string).trim() : '')
const rows = (f: Fields, path: string) => {
  const v = f[path]?.value
  return typeof v === 'number' ? v : Array.isArray(v) ? v.length : 0
}
const filled = (f: Fields, path: string) => {
  const v = f[path]?.value
  return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
}

/** Opens the tab with this label, then focuses the field — so "fix this" is one click. */
function goTo(tab: string, path: string) {
  const button = [...document.querySelectorAll<HTMLButtonElement>('.tabs-field__tab-button')].find(
    (b) => b.textContent?.trim().startsWith(tab),
  )
  button?.click()
  requestAnimationFrame(() =>
    setTimeout(() => {
      const el = document.getElementById(`field-${path.replace(/\./g, '__')}`)
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el?.focus({ preventScroll: true })
    }, 120),
  )
}

export function PublishChecklist() {
  const { id } = useDocumentInfo()
  const fields = useFormFields(([f]) => f) as Fields
  const [reviews, setReviews] = useState<number | null>(null)

  useEffect(() => {
    if (!id) return
    let live = true
    fetch(`/api/reviews?where[product][equals]=${id}&limit=0&depth=0`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => live && setReviews(typeof d.totalDocs === 'number' ? d.totalDocs : 0))
      .catch(() => live && setReviews(0))
    return () => {
      live = false
    }
  }, [id])

  const items = [
    {
      label: 'Name, brand and category',
      done: Boolean(text(fields, 'name')) && filled(fields, 'brand') && filled(fields, 'category'),
      tab: 'Basics',
      path: 'name',
    },
    {
      label: 'Where to find reviews',
      hint: 'A Flipkart link, a store ID or a price with a link',
      done:
        Boolean(text(fields, 'flipkartUrl') || text(fields, 'playStoreId') || text(fields, 'appStoreId')) || rows(fields, 'offers') > 0,
      tab: 'Data collection',
      path: 'flipkartUrl',
    },
    {
      label: 'Reviews collected',
      hint: reviews === null ? 'Checking…' : reviews ? `${reviews.toLocaleString('en-IN')} reviews` : 'Run the review pipeline',
      done: Boolean(reviews),
      tab: 'Data collection',
      path: 'platformStats',
    },
    {
      label: 'Short answer',
      hint: 'One or two sentences',
      done: text(fields, 'answer').length >= 60,
      tab: 'Verdict',
      path: 'answer',
    },
    {
      label: 'Verdict explained',
      hint: 'Two short paragraphs',
      done: text(fields, 'verdictBody').length >= 120,
      tab: 'Verdict',
      path: 'verdictBody',
    },
    { label: 'Pros and cons', hint: 'At least two', done: rows(fields, 'claims') >= 2, tab: 'Verdict', path: 'claims' },
    { label: 'Questions answered', hint: 'At least two', done: rows(fields, 'faq') >= 2, tab: 'Questions', path: 'faq' },
  ]
  const done = items.filter((i) => i.done).length
  const all = done === items.length
  const pct = Math.round((done / items.length) * 100)

  return (
    <div className={`rl-panel rl-check ${all ? 'rl-check--ready' : ''}`}>
      <div className="rl-check__head">
        <div className="rl-ring rl-ring--sm">
          <svg aria-hidden viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="rl-ring__track" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${pct} 101`}
              className="rl-ring__arc rl-check__arc"
            />
          </svg>
          <span className="rl-ring__value">{all ? <Icon name="check" className="rl-icon" /> : `${done}/${items.length}`}</span>
          {all && (
            <span aria-hidden className="rl-confetti">
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} style={{ '--i': i } as React.CSSProperties} />
              ))}
            </span>
          )}
        </div>
        <div>
          <strong>{all ? 'Ready to publish' : 'Ready to publish?'}</strong>
          <p>{all ? 'Everything readers need is here. Press Publish when you’re happy.' : `${items.length - done} left before this page is complete.`}</p>
        </div>
      </div>
      <ul className="rl-check__list" aria-label="Publishing checklist">
        {items.map((i) => (
          <li key={i.label} className={i.done ? 'is-done' : ''}>
            <button type="button" onClick={() => goTo(i.tab, i.path)} disabled={i.done}>
              <span className="rl-check__box" aria-hidden>
                {i.done && <Icon name="check" className="rl-icon rl-icon--sm" />}
              </span>
              <span>
                <span className="rl-check__label">{i.label}</span>
                {i.hint && !i.done && <span className="rl-check__hint">{i.hint}</span>}
              </span>
              <span className="rl-sr">{i.done ? ' (done)' : ' (to do)'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
