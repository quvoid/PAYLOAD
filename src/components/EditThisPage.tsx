'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Icon } from './Icon'

// "Edit this page": while an editor is logged in, every page of the site shows a button that
// opens the matching document in the admin — browse the site, spot something, fix it. Only
// browsers that have opened the admin ever ask whether someone is logged in (EditorFlag sets the
// flag), so readers make no extra request.

type Target = { collections: string[]; slug: string } | { global: string }

/** Which admin document a public address comes from. */
function targetFor(path: string): Target | undefined {
  const [first, second, ...rest] = path.split('/').filter(Boolean)
  if (rest.length) return undefined
  if (!first) return { global: 'site-settings' }
  const nested: Record<string, string[]> = {
    reviews: ['products'],
    best: ['best-lists'],
    compare: ['comparisons', 'categories'],
    brands: ['brands'],
    topics: ['guides'],
    tags: ['tags'],
    authors: ['users'],
  }
  if (second) return nested[first] ? { collections: nested[first], slug: second } : { collections: ['categories'], slug: second }
  if (['best', 'compare', 'categories', 'methodology', 'sources', 'search'].includes(first)) return { global: 'page-texts' }
  return { collections: ['categories', 'pages'], slug: first }
}

async function resolve(target: Target): Promise<string | undefined> {
  if ('global' in target) return `/admin/globals/${target.global}`
  for (const c of target.collections) {
    const res = await fetch(`/api/${c}?where[slug][equals]=${encodeURIComponent(target.slug)}&limit=1&depth=0&draft=true`, {
      credentials: 'include',
    })
    if (!res.ok) continue
    const doc = ((await res.json()) as { docs?: { id: string | number }[] }).docs?.[0]
    if (doc) return `/admin/collections/${c}/${doc.id}`
  }
  return undefined
}

export function EditThisPage() {
  const pathname = usePathname()
  const [href, setHref] = useState<string>()
  const [hidden, setHidden] = useState(false)
  const [raised, setRaised] = useState(false)

  useEffect(() => {
    let live = true
    const run = async () => {
      try {
        if (localStorage.getItem('rl-editor') !== '1') return
      } catch {
        return
      }
      const me = await fetch('/api/users/me', { credentials: 'include' }).then((r) => r.json()).catch(() => null)
      if (!me?.user) {
        // Logged out: stop asking on every page until the admin is opened again.
        try {
          localStorage.removeItem('rl-editor')
        } catch {}
        return
      }
      const target = targetFor(pathname)
      const url = target ? await resolve(target).catch(() => undefined) : undefined
      if (live) {
        setHref(url ?? '/admin')
        setRaised(Boolean(document.querySelector('[data-mobile-buy-bar]')))
      }
    }
    void run()
    return () => {
      live = false
    }
  }, [pathname])

  if (!href || hidden) return null
  const editing = href !== '/admin'
  return (
    <div
      className={`fixed left-4 z-40 flex items-center gap-1 rounded-pill bg-night-deep p-1 text-white shadow-l4 lg:bottom-5 ${raised ? 'bottom-24' : 'bottom-5'}`}
    >
      <a
        href={href}
        className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-white px-4 text-caption text-indigo transition-colors hover:bg-peach"
      >
        <Icon name="edit" className="size-4" />
        {editing ? 'Edit this page' : 'Open the admin'}
      </a>
      {editing && (
        // A full page load, not a client-side <Link>: the admin is a separate app with its own layout.
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/admin" className="inline-flex min-h-10 items-center rounded-pill px-3 text-caption text-peach hover:text-aqua">
          Admin
        </a>
      )}
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Hide the edit button"
        className="inline-flex size-10 items-center justify-center rounded-pill text-shade-40 hover:text-white"
      >
        <Icon name="x" className="size-4" />
      </button>
    </div>
  )
}
