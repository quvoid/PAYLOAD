import React from 'react'

// Shown at the top of the admin dashboard: what this admin is for, in the order people use it.

const steps = [
  {
    title: 'Add a product',
    body: 'Products → Create new. Give it a name, brand, category and store links. Save it as a draft.',
    href: '/admin/collections/products/create',
    link: 'Add a product',
  },
  {
    title: 'Collect reviews',
    body: 'The review pipeline reads the store links, collects reviews and fills in every number. Reviews appear under Data → Reviews.',
    href: '/admin/collections/reviews',
    link: 'See reviews',
  },
  {
    title: 'Write and check the words',
    body: 'Write the short answer, the verdict and the pros and cons. The sidebar shows what the scoring rules say. Use Preview to see the page.',
    href: '/admin/collections/products?where[_status][equals]=draft',
    link: 'Drafts waiting',
  },
  {
    title: 'Publish',
    body: 'Publishing approves the page: it goes live straight away with your name on it. Readers’ requests for new products wait under Review requests.',
    href: '/admin/collections/review-requests',
    link: 'Review requests',
  },
]

// Everything about the website itself (not the reviews), for quick access.
const siteLinks = [
  { title: 'Pages', body: 'About, Contact, Privacy and any page of your own, in a word-processor editor.', href: '/admin/collections/pages' },
  { title: 'Menu & footer', body: 'Choose the links in the top menu and the footer columns.', href: '/admin/globals/navigation' },
  { title: 'Search engines', body: 'Default description and share image, Google Search Console, hide the site while it isn’t ready.', href: '/admin/globals/site-settings' },
  { title: 'Tags', body: 'Group related products, lists, guides and pages. Each tag gets its own page.', href: '/admin/collections/tags' },
  { title: 'Images', body: 'Upload, organise in folders and describe every image on the site.', href: '/admin/collections/media' },
  { title: 'Redirects', body: 'Send old addresses to new ones. Made for you when a web address changes.', href: '/admin/collections/redirects' },
]

const card = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m)',
  padding: 'var(--base)',
  background: 'var(--theme-elevation-50)',
} as const

export function Welcome() {
  return (
    <section style={{ marginBottom: 'calc(var(--base) * 2)' }}>
      <h2 style={{ marginBottom: 'calc(var(--base) * 0.5)' }}>ReviewLens admin</h2>
      <p style={{ marginBottom: 'var(--base)', color: 'var(--theme-elevation-600)', maxWidth: '70ch' }}>
        Everything on the site is managed here. You write the words and decide what gets published; every number,
        score and verdict is calculated from real reviews.
      </p>
      <ol
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
          gap: 'var(--base)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {steps.map((s, i) => (
          <li key={s.title} style={card}>
            <p style={{ color: '#ec368d', fontWeight: 600, margin: 0 }}>{String(i + 1).padStart(2, '0')}</p>
            <h3 style={{ margin: 'calc(var(--base) * 0.4) 0' }}>{s.title}</h3>
            <p style={{ margin: 0, color: 'var(--theme-elevation-700)' }}>{s.body}</p>
            <a href={s.href} style={{ display: 'inline-block', marginTop: 'calc(var(--base) * 0.6)' }}>
              {s.link} →
            </a>
          </li>
        ))}
      </ol>
      <h3 style={{ margin: 'calc(var(--base) * 1.5) 0 calc(var(--base) * 0.5)' }}>Manage the website</h3>
      <p style={{ margin: '0 0 var(--base)', color: 'var(--theme-elevation-600)', maxWidth: '70ch' }}>
        Every product, list, guide and page also has an <strong>SEO</strong> tab (search title, description, share image)
        and a <strong>Live preview</strong> button. Deleted items go to the trash first and can be restored, and every
        saved version can be brought back from the Versions tab.
      </p>
      <ul
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
          gap: 'var(--base)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {siteLinks.map((l) => (
          <li key={l.title} style={card}>
            <a href={l.href} style={{ fontWeight: 600 }}>
              {l.title} →
            </a>
            <p style={{ margin: 'calc(var(--base) * 0.4) 0 0', color: 'var(--theme-elevation-700)' }}>{l.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
