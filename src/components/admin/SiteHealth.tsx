import React from 'react'

import { clickDepth, MAX_DEPTH } from '@/lib/site-health'
import { ensureCatalog, getPayloadClient } from '@/lib/store'
import {
  nearestTo,
  publishedDocs,
  UNIQUE_COLLECTIONS,
  UNIQUENESS_THRESHOLD,
} from '@/lib/uniqueness'

// Dashboard: SEO problems an editor can fix from the admin — pages too deep or unlinked
// (docs: site-architecture) and near-duplicate wording (docs: programmatic-seo).

const card: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m)',
  padding: 'var(--base)',
  background: 'var(--theme-elevation-50)',
}
const muted: React.CSSProperties = { color: 'var(--theme-elevation-600)', margin: 0, fontSize: 13 }
const good = '#2a7a3b'
const bad = '#b3261e'

const labels: Record<string, string> = {
  products: 'Product',
  'best-lists': 'Ranked list',
  comparisons: 'Head-to-head',
  guides: 'Guide',
  pages: 'Page',
}

export async function SiteHealth() {
  await ensureCatalog()
  const payload = await getPayloadClient()
  const depth = clickDepth()
  const site = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const threshold = site.uniquenessThreshold ?? UNIQUENESS_THRESHOLD

  const duplicates: { collection: string; id: number | string; title: string; nearest: string; pct: number }[] = []
  for (const collection of UNIQUE_COLLECTIONS) {
    const docs = await publishedDocs(payload, collection)
    for (const d of docs) {
      const r = nearestTo(collection, d, docs)
      if (!r.tooShort && r.nearest && r.distance < threshold) {
        duplicates.push({
          collection,
          id: d.id as number,
          title: String(d.title ?? d.name ?? d.slug),
          nearest: r.nearest.title,
          pct: Math.round(r.distance * 100),
        })
      }
    }
  }

  const maxDepth = Math.max(0, ...depth.pages.map((p) => (p.depth === Infinity ? 0 : p.depth)))
  const checks = [
    {
      title: 'Click depth',
      ok: depth.deep.length === 0,
      summary:
        depth.deep.length === 0
          ? `All ${depth.pages.length} indexable pages are within ${MAX_DEPTH} clicks of the homepage (deepest: ${maxDepth}).`
          : `${depth.deep.length} pages are more than ${MAX_DEPTH} clicks from the homepage. Link to them from a menu, a tag or a Related list.`,
      items: depth.deep.slice(0, 8).map((p) => ({ href: p.path, label: `${p.path} (${p.depth} clicks)` })),
    },
    {
      title: 'Unlinked pages',
      ok: depth.orphans.length === 0,
      summary:
        depth.orphans.length === 0
          ? 'Every indexable page is linked from somewhere on the site.'
          : `${depth.orphans.length} pages have no link pointing to them. Add them to Navigation, a tag, or another page’s Related list.`,
      items: depth.orphans.slice(0, 8).map((p) => ({ href: p, label: p })),
    },
    {
      title: 'Near-duplicate wording',
      ok: duplicates.length === 0,
      summary:
        duplicates.length === 0
          ? `Every published page has at least ${Math.round(threshold * 100)}% of its own wording.`
          : `${duplicates.length} published pages share too much wording with another page of the same type.`,
      items: duplicates.slice(0, 8).map((d) => ({
        href: `/admin/collections/${d.collection}/${d.id}`,
        label: `${labels[d.collection]}: ${d.title} — ${d.pct}% own, closest “${d.nearest}”`,
      })),
    },
  ]

  return (
    <section style={{ marginBottom: 'calc(var(--base) * 2)' }}>
      <h3 style={{ margin: '0 0 calc(var(--base) * 0.5)' }}>Site health</h3>
      <p style={{ ...muted, marginBottom: 'var(--base)', maxWidth: '70ch', fontSize: 14 }}>
        Checked live against the published site. For a full crawl (status codes, titles, structured data), run{' '}
        <code>pnpm seo:audit</code>.
      </p>
      <ul
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
          gap: 'var(--base)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {checks.map((c) => (
          <li key={c.title} style={card}>
            <strong style={{ color: c.ok ? good : bad }}>
              {c.ok ? '✓' : '!'} {c.title}
            </strong>
            <p style={{ ...muted, marginTop: 6 }}>{c.summary}</p>
            {c.items.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13 }}>
                {c.items.map((i) => (
                  <li key={i.href}>
                    <a href={i.href}>{i.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
