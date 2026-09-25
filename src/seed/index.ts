/**
 * Copy the catalogue into Payload: the sample catalogue (src/data), the real products collected
 * by the pipeline (src/data/real/*.json) and their reviews. Safe to re-run: documents are matched
 * by web address and updated; reviews are replaced.
 *
 *   pnpm seed
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'

import { bestOf, comparisons, topics } from '@/data/editorial'
import { products } from '@/data/products'
import { aspects, authors, brands, categories, sources } from '@/data/taxonomy'
import { RULES } from '@/lib/rules'

const context = { skipRefresh: true } // one refresh at the end, not one per document
const joinParagraphs = (list: string[]) => list.join('\n\n')

async function upsert(payload: Payload, collection: any, slug: string, data: Record<string, any>, draft = false) {
  const existing = await payload.find({ collection, where: { slug: { equals: slug } }, depth: 0, limit: 1, draft: true })
  const doc = existing.docs[0] as any
  const args = { collection, data: { ...data, slug }, depth: 0, context, draft, overrideAccess: true }
  return (doc ? await payload.update({ ...args, id: doc.id }) : await payload.create(args)) as any
}

/** Store links for the real products, from pipeline/config.py (the file the pipeline reads). */
function pipelineLinks(slug: string) {
  const file = path.join(process.cwd(), 'pipeline', 'config.py')
  if (!fs.existsSync(file)) return {}
  const text = fs.readFileSync(file, 'utf8')
  const start = text.indexOf(`"slug": "${slug}"`)
  if (start < 0) return {}
  const next = text.indexOf('"slug":', start + 10)
  const block = text.slice(start, next < 0 ? undefined : next)
  const one = (key: string) => block.match(new RegExp(`"${key}": "([^"]+)"`))?.[1]
  const reddit = block.match(/"reddit": \[([^\]]*)\]/)?.[1]
  return {
    playStoreId: one('play'),
    appStoreId: one('appstore'),
    redditPhrases: reddit ? [...reddit.matchAll(/"([^"]+)"/g)].map((m) => m[1]).join(', ') : undefined,
  }
}

async function seed() {
  const payload = await getPayload({ config })
  const log = (msg: string) => console.log(`seed: ${msg}`)

  // --- the account owner becomes the named editor ---------------------------------------------
  const owner = (await payload.find({ collection: 'users', sort: 'createdAt', limit: 1, depth: 0 })).docs[0]
  if (!owner) throw new Error('Create your admin account at /admin first, then run the seed.')
  const editor = authors[0]
  await payload.update({
    collection: 'users',
    id: owner.id,
    data: {
      name: owner.name || editor.name,
      slug: owner.slug || editor.slug,
      role: 'admin',
      jobTitle: owner.jobTitle || editor.role,
      bio: owner.bio || joinParagraphs(editor.bio),
    },
    context,
    overrideAccess: true,
  })
  log(`editor: ${owner.email} as ${owner.name || editor.name} (admin)`)

  // --- scoring vocabulary ----------------------------------------------------------------------
  const sourceId = new Map<string, number>()
  for (const s of sources) {
    const doc = await upsert(payload, 'sources', s.id, {
      name: s.name,
      kind: s.kind,
      weight: s.weight,
      hasRatings: s.hasRatings,
      collection: s.collection,
    })
    sourceId.set(s.id, doc.id)
  }
  const aspectId = new Map<string, number>()
  for (const a of aspects) {
    const doc = await upsert(payload, 'aspects', a.slug, { label: a.label, question: a.question })
    aspectId.set(a.slug, doc.id)
  }
  log(`${sources.length} sources, ${aspects.length} measures`)

  // --- catalogue ------------------------------------------------------------------------------
  const categoryId = new Map<string, number>()
  for (const c of [...categories].sort((a, b) => Number(Boolean(a.parent)) - Number(Boolean(b.parent)))) {
    const doc = await upsert(payload, 'categories', c.slug, {
      name: c.name,
      parent: c.parent ? categoryId.get(c.parent) : null,
      tagline: c.tagline,
      intro: joinParagraphs(c.intro),
      measures: c.aspects.map((m) => ({ aspect: aspectId.get(m.aspect), weight: m.weight, dealBreaker: Boolean(m.dealBreaker) })),
      valueMetric: c.valueMetric ?? { label: null, basis: null },
      isApp: Boolean(c.appCategory),
      appCategory: c.appCategory ?? null,
      refreshDays: c.refreshDays,
      faq: c.faq,
    })
    categoryId.set(c.slug, doc.id)
  }
  const brandId = new Map<string, number>()
  for (const b of brands) {
    const doc = await upsert(payload, 'brands', b.slug, {
      name: b.name,
      about: joinParagraphs(b.about),
      website: b.website ?? null,
      sameAs: b.sameAs.map((url) => ({ url })),
    })
    brandId.set(b.slug, doc.id)
  }
  log(`${categories.length} categories, ${brands.length} brands`)

  // --- products: samples are published; real products stay drafts until an editor approves -----
  const productId = new Map<string, number>()
  for (const p of products) {
    const real = !p.sample
    const flipkart = p.offers.find((o) => o.source === 'flipkart')?.url
    const doc = await upsert(
      payload,
      'products',
      p.slug,
      {
        _status: real ? 'draft' : 'published',
        name: p.name,
        shortName: p.shortName,
        brand: brandId.get(p.brand),
        category: categoryId.get(p.category),
        variant: p.variant,
        sample: !real,
        answer: p.answer,
        verdictBody: joinParagraphs(p.verdictBody),
        claims: p.claims.map((c) => ({ sentiment: c.sentiment, aspect: aspectId.get(c.aspect), text: c.text })),
        faq: p.faq,
        offers: p.offers.map((o) => ({
          source: sourceId.get(o.source),
          price: o.price,
          mrp: o.mrp,
          inStock: o.inStock,
          url: o.url ?? null,
          checkedAt: o.checkedAt,
        })),
        valueQuantity: p.valueQuantity,
        specs: p.specs,
        platformStats: p.platformStats.map((s) => ({ source: sourceId.get(s.source), rating: s.rating, total: s.total })),
        dataUpdatedAt: p.updatedAt,
        ...(real ? { flipkartUrl: flipkart ?? null, ...pipelineLinks(p.slug) } : { author: owner.id, approvedAt: p.publishedAt }),
      },
      real,
    )
    productId.set(p.slug, doc.id)
  }
  log(`${products.length} products (${products.filter((p) => !p.sample).length} real drafts)`)

  // --- reviews: straight into the table in bulk (no per-review hooks) --------------------------
  const table = (payload.db as any).tables.reviews
  await (payload.db as any).drizzle.delete(table)
  const rows = products.flatMap((p) =>
    p.reviews.map((r) => ({
      product: productId.get(p.slug)!,
      // Unique per product: the same short review can appear on two products' pages.
      externalId: `${p.slug}:${r.id}`,
      source: r.source,
      rating: r.rating ?? null,
      author: r.author,
      date: r.date,
      body: r.body,
      original: r.original ?? null,
      aspects: r.aspects,
      verified: r.verified,
      credibility: r.credibility,
      sentiment: r.sentiment ?? null,
      url: r.url ?? null,
      hidden: false,
    })),
  )
  for (let i = 0; i < rows.length; i += 500) {
    await (payload.db as any).drizzle.insert(table).values(rows.slice(i, i + 500))
  }
  log(`${rows.length} reviews`)

  // --- editorial pages ---------------------------------------------------------------------------
  for (const b of bestOf) {
    await upsert(payload, 'best-lists', b.slug, {
      _status: 'published',
      title: b.title,
      category: categoryId.get(b.category),
      qualifier: b.qualifier,
      intro: joinParagraphs(b.intro),
      rankBy: b.rule.aspect ? 'fewest-problems' : 'satisfaction',
      aspect: b.rule.aspect ? aspectId.get(b.rule.aspect) : null,
      maxPrice: b.rule.maxPrice ?? null,
      faq: b.faq,
    })
  }
  for (const c of comparisons) {
    await upsert(payload, 'comparisons', c.slug, {
      _status: 'published',
      products: c.products.map((s) => productId.get(s)),
      judgement: joinParagraphs(c.judgement),
      pickIf: Object.entries(c.pickIf).map(([slug, text]) => ({ product: productId.get(slug), text })),
    })
  }
  for (const t of topics) {
    await upsert(payload, 'guides', t.slug, {
      _status: 'published',
      title: t.title,
      aspect: aspectId.get(t.aspect),
      section: categoryId.get(t.silo),
      explainer: joinParagraphs(t.explainer),
      faq: t.faq,
    })
  }
  log(`${bestOf.length} ranked lists, ${comparisons.length} head-to-heads, ${topics.length} guides`)

  // --- settings ----------------------------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'site-settings',
    context,
    data: {
      showBanner: true,
      bannerText:
        'Development build — products marked Sample are fictional. Real products stay hidden until an editor publishes them.',
      heroEyebrow: 'Reviews from everywhere · one honest answer',
      heroTitle: 'Should you buy it? Every review, weighed.',
      heroText:
        'We read every review of a product across Amazon, Flipkart, Reddit and the app stores, set aside the ones that look fake, count what people actually say — and give you a straight answer.',
      steps: [
        { title: 'Collect everything', body: 'Amazon, Flipkart, Google Play, the App Store and Reddit — every review we can find for one exact product.' },
        { title: 'Discount the fakes', body: 'Bursts of generic 5★ reviews and other manipulation signals are flagged and excluded from our counts. We show both averages.' },
        { title: 'Count, don’t guess', body: 'Every percentage is counted from reviews by code. No number on this site is written by an AI.' },
        { title: 'A person signs it off', body: 'Rules produce the verdict; a named editor reads it and approves it before anyone else sees it.' },
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'scoring-rules',
    context,
    data: {
      buyScore: RULES.verdict.buy,
      caveatsScore: RULES.verdict.caveats,
      dealBreakerProblemRate: RULES.dealBreakerProblemRate,
      notableConProblemRate: RULES.notableConProblemRate,
      minReviewsHigh: RULES.confidence.high,
      minReviewsMedium: RULES.confidence.medium,
      minMentionsPerAspect: RULES.minMentionsPerAspect,
      minEvidencePerClaim: RULES.minEvidencePerClaim,
      suspiciousBelow: RULES.suspiciousBelow,
    },
  })

  // Tell the running site to reload.
  const state = await payload.findGlobal({ slug: 'catalog-state' })
  await payload.updateGlobal({ slug: 'catalog-state', data: { version: (state.version ?? 0) + 1 }, context })
  log('done')
  process.exit(0)
}

// `payload run` exits when the module finishes evaluating, so the work must be awaited here.
try {
  await seed()
} catch (error) {
  console.error(error)
  process.exit(1)
}
