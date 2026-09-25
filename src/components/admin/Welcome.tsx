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
          <li
            key={s.title}
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 'var(--style-radius-m)',
              padding: 'var(--base)',
              background: 'var(--theme-elevation-50)',
            }}
          >
            <p style={{ color: '#ec368d', fontWeight: 600, margin: 0 }}>{String(i + 1).padStart(2, '0')}</p>
            <h3 style={{ margin: 'calc(var(--base) * 0.4) 0' }}>{s.title}</h3>
            <p style={{ margin: 0, color: 'var(--theme-elevation-700)' }}>{s.body}</p>
            <a href={s.href} style={{ display: 'inline-block', marginTop: 'calc(var(--base) * 0.6)' }}>
              {s.link} →
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
