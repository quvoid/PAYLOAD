'use client'

import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { Icon, type IconName } from '@/components/Icon'

// "Find anything": one search box in the admin header (Ctrl/⌘ K) that opens any product, list,
// guide, page or setting, or starts a new one — so nobody has to learn where things live in the
// menu. Documents come from Payload's REST API with the editor's own login. Styles: custom.scss.

type Result = { key: string; title: string; meta: string; href: string; icon: IconName; external?: boolean }

const actions: Result[] = [
  { key: 'a-product', title: 'Review a new product', meta: 'Create', href: '/admin/collections/products/create', icon: 'layers' },
  { key: 'a-list', title: 'Write a ranked list', meta: 'Create', href: '/admin/collections/best-lists/create', icon: 'list' },
  { key: 'a-compare', title: 'Compare two products', meta: 'Create', href: '/admin/collections/comparisons/create', icon: 'scale' },
  { key: 'a-guide', title: 'Write a guide', meta: 'Create', href: '/admin/collections/guides/create', icon: 'message' },
  { key: 'a-page', title: 'Add a page', meta: 'Create', href: '/admin/collections/pages/create', icon: 'user' },
  { key: 'a-image', title: 'Upload an image', meta: 'Create', href: '/admin/collections/media/create', icon: 'arrow-up-right' },
  { key: 's-home', title: 'Edit the homepage', meta: 'Settings', href: '/admin/globals/site-settings', icon: 'sparkle' },
  { key: 's-menu', title: 'Menu & footer links', meta: 'Settings', href: '/admin/globals/navigation', icon: 'menu' },
  { key: 's-texts', title: 'Wording on fixed pages', meta: 'Settings', href: '/admin/globals/page-texts', icon: 'list' },
  { key: 's-seo', title: 'Search engines & analytics', meta: 'Settings', href: '/admin/globals/site-settings', icon: 'search' },
  { key: 's-requests', title: 'Reader requests', meta: 'Go to', href: '/admin/collections/review-requests', icon: 'message' },
  { key: 's-drafts', title: 'Drafts waiting', meta: 'Go to', href: '/admin/collections/products?where[_status][equals]=draft', icon: 'clock' },
  { key: 's-redirects', title: 'Redirects', meta: 'Go to', href: '/admin/collections/redirects', icon: 'arrow-right' },
  { key: 's-team', title: 'Team', meta: 'Go to', href: '/admin/collections/users', icon: 'user' },
  { key: 's-site', title: 'Open the website', meta: 'Website', href: '/', icon: 'arrow-up-right', external: true },
]

// What to search, the field each one is titled by, and how to label it.
const searchable: { slug: string; field: string; label: string; icon: IconName }[] = [
  { slug: 'products', field: 'name', label: 'Product', icon: 'layers' },
  { slug: 'best-lists', field: 'title', label: 'Ranked list', icon: 'list' },
  { slug: 'comparisons', field: 'slug', label: 'Head-to-head', icon: 'scale' },
  { slug: 'guides', field: 'title', label: 'Guide', icon: 'message' },
  { slug: 'pages', field: 'title', label: 'Page', icon: 'user' },
  { slug: 'categories', field: 'name', label: 'Category', icon: 'layers' },
  { slug: 'brands', field: 'name', label: 'Brand', icon: 'sparkle' },
  { slug: 'tags', field: 'name', label: 'Tag', icon: 'flag' },
]

const matches = (q: string, s: string) => s.toLowerCase().includes(q.toLowerCase())

/** Head-to-heads are titled by their web address (a-vs-b): show it as words, capitalised. */
const slugTitle = (slug: string) =>
  slug
    .split('-vs-')
    .map((side) => side.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' vs ')

/** "⌘ K" on a Mac, "Ctrl K" elsewhere (and while rendering on the server). */
const useShortcutLabel = () =>
  useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'),
    () => 'Ctrl K',
  )

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [docs, setDocs] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const shortcut = useShortcutLabel()

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setDocs([])
    opener.current?.focus()
  }, [])

  // Ctrl/⌘ K anywhere in the admin.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => input.current?.focus())
  }, [open])

  // Search the documents, a moment after typing stops.
  useEffect(() => {
    const q = query.trim()
    if (!open || q.length < 2) return
    const controller = new AbortController()
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const lists = await Promise.all(
          searchable.map(async (c) => {
            const url = `/api/${c.slug}?where[${c.field}][like]=${encodeURIComponent(q)}&limit=4&depth=0&draft=true`
            const res = await fetch(url, { credentials: 'include', signal: controller.signal })
            if (!res.ok) return []
            const data = (await res.json()) as { docs?: Record<string, unknown>[] }
            return (data.docs ?? []).map((d) => {
              const raw = String(d[c.field] ?? d.slug ?? 'Untitled')
              return {
                key: `${c.slug}-${d.id}`,
                title: c.field === 'slug' ? slugTitle(raw) : raw,
                meta: `${c.label}${d._status === 'draft' ? ' · Draft' : ''}`,
                href: `/admin/collections/${c.slug}/${d.id}`,
                icon: c.icon,
              }
            })
          }),
        )
        setDocs(lists.flat())
      } catch {
        // Aborted by the next keystroke, or offline: keep the last results.
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [query, open])

  const results = useMemo(() => {
    const q = query.trim()
    const acts = q ? actions.filter((a) => matches(q, `${a.title} ${a.meta}`)) : actions.slice(0, 8)
    return q.length >= 2 ? [...docs, ...acts] : acts
  }, [query, docs])

  const go = (r: Result) => {
    if (r.external) window.open(r.href, '_blank', 'noopener')
    else router.push(r.href)
    close()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return close()
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const n = results.length
      if (n) setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + n) % n)
    }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    }
  }

  return (
    <>
      <button ref={opener} type="button" className="rl-find" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon name="search" className="rl-icon rl-icon--sm" />
        <span className="rl-find__label">Find anything</span>
        <kbd className="rl-kbd">{shortcut}</kbd>
      </button>
      {open && (
        <div className="rl-palette" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" aria-label="Find anything" className="rl-palette__box" onKeyDown={onKeyDown}>
            <div className="rl-palette__input">
              <Icon name="search" className="rl-icon" />
              <input
                ref={input}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                placeholder="Search products, lists, pages… or type what you want to do"
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="rl-palette-results"
                aria-activedescendant={results[active] ? `rl-r-${results[active].key}` : undefined}
              />
              {loading && <span className="rl-palette__spinner" aria-hidden />}
              <kbd className="rl-kbd">Esc</kbd>
            </div>
            <ul id="rl-palette-results" role="listbox" className="rl-palette__results">
              {results.length === 0 ? (
                <li className="rl-palette__empty">
                  {query.trim().length < 2 ? 'Keep typing…' : loading ? 'Searching…' : `Nothing called “${query}” yet.`}
                </li>
              ) : (
                results.map((r, i) => (
                  <li
                    key={r.key}
                    id={`rl-r-${r.key}`}
                    role="option"
                    aria-selected={i === active}
                    className={i === active ? 'is-active' : ''}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                  >
                    <span className="rl-badge rl-badge--soft">
                      <Icon name={r.icon} className="rl-icon rl-icon--sm" />
                    </span>
                    <span className="rl-palette__title">{r.title}</span>
                    <span className="rl-tag">{r.meta}</span>
                  </li>
                ))
              )}
            </ul>
            <p className="rl-palette__foot">
              <kbd className="rl-kbd">↑</kbd> <kbd className="rl-kbd">↓</kbd> to move · <kbd className="rl-kbd">Enter</kbd> to open
            </p>
          </div>
        </div>
      )}
    </>
  )
}
