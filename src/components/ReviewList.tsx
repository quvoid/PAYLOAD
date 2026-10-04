'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { Review, Sentiment } from '@/lib/types'

import { Icon, Stars } from './Icon'

// Filtering happens in the browser with no URL change, so review facets can never become
// crawlable URLs (docs/PLAN.md §7). The first reviews ship in the server HTML; the rest load from
// a static JSON file the first time a reader filters or asks for them.

const INITIAL = 20
const EXCERPT = 600

interface Props {
  /** Reviews included in the HTML. */
  reviews: Review[]
  /** How many reviews exist in total; more than `reviews.length` means the rest are in `allUrl`. */
  total: number
  allUrl: string
  sources: { id: string; name: string }[]
  aspects: { slug: string; label: string }[]
  suspiciousBelow: number
}

const sentimentStyle: Record<Sentiment, string> = {
  positive: 'bg-shade-30 text-indigo',
  neutral: 'border border-hairline text-shade-60',
  negative: 'bg-blush text-indigo',
}

const sentimentDot: Record<Sentiment, string> = {
  positive: 'bg-indigo',
  neutral: 'bg-shade-40',
  negative: 'bg-pink',
}

/** Two initials on a palette fill, picked from the name so the same reviewer keeps one colour. */
function Avatar({ name }: { name: string }) {
  const initials =
    name
      .replace(/^u\//, '')
      .split(/[\s_.-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || '?'
  const fills = ['bg-peach', 'bg-shade-30', 'bg-blush']
  const fill = fills[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % fills.length]
  return (
    <span aria-hidden className={`flex size-10 shrink-0 items-center justify-center rounded-pill text-caption text-indigo ${fill}`}>
      {initials}
    </span>
  )
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
              value === o.value ? 'bg-indigo text-white' : 'border border-hairline bg-white text-ink hover:border-indigo hover:bg-cream'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function ReviewList({ reviews, total, allUrl, sources, aspects, suspiciousBelow }: Props) {
  const [source, setSource] = useState('all')
  const [stars, setStars] = useState('all')
  const [aspect, setAspect] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [all, setAll] = useState<Review[] | null>(total > reviews.length ? null : reviews)
  const [loading, setLoading] = useState(false)
  const list = all ?? reviews

  const loadAll = useCallback(async () => {
    if (all || loading) return all
    setLoading(true)
    try {
      const data: Review[] = await (await fetch(allUrl)).json()
      setAll(data)
      return data
    } finally {
      setLoading(false)
    }
  }, [all, allUrl, loading])

  // Filters apply to every review, so the first one used loads the rest.
  const filterWith = (set: (v: string) => void) => (v: string) => {
    set(v)
    if (v !== 'all') void loadAll()
  }

  // A citation link (#rv-123) must always land on its review: clear filters, load, expand.
  useEffect(() => {
    const reveal = async () => {
      const id = window.location.hash.slice(1)
      if (!id.startsWith('rv-')) return
      setSource('all')
      setStars('all')
      setAspect('all')
      setExpanded(true)
      if (!document.getElementById(id)) await loadAll()
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'center' }))
    }
    void reveal()
    window.addEventListener('hashchange', reveal)
    return () => window.removeEventListener('hashchange', reveal)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once; loadAll is stable enough for a hash jump
  }, [])

  const filtered = useMemo(
    () =>
      list.filter(
        (r) =>
          (source === 'all' || r.source === source) &&
          (stars === 'all' || r.rating === Number(stars)) &&
          (aspect === 'all' || r.aspects.some((a) => a.aspect === aspect)),
      ),
    [list, source, stars, aspect],
  )
  const shown = all ? filtered.length : total

  const sourceName = (id: string) => sources.find((s) => s.id === id)?.name ?? id
  const aspectLabel = (slug: string) => aspects.find((a) => a.slug === slug)?.label ?? slug

  return (
    <div>
      <div className="grid gap-6 rounded-lg bg-cream p-5 md:grid-cols-3">
        <FilterGroup
          label="Source"
          value={source}
          onChange={filterWith(setSource)}
          options={[{ value: 'all', label: 'All' }, ...sources.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <FilterGroup
          label="Stars"
          value={stars}
          onChange={filterWith(setStars)}
          options={[{ value: 'all', label: 'All' }, ...['5', '4', '3', '2', '1'].map((s) => ({ value: s, label: `${s}★` }))]}
        />
        <FilterGroup
          label="Mentions"
          value={aspect}
          onChange={filterWith(setAspect)}
          options={[{ value: 'all', label: 'All' }, ...aspects.map((a) => ({ value: a.slug, label: a.label }))]}
        />
      </div>

      <p className="mt-6 text-caption text-shade-60" aria-live="polite">
        {loading
          ? 'Loading every review…'
          : `Showing ${Math.min(filtered.length, expanded ? filtered.length : INITIAL)} of ${shown} reviews${
              all && filtered.length !== all.length ? ` (filtered from ${all.length})` : ''
            }`}
      </p>

      <ol className="mt-4 grid gap-4">
        {filtered.map((r, i) => {
          const flagged = r.credibility < suspiciousBelow
          return (
            <li
              key={r.id}
              id={`rv-${r.id}`}
              hidden={!expanded && i >= INITIAL}
              className={`rounded-lg border bg-white p-5 target:border-pink target:shadow-l3 md:p-6 ${flagged ? 'border-dashed border-blush' : 'border-hairline'}`}
            >
              <article>
                <header className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption">
                  <Avatar name={r.author} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2">
                      <span className="text-body-strong">{r.author}</span>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-micro text-shade-60">
                          <Icon name="shield" className="size-3.5 text-indigo" />
                          Verified purchase
                        </span>
                      )}
                    </p>
                    <p className="text-micro text-shade-60">
                      {sourceName(r.source)} ·{' '}
                      <time dateTime={r.date.slice(0, 10)}>
                        {new Date(r.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'Asia/Kolkata',
                        })}
                      </time>
                    </p>
                  </div>
                  {r.rating !== undefined && (
                    <span className="ml-auto inline-flex items-center gap-2 text-indigo">
                      <Stars rating={r.rating} />
                      <span className="sr-only">{r.rating} out of 5 stars</span>
                    </span>
                  )}
                </header>
                {r.original && (
                  <p lang={r.original.lang} className="mt-4 text-body-md">
                    {r.original.text}
                  </p>
                )}
                <p className={`${r.original ? 'mt-2 text-caption text-shade-60' : 'mt-4'}`}>
                  {r.original && <span className="text-micro uppercase">Translated · </span>}
                  {r.body.length > EXCERPT ? `${r.body.slice(0, EXCERPT).trimEnd()}…` : r.body}
                </p>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="mt-2 inline-block text-micro text-shade-60 underline underline-offset-4 hover:text-ink"
                  >
                    {r.body.length > EXCERPT ? 'Read the full review' : 'View original'} on {sourceName(r.source)} ↗
                  </a>
                )}
                {flagged && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-blush px-3 py-1 text-micro">
                    <Icon name="flag" className="size-3.5" />
                    Flagged: part of a burst of generic 5★ reviews — excluded from our counts
                  </p>
                )}
                {r.aspects.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics mentioned">
                    {r.aspects.map((a) => (
                      <li
                        key={a.aspect}
                        className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-micro ${sentimentStyle[a.sentiment]}`}
                      >
                        <span aria-hidden className={`size-1.5 rounded-pill ${sentimentDot[a.sentiment]}`} />
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

      {(!expanded && filtered.length > INITIAL) || (!all && total > reviews.length) ? (
        <button
          type="button"
          onClick={() => {
            setExpanded(true)
            void loadAll()
          }}
          disabled={loading}
          className="mt-6 min-h-11 rounded-pill border border-indigo px-6 text-ink hover:bg-cream disabled:opacity-60"
        >
          {loading ? 'Loading…' : `Show all ${all ? filtered.length : total} reviews`}
        </button>
      ) : null}
    </div>
  )
}
