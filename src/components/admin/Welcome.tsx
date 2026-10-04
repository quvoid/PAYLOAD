import Link from 'next/link'
import React from 'react'

import { Icon, type IconName } from '@/components/Icon'
import { getPayloadClient } from '@/lib/store'

// Shown at the top of the admin dashboard: what this admin is for, the numbers that need
// attention, and the work in the order people do it. Styles live in app/(payload)/custom.scss.

const steps: { title: string; body: string; href: string; link: string; icon: IconName }[] = [
  {
    title: 'Add a product',
    body: 'Products → Create new. Give it a name, brand, category and store links. Save it as a draft.',
    href: '/admin/collections/products/create',
    link: 'Add a product',
    icon: 'layers',
  },
  {
    title: 'Collect reviews',
    body: 'The review pipeline reads the store links, collects reviews and fills in every number. Reviews appear under Data → Reviews.',
    href: '/admin/collections/reviews',
    link: 'See reviews',
    icon: 'message',
  },
  {
    title: 'Write and check the words',
    body: 'Write the short answer, the verdict and the pros and cons. The sidebar shows what the scoring rules say. Use Preview to see the page.',
    href: '/admin/collections/products?where[_status][equals]=draft',
    link: 'Drafts waiting',
    icon: 'list',
  },
  {
    title: 'Publish',
    body: 'Publishing approves the page: it goes live straight away with your name on it. Readers’ requests for new products wait under Review requests.',
    href: '/admin/collections/review-requests',
    link: 'Review requests',
    icon: 'user',
  },
]

// Everything about the website itself (not the reviews), for quick access.
const siteLinks: { title: string; body: string; href: string; icon: IconName }[] = [
  { title: 'Pages', body: 'About, Contact, Privacy and any page of your own, in a word-processor editor.', href: '/admin/collections/pages', icon: 'layers' },
  { title: 'Menu & footer', body: 'Choose the links in the top menu and the footer columns.', href: '/admin/globals/navigation', icon: 'menu' },
  { title: 'Search engines', body: 'Default description and share image, Google Search Console, hide the site while it isn’t ready.', href: '/admin/globals/site-settings', icon: 'search' },
  { title: 'Tags', body: 'Group related products, lists, guides and pages. Each tag gets its own page.', href: '/admin/collections/tags', icon: 'flag' },
  { title: 'Images', body: 'Upload, organise in folders and describe every image on the site.', href: '/admin/collections/media', icon: 'sparkle' },
  { title: 'Redirects', body: 'Send old addresses to new ones. Made for you when a web address changes.', href: '/admin/collections/redirects', icon: 'arrow-up-right' },
]

/** Counts for the band; a failed count shows a dash rather than breaking the dashboard. */
async function counts() {
  const payload = await getPayloadClient()
  const count = (args: Parameters<typeof payload.count>[0]) =>
    payload.count({ ...args, overrideAccess: true }).then((r) => r.totalDocs, () => undefined)
  const [published, drafts, requests, reviews] = await Promise.all([
    count({ collection: 'products', where: { _status: { equals: 'published' } } }),
    count({ collection: 'products', where: { _status: { equals: 'draft' } } }),
    count({ collection: 'review-requests', where: { status: { equals: 'new' } } }),
    count({ collection: 'reviews' }),
  ])
  return [
    { label: 'Published products', value: published, href: '/admin/collections/products?where[_status][equals]=published' },
    { label: 'Drafts waiting', value: drafts, href: '/admin/collections/products?where[_status][equals]=draft' },
    { label: 'New reader requests', value: requests, href: '/admin/collections/review-requests?where[status][equals]=new' },
    { label: 'Reviews collected', value: reviews, href: '/admin/collections/reviews' },
  ]
}

export async function Welcome() {
  const stats = await counts()
  return (
    <section className="rl-section">
      <div className="rl-hero">
        <div aria-hidden className="rl-hero__dots" />
        <div className="rl-hero__body">
          <div>
            <p className="rl-eyebrow">ReviewLens admin</p>
            <h2>Every review, weighed.</h2>
            <p>
              Everything on the site is managed here. You write the words and decide what gets published; every
              number, score and verdict is calculated from real reviews.
            </p>
          </div>
          <div className="rl-hero__actions">
            <Link className="rl-pill rl-pill--white" href="/admin/collections/products/create">
              <Icon name="layers" className="rl-icon rl-icon--sm" />
              Add a product
            </Link>
            <a className="rl-pill rl-pill--outline" href="/" target="_blank" rel="noopener">
              View the site
              <Icon name="arrow-up-right" className="rl-icon rl-icon--sm" />
            </a>
          </div>
        </div>
      </div>

      <ul className="rl-grid" aria-label="At a glance" style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
        {stats.map((s) => (
          <li key={s.label} className="rl-card rl-card--link">
            <span className="rl-num" style={{ fontSize: 34, lineHeight: 1 }}>
              {s.value === undefined ? '—' : s.value.toLocaleString('en-IN')}
            </span>
            <Link href={s.href} className="rl-muted" style={{ textDecoration: 'none', fontSize: 13 }}>
              {s.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="rl-section__head">
        <h3>From product to published page</h3>
      </div>
      <ol className="rl-grid">
        {steps.map((s, i) => (
          <li key={s.title} className="rl-card rl-card--link">
            <div className="rl-card__top">
              <span className="rl-badge">
                <Icon name={s.icon} className="rl-icon rl-icon--sm" />
              </span>
              <span className="rl-num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
            <div className="rl-card__foot">
              <Link href={s.href} className="rl-link">
                {s.link}
                <Icon name="arrow-right" className="rl-icon rl-icon--sm" />
              </Link>
            </div>
          </li>
        ))}
      </ol>

      <div className="rl-section__head" style={{ marginTop: 'calc(var(--base) * 1.5)' }}>
        <h3>Manage the website</h3>
      </div>
      <p className="rl-muted" style={{ margin: '-8px 0 var(--base)', maxWidth: '70ch' }}>
        Every product, list, guide and page also has an <strong>SEO</strong> tab (search title, description, share
        image) and a <strong>Live preview</strong> button. Deleted items go to the trash first and can be restored, and
        every saved version can be brought back from the Versions tab.
      </p>
      <ul className="rl-grid">
        {siteLinks.map((l) => (
          <li key={l.title} className="rl-card rl-card--link">
            <span className="rl-badge rl-badge--soft">
              <Icon name={l.icon} className="rl-icon rl-icon--sm" />
            </span>
            <h4>
              <Link href={l.href} className="rl-link" style={{ textDecoration: 'none' }}>
                {l.title}
                <Icon name="arrow-right" className="rl-icon rl-icon--sm" />
              </Link>
            </h4>
            <p>{l.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
