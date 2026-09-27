import { ImageResponse } from 'next/og'

import {
  getAspect,
  getBestOf,
  getBrand,
  getCategory,
  getComparison,
  getPage,
  getProduct,
  getTag,
  getTopic,
  isApp,
  productsByBrand,
  productsIn,
  rankBestOf,
  siloOf,
  taggedCount,
  topicRanking,
} from '@/lib/catalog'
import { formatScore } from '@/lib/format'
import { compositeScore, countedReviews } from '@/lib/metrics'
import { SITE } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'
import { verdictLabel } from '@/lib/verdict'

// Share images (1200×630) made for each page from its own data (docs: programmatic-seo), used
// when an editor hasn't picked an image in the page's SEO tab. /og/<kind>/<web address>.

type Card = { eyebrow: string; title: string; detail?: string; badge?: string }

function card(kind: string, slug: string): Card | undefined {
  switch (kind) {
    case 'product': {
      const p = getProduct(slug)
      if (!p) return
      return {
        eyebrow: getCategory(p.category)?.name ?? 'Review',
        title: `${p.name} review`,
        badge: verdictLabel(p.verdict, isApp(p)),
        detail: `${formatScore(compositeScore(p))}/10 · ${countedReviews(p).length.toLocaleString('en-IN')} reviews counted`,
      }
    }
    case 'category': {
      const c = getCategory(slug)
      if (!c) return
      return {
        eyebrow: c.parent ? siloOf(c).name : 'Section',
        title: c.name,
        detail: `${productsIn(c.slug).length} products reviewed · ${c.tagline}`,
      }
    }
    case 'brand': {
      const b = getBrand(slug)
      if (!b) return
      return { eyebrow: 'Brand', title: b.name, detail: `${productsByBrand(b.slug).filter((p) => !p.draft).length} products reviewed` }
    }
    case 'list': {
      const b = getBestOf(slug)
      if (!b) return
      const top = rankBestOf(b).slice(0, 3).map((p, i) => `${i + 1}. ${p.shortName}`)
      return { eyebrow: 'Ranked list', title: b.title, detail: top.join('   ') }
    }
    case 'compare': {
      const c = getComparison(slug)
      if (!c) return
      const [a, b] = c.products.map((s) => getProduct(s))
      if (!a || !b) return
      return {
        eyebrow: 'Head-to-head',
        title: `${a.shortName} vs ${b.shortName}`,
        detail: `${formatScore(compositeScore(a))} vs ${formatScore(compositeScore(b))} out of 10`,
      }
    }
    case 'guide': {
      const t = getTopic(slug)
      if (!t) return
      return {
        eyebrow: `Guide · ${getAspect(t.aspect)?.label ?? ''}`,
        title: t.title,
        detail: `${topicRanking(t.silo, t.aspect).length} products ranked`,
      }
    }
    case 'tag': {
      const t = getTag(slug)
      if (!t) return
      return { eyebrow: 'Tag', title: t.name, detail: `${taggedCount(t.slug)} pages` }
    }
    case 'page': {
      const p = getPage(slug)
      if (!p) return
      return { eyebrow: SITE.name, title: p.title, detail: p.intro }
    }
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  await ensureCatalog()
  const { kind, slug } = await params
  const c = card(kind, slug)
  if (!c) return new Response('Not found', { status: 404 })
  const size = c.title.length > 60 ? 56 : c.title.length > 36 ? 68 : 82
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#440381',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 30 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 34 }}>
            <div style={{ width: 7, height: 20, background: '#51e5ff', borderRadius: 4 }} />
            <div style={{ width: 7, height: 34, background: '#ffffff', borderRadius: 4 }} />
            <div style={{ width: 7, height: 26, background: '#ec368d', borderRadius: 4 }} />
            <div style={{ width: 7, height: 16, background: '#ffa5a5', borderRadius: 4 }} />
          </div>
          <span>{SITE.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontSize: 26, color: '#ffd6c0', textTransform: 'uppercase', letterSpacing: 2 }}>{c.eyebrow}</span>
          <span style={{ fontSize: size, lineHeight: 1.08, fontWeight: 700, maxWidth: 1000 }}>{c.title}</span>
          {c.badge && (
            <div style={{ display: 'flex' }}>
              <span style={{ fontSize: 34, background: '#ec368d', padding: '10px 26px', borderRadius: 999 }}>{c.badge}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 26, color: '#ffd6c0' }}>
          <span style={{ maxWidth: 900 }}>{(c.detail ?? '').slice(0, 110)}</span>
          <div style={{ display: 'flex', height: 8, width: 160, background: 'linear-gradient(90deg,#51e5ff,#ec368d,#ffd6c0)', borderRadius: 4 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Addresses carry a version (?v=), so a changed page gets a new image; cache each for a day.
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
    },
  )
}
