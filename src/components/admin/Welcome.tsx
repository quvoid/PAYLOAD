import Link from 'next/link'
import type { Payload, TypedUser } from 'payload'
import React from 'react'

import { Icon, type IconName } from '@/components/Icon'
import { getPayloadClient } from '@/lib/store'

// The top of the admin dashboard, built around what an editor wants to do rather than how the
// data is stored: a greeting with what needs attention, one-click tasks, a to-do list, the pages
// they were last working on, and a short tour for newcomers. Styles: app/(payload)/custom.scss.

const tasks: { title: string; body: string; href: string; icon: IconName; tone: string }[] = [
  { title: 'Review a new product', body: 'Name it, pick a category, add store links.', href: '/admin/collections/products/create', icon: 'layers', tone: 'peach' },
  { title: 'Write a ranked list', body: '“Best whey under ₹2,500” and the like.', href: '/admin/collections/best-lists/create', icon: 'list', tone: 'blush' },
  { title: 'Compare two products', body: 'A head-to-head for shoppers torn between two.', href: '/admin/collections/comparisons/create', icon: 'scale', tone: 'shade' },
  { title: 'Write a guide', body: 'Answer a question people keep asking.', href: '/admin/collections/guides/create', icon: 'message', tone: 'cream' },
  { title: 'Edit the homepage', body: 'Headline, introduction and the “how it works” steps.', href: '/admin/globals/site-settings', icon: 'sparkle', tone: 'peach' },
  { title: 'Change the menu & footer', body: 'Pick the links people see on every page.', href: '/admin/globals/navigation', icon: 'menu', tone: 'blush' },
  { title: 'Add a page', body: 'About, Contact or anything else, in a simple editor.', href: '/admin/collections/pages/create', icon: 'user', tone: 'shade' },
  { title: 'Upload images', body: 'Add photos and describe them for screen readers.', href: '/admin/collections/media/create', icon: 'arrow-up-right', tone: 'cream' },
]

const tourSteps: { title: string; body: string; icon: IconName }[] = [
  { title: 'Add a product', body: 'Products → Create new. Give it a name, brand, category and store links. Save it as a draft.', icon: 'layers' },
  { title: 'Collect reviews', body: 'The review pipeline reads the store links, collects reviews and fills in every number.', icon: 'message' },
  { title: 'Write the words', body: 'The short answer, the verdict and the pros and cons. The checklist on the right shows what’s left.', icon: 'list' },
  { title: 'Publish', body: 'Publishing approves the page: it goes live straight away with your name on it.', icon: 'check' },
]

// The editorial collections an editor works in, with how to name and link each document.
const editorial = [
  { slug: 'products', label: 'Product', title: 'name' },
  { slug: 'best-lists', label: 'Ranked list', title: 'title' },
  { slug: 'comparisons', label: 'Head-to-head', title: 'slug' },
  { slug: 'guides', label: 'Guide', title: 'title' },
  { slug: 'pages', label: 'Page', title: 'title' },
] as const

type Doc = { id: string | number; updatedAt?: string; _status?: string; [k: string]: unknown }
type Item = { href: string; label: string; title: string; draft: boolean; updatedAt?: string }

/** Head-to-heads are titled by their web address (a-vs-b): show it as words, capitalised. */
const slugTitle = (slug: string) =>
  slug
    .split('-vs-')
    .map((side) => side.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' vs ')

const titleOf = (c: (typeof editorial)[number], d: Doc) => {
  const raw = String(d[c.title] || d.slug || `Untitled ${c.label.toLowerCase()}`)
  return c.title === 'slug' && d[c.title] ? slugTitle(raw) : raw
}

const asItem = (c: (typeof editorial)[number], d: Doc): Item => ({
  href: `/admin/collections/${c.slug}/${d.id}`,
  label: c.label,
  title: titleOf(c, d),
  draft: d._status === 'draft',
  updatedAt: d.updatedAt,
})

/** Reads for the dashboard. Each one fails soft, so a slow query never breaks the page. */
async function load(payload: Payload) {
  const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback)
  const find = (slug: string, where: Record<string, unknown> | undefined, sort: string, limit: number) =>
    safe(
      payload
        .find({ collection: slug as 'products', where: where as never, sort, limit, depth: 0, draft: true, overrideAccess: true })
        .then((r) => r.docs as unknown as Doc[]),
      [] as Doc[],
    )
  const [drafts, recent, requests, published, reviews] = await Promise.all([
    Promise.all(editorial.map((c) => find(c.slug, { _status: { equals: 'draft' } }, '-updatedAt', 5).then((ds) => ds.map((d) => asItem(c, d))))),
    Promise.all(editorial.map((c) => find(c.slug, undefined, '-updatedAt', 6).then((ds) => ds.map((d) => asItem(c, d))))),
    find('review-requests', { status: { equals: 'new' } }, '-requestCount', 4),
    safe(
      payload.count({ collection: 'products', where: { _status: { equals: 'published' } }, overrideAccess: true }).then((r) => r.totalDocs),
      undefined,
    ),
    safe(payload.count({ collection: 'reviews', overrideAccess: true }).then((r) => r.totalDocs), undefined),
  ])
  const byDate = (a: Item, b: Item) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
  return {
    drafts: drafts.flat().sort(byDate),
    recent: recent.flat().sort(byDate).slice(0, 6),
    requests: requests.map((r) => ({ id: r.id, query: String(r.query ?? ''), count: Number(r.requestCount ?? 1) })),
    published,
    reviews,
  }
}

const ago = (iso?: string) => {
  if (!iso) return ''
  const s = (new Date(iso).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' })
  for (const [unit, size] of [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ] as const) {
    if (Math.abs(s) >= size) return rtf.format(Math.round(s / size), unit)
  }
  return 'just now'
}

/** Morning, afternoon or evening in India, where the team works. */
function greeting(name?: string) {
  const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  const part = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = name?.trim().split(/\s+/)[0]
  return first ? `${part}, ${first}` : part
}

export async function Welcome({ payload, user }: { payload?: Payload; user?: TypedUser | null }) {
  const data = await load(payload ?? (await getPayloadClient()))
  const waiting = data.drafts.length + data.requests.length
  const name = user && 'name' in user ? (user.name as string | undefined) : undefined

  return (
    <section className="rl-section">
      <div className="rl-hero">
        <div aria-hidden className="rl-hero__dots" />
        <div className="rl-hero__body">
          <div>
            <p className="rl-eyebrow">ReviewLens admin</p>
            <h2>
              {greeting(name)} <span aria-hidden>👋</span>
            </h2>
            <p>
              {waiting
                ? `${waiting} ${waiting === 1 ? 'thing is' : 'things are'} waiting for you below. Every number on the site is calculated from real reviews — you write the words and decide what goes live.`
                : 'Nothing is waiting for you — enjoy a chai. Every number on the site is calculated from real reviews; you write the words and decide what goes live.'}
            </p>
          </div>
          <div className="rl-hero__actions">
            <Link className="rl-pill rl-pill--white" href="/admin/collections/products/create">
              <Icon name="layers" className="rl-icon rl-icon--sm" />
              Review a new product
            </Link>
            <a className="rl-pill rl-pill--outline" href="/" target="_blank" rel="noopener">
              Open the website
              <Icon name="arrow-up-right" className="rl-icon rl-icon--sm" />
            </a>
          </div>
        </div>
        <dl className="rl-hero__stats">
          {[
            { label: 'Published products', value: data.published },
            { label: 'Drafts waiting', value: data.drafts.length },
            { label: 'Reader requests', value: data.requests.length },
            { label: 'Reviews collected', value: data.reviews },
          ].map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value === undefined ? '—' : s.value.toLocaleString('en-IN')}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rl-section__head">
        <h3>What would you like to do?</h3>
        <span className="rl-muted rl-hide-sm" style={{ fontSize: 13 }}>
          Or press <kbd className="rl-kbd">Ctrl</kbd> <kbd className="rl-kbd">K</kbd> to find anything
        </span>
      </div>
      <ul className="rl-tasks">
        {tasks.map((t) => (
          <li key={t.title} className={`rl-task rl-task--${t.tone}`}>
            <span className="rl-task__icon">
              <Icon name={t.icon} className="rl-icon" />
            </span>
            <span>
              <Link href={t.href} className="rl-task__title">
                {t.title}
              </Link>
              <span className="rl-task__body">{t.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="rl-columns">
        <div className="rl-card">
          <div className="rl-card__top">
            <h4>Your to-do list</h4>
            <span className="rl-summary">{waiting ? `${waiting} waiting` : 'All done'}</span>
          </div>
          {waiting === 0 ? (
            <p className="rl-empty">
              <span aria-hidden>🎉</span> No drafts and no reader requests. Start something new above.
            </p>
          ) : (
            <ul className="rl-list">
              {data.drafts.slice(0, 6).map((d) => (
                <li key={d.href}>
                  <span className="rl-dot rl-dot--draft" aria-hidden />
                  <Link href={d.href}>
                    Finish and publish <strong>{d.title}</strong>
                  </Link>
                  <span className="rl-tag">{d.label}</span>
                </li>
              ))}
              {data.requests.map((r) => (
                <li key={r.id}>
                  <span className="rl-dot rl-dot--request" aria-hidden />
                  <Link href={`/admin/collections/review-requests/${r.id}`}>
                    Readers asked for <strong>{r.query}</strong>
                  </Link>
                  <span className="rl-tag">
                    {r.count} {r.count === 1 ? 'request' : 'requests'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rl-card">
          <div className="rl-card__top">
            <h4>Continue where you left off</h4>
          </div>
          {data.recent.length === 0 ? (
            <p className="rl-empty">Nothing edited yet.</p>
          ) : (
            <ul className="rl-list">
              {data.recent.map((d) => (
                <li key={d.href}>
                  <span className={`rl-dot ${d.draft ? 'rl-dot--draft' : 'rl-dot--live'}`} aria-hidden />
                  <Link href={d.href}>
                    <strong>{d.title}</strong>
                  </Link>
                  <span className="rl-tag">
                    {d.label} · {d.draft ? 'Draft' : 'Live'} · {ago(d.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <details className="rl-tour">
        <summary>
          <span className="rl-badge rl-badge--soft">
            <Icon name="sparkle" className="rl-icon rl-icon--sm" />
          </span>
          <span>
            <strong>New here? A two-minute tour</strong>
            <span className="rl-muted" style={{ display: 'block', fontSize: 13 }}>
              How a product goes from an idea to a published page, and where to find things.
            </span>
          </span>
          <Icon name="chevron" className="rl-icon rl-icon--sm rl-tour__chevron" />
        </summary>
        <ol className="rl-grid" style={{ marginTop: 'var(--base)' }}>
          {tourSteps.map((s, i) => (
            <li key={s.title} className="rl-card">
              <div className="rl-card__top">
                <span className="rl-badge">
                  <Icon name={s.icon} className="rl-icon rl-icon--sm" />
                </span>
                <span className="rl-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <ul className="rl-tips">
          <li>
            <strong>Nothing is lost.</strong> Deleted items go to the trash first, and every saved version can be brought
            back from the Versions tab.
          </li>
          <li>
            <strong>See before you publish.</strong> Every product, list, guide and page has a Live preview button that
            shows the page as readers will see it, updating as you type.
          </li>
          <li>
            <strong>Search engines.</strong> Each page has an SEO tab for its Google title, description and share image.
            Leave it empty and sensible defaults are used.
          </li>
          <li>
            <strong>Edit from the website.</strong> While you’re logged in, every page of the site shows an “Edit this page”
            button that opens it here.
          </li>
        </ul>
      </details>
    </section>
  )
}
