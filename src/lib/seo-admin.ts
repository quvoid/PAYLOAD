import type { Field, PayloadRequest } from 'payload'

import { urlField } from '@/collections/shared'

// Admin side of the SEO tab: what the "Generate" buttons fill in, and the fields added after the
// plugin's own (title, description, image, preview). The site reads them in store.ts / seo.ts.

type Doc = Record<string, unknown>

const SITE_NAME = 'ReviewLens'
const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const firstParagraph = (text: unknown) => String(text ?? '').split(/\n\s*\n/)[0].trim()
const clip = (text: string, max = 155) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)
const idOf = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | undefined))

/** The two product names of a head-to-head, from its relationship ids. */
const pairNames = async (doc: Doc, req: PayloadRequest) => {
  const ids = ((doc.products as unknown[]) ?? []).map(idOf).filter(Boolean) as number[]
  const docs = await Promise.all(
    ids.map((id) => req.payload.findByID({ collection: 'products', id, depth: 0, draft: true, req, disableErrors: true })),
  )
  return docs.flatMap((d) => (d ? [d.shortName || d.name] : []))
}

const pathFor = async (slug: string | undefined, doc: Doc, req: PayloadRequest) => {
  switch (slug) {
    case 'products':
      return `/reviews/${doc.slug}`
    case 'brands':
      return `/brands/${doc.slug}`
    case 'best-lists':
      return `/best/${doc.slug}`
    case 'comparisons':
      return `/compare/${doc.slug}`
    case 'guides':
      return `/topics/${doc.slug}`
    case 'tags':
      return `/tags/${doc.slug}`
    case 'categories': {
      const parent = idOf(doc.parent)
      if (!parent) return `/${doc.slug}`
      const section = await req.payload.findByID({ collection: 'categories', id: parent, depth: 0, req, disableErrors: true })
      return `/${section?.slug}/${doc.slug}`
    }
    default:
      return `/${doc.slug ?? ''}`
  }
}

type GenArgs = { doc: Doc; collectionConfig?: { slug: string }; req: PayloadRequest }

/** The page type's template from Site settings → Programmatic SEO, if one is set. */
const fromTemplate = async (collection: string | undefined, doc: Doc) => {
  if (!collection) return {}
  const [{ ensureCatalog }, { templatedForDoc }] = await Promise.all([import('./store'), import('./seo-templates')])
  await ensureCatalog()
  return templatedForDoc(collection, doc)
}

export const seoGenerators = {
  generateTitle: async ({ doc, collectionConfig, req }: GenArgs) => {
    const slug = collectionConfig?.slug
    const t = await fromTemplate(slug, doc)
    if (t.title) return t.title
    if (slug === 'products') return `${doc.name} Review | ${SITE_NAME}`
    if (slug === 'categories') return `${doc.name} Reviews and Buying Guide | ${SITE_NAME}`
    if (slug === 'brands') return `${doc.name} Products Reviewed | ${SITE_NAME}`
    if (slug === 'comparisons') return `${(await pairNames(doc, req)).join(' vs ')}: Which to Buy? | ${SITE_NAME}`
    if (slug === 'tags') return `${doc.name} | ${SITE_NAME}`
    return `${doc.title ?? doc.name ?? ''} | ${SITE_NAME}`
  },
  generateDescription: async ({ doc, collectionConfig }: GenArgs) => {
    const t = await fromTemplate(collectionConfig?.slug, doc)
    if (t.description) return clip(t.description)
    const text: Record<string, unknown> = {
      products: doc.answer,
      categories: doc.tagline,
      brands: firstParagraph(doc.about),
      'best-lists': firstParagraph(doc.intro) || doc.qualifier,
      comparisons: firstParagraph(doc.judgement),
      guides: firstParagraph(doc.explainer),
      pages: doc.intro,
      tags: doc.description,
    }
    return clip(String(text[collectionConfig?.slug ?? ''] ?? ''))
  },
  generateURL: async ({ doc, collectionConfig, req }: GenArgs) =>
    `${siteUrl()}${await pathFor(collectionConfig?.slug, doc, req)}`,
}

export const seoExtraFields: Field[] = [
  {
    name: 'noindex',
    label: 'Hide this page from search engines',
    type: 'checkbox',
    admin: { description: 'The page stays on the site, but Google and others are asked not to list it.' },
  },
  urlField({
    name: 'canonical',
    label: 'Main address (advanced)',
    admin: {
      placeholder: 'https://…',
      description: 'Only if this page copies another one: the address of the original. Leave empty otherwise.',
    },
  }),
]
