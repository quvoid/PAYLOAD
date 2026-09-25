'use client'

import React, { useEffect, useMemo, useState } from 'react'

import type { Review, Sentiment } from '@/lib/types'

// Filtering happens in the browser with no URL change, so review facets can never become
// crawlable URLs (docs/PLAN.md §7). Every review is in the server HTML; filters only hide.

const INITIAL = 20

interface Props {
  reviews: Review[]
  sources: { id: string; name: string }[]
  aspects: { slug: string; label: string }[]
  suspiciousBelow: number
}

const sentimentStyle: Record<Sentiment, string> = {
  positive: 'bg-shade-30 text-indigo',
  neutral: 'border border-hairline text-shade-60',
  negative: 'bg-blush text-indigo',
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-eyebrow uppercase text-shade-60">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`min-h-9 rounded-pill px-4 text-caption transition-colors ${
              value === o.value ? 'bg-indigo text-white' : 'border border-hairline bg-white text-ink hover:border-indigo'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function ReviewList({ reviews, sources, aspects, suspiciousBelow }: Props) {
  const [source, setSource] = useState('all')
  const [stars, setStars] = useState('all')
  const [aspect, setAspect] = useState('all')
  const [expanded, setExpanded] = useState(false)

  // A citation link (#rv-123) must always land on its review: clear filters and expand.
  useEffect(() => {
    const reveal = () => {
      const id = window.location.hash.slice(1)
      if (!id.startsWith('rv-')) return
      setSource('all')
      setStars('all')
      setAspect('all')
      setExpanded(true)
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'center' }))
    }
    reveal()
    window.addEventListener('hashchange', reveal)
    return () => window.removeEventListener('hashchange', reveal)
  }, [])

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) =>
          (source === 'all' || r.source === source) &&
          (stars === 'all' || r.rating === Number(stars)) &&
          (aspect === 'all' || r.aspects.some((a) => a.aspect === aspect)),
      ),
    [reviews, source, stars, aspect],
  )

  const sourceName = (id: string) => sources.find((s) => s.id === id)?.name ?? id
  const aspectLabel = (slug: string) => aspects.find((a) => a.slug === slug)?.label ?? slug

  return (
    <div>
      <div className="grid gap-6 rounded-lg border border-hairline p-5 md:grid-cols-3">
        <FilterGroup
          label="Source"
          value={source}
          onChange={setSource}
          options={[{ value: 'all', label: 'All' }, ...sources.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <FilterGroup
          label="Stars"
          value={stars}
          onChange={setStars}
          options={[{ value: 'all', label: 'All' }, ...['5', '4', '3', '2', '1'].map((s) => ({ value: s, label: `${s}★` }))]}
        />
        <FilterGroup
          label="Mentions"
          value={aspect}
          onChange={setAspect}
          options={[{ value: 'all', label: 'All' }, ...aspects.map((a) => ({ value: a.slug, label: a.label }))]}
        />
      </div>

      <p className="mt-6 text-caption text-shade-60" aria-live="polite">
        Showing {Math.min(filtered.length, expanded ? filtered.length : INITIAL)} of {filtered.length} reviews
        {filtered.length !== reviews.length && ` (filtered from ${reviews.length})`}
      </p>

      <ol className="mt-4 divide-y divide-hairline border-y border-hairline">
        {filtered.map((r, i) => {
          const flagged = r.credibility < suspiciousBelow
          return (
            <li key={r.id} id={`rv-${r.id}`} hidden={!expanded && i >= INITIAL} className="py-5">
              <article>
                <header className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
                  <span className="text-body-strong">{r.author}</span>
                  <span className="text-shade-60">{sourceName(r.source)}</span>
                  {r.rating !== undefined && (
                    <span className="tabular-nums" aria-label={`${r.rating} out of 5 stars`}>
                      {'★'.repeat(r.rating)}
                      <span className="text-shade-40">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  )}
                  {r.verified && <span className="text-shade-60">Verified purchase</span>}
                  <time dateTime={r.date.slice(0, 10)} className="text-shade-60">
                    {new Date(r.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'Asia/Kolkata',
                    })}
                  </time>
                </header>
                {r.original && (
                  <p lang={r.original.lang} className="mt-2 text-body-md">
                    {r.original.text}
                  </p>
                )}
                <p className={`mt-2 ${r.original ? 'text-caption text-shade-60' : ''}`}>
                  {r.original && <span className="text-micro uppercase">Translated · </span>}
                  {r.body}
                </p>
                {flagged && (
                  <p className="mt-2 inline-flex rounded-pill bg-blush px-3 py-1 text-micro">
                    Flagged: part of a burst of generic 5★ reviews — excluded from our counts
                  </p>
                )}
                {r.aspects.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Topics mentioned">
                    {r.aspects.map((a) => (
                      <li key={a.aspect} className={`rounded-pill px-3 py-0.5 text-micro ${sentimentStyle[a.sentiment]}`}>
                        {aspectLabel(a.aspect)} · {a.sentiment}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          )
        })}
      </ol>

      {!expanded && filtered.length > INITIAL && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 min-h-11 rounded-pill border border-indigo px-6 text-ink hover:bg-cream"
        >
          Show all {filtered.length} reviews
        </button>
      )}
    </div>
  )
}
