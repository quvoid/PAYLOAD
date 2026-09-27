import type { CollectionConfig, Endpoint, PayloadRequest } from 'payload'

import { validateRootSlug } from './Pages'
import {
  faqField,
  isAdmin,
  loggedIn,
  goneOnDelete,
  redirectOnSlugChange,
  refreshAfterChange,
  refreshAfterDelete,
  sameAsField,
  slugField,
} from './shared'

/** /section or /section/category, for a category document read at depth 0. */
const categoryPath = async (doc: Record<string, unknown>, req: PayloadRequest) => {
  const parent = doc.parent && typeof doc.parent === 'object' ? (doc.parent as { id: number }).id : doc.parent
  if (!parent) return `/${doc.slug}`
  const section = await req.payload.findByID({ collection: 'categories', id: parent as number, depth: 0, req })
  return `/${section.slug}/${doc.slug}`
}

/**
 * POST /api/categories/:id/draft-comparisons { top } — drafts a head-to-head for every pair among
 * the category's best-scoring published products (never "Not enough data" ones). Existing pairs
 * are skipped; nothing is published.
 */
const draftComparisons: Endpoint = {
  path: '/:id/draft-comparisons',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ message: 'Log in first.' }, { status: 401 })
    const id = Number(req.routeParams?.id)
    const top = Math.min(5, Math.max(2, Number((await req.json?.())?.top) || 3))
    const category = await req.payload.findByID({ collection: 'categories', id, depth: 0, req })
    if (!category.parent) {
      return Response.json({ created: [], skipped: 0, message: 'Open a category (not a section): head-to-heads compare products in one category.' })
    }
    const [{ ensureCatalog }, { productsIn }] = await Promise.all([import('@/lib/store'), import('@/lib/catalog')])
    await ensureCatalog()
    const best = productsIn(category.slug).filter((p) => p.verdict !== 'thin-data').slice(0, top)
    if (best.length < 2) return Response.json({ created: [], skipped: 0, message: 'Needs at least two published products with enough reviews.' })
    const ids = new Map(
      (
        await req.payload.find({
          collection: 'products',
          where: { slug: { in: best.map((p) => p.slug) } },
          depth: 0,
          pagination: false,
          req,
        })
      ).docs.map((d) => [d.slug, d.id]),
    )
    const created: { id: number; slug: string }[] = []
    let skipped = 0
    for (let i = 0; i < best.length; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const slug = [best[i].slug, best[j].slug].sort().join('-vs-')
        const exists = await req.payload.count({ collection: 'comparisons', where: { slug: { equals: slug } }, req, trash: true })
        if (exists.totalDocs) {
          skipped++
          continue
        }
        const doc = await req.payload.create({
          collection: 'comparisons',
          draft: true,
          data: { _status: 'draft', products: [ids.get(best[i].slug)!, ids.get(best[j].slug)!], judgement: '' },
          req,
        })
        created.push({ id: doc.id, slug: doc.slug ?? slug })
      }
    }
    return Response.json({ created, skipped })
  },
}

// Sections (top level, e.g. "Apps") and the categories inside them (e.g. "UPI & Payment Apps").
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'slug'],
    description:
      'Sections (like "Apps") and the categories inside them (like "UPI & Payment Apps"). Every product belongs to one category.',
  },
  endpoints: [draftComparisons],
  versions: { maxPerDoc: 25 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    afterChange: [
      refreshAfterChange,
      (args) => redirectOnSlugChange('categories', (d) => categoryPath(d, args.req))(args),
    ],
    afterDelete: [refreshAfterDelete, (args) => goneOnDelete((d) => categoryPath(d, args.req))(args)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'parent',
              label: 'Section',
              type: 'relationship',
              relationTo: 'categories',
              filterOptions: { parent: { exists: false } },
              admin: {
                description:
                  'Leave empty to make this a top-level section (shown in the menu). Pick a section to make this a category inside it.',
              },
            },
            {
              name: 'tagline',
              type: 'textarea',
              required: true,
              admin: { description: 'One sentence under the title, e.g. "Every whey protein we track, scored on the same measures."' },
            },
            {
              name: 'intro',
              label: 'Buying guide',
              type: 'textarea',
              admin: {
                description:
                  'Two or three short paragraphs on what matters when buying in this category. Leave a blank line between paragraphs.',
              },
            },
            sameAsField('Optional. The Wikipedia or Wikidata page for this kind of product, e.g. Whey protein.'),
          ],
        },
        {
          label: 'What we measure',
          description:
            'The measures (like taste, battery life or payment success) every product in this category is judged on. Only needed for categories, not sections.',
          fields: [
            {
              name: 'measures',
              label: 'Measures',
              type: 'array',
              labels: { singular: 'Measure', plural: 'Measures' },
              fields: [
                { name: 'aspect', label: 'Measure', type: 'relationship', relationTo: 'aspects', required: true },
                {
                  name: 'dealBreaker',
                  label: 'Deal-breaker',
                  type: 'checkbox',
                  admin: {
                    description:
                      'If too many reviewers report a problem with this, the product is marked Skip however good the rest is.',
                  },
                },
                {
                  name: 'weight',
                  type: 'number',
                  defaultValue: 1,
                  admin: { description: 'Leave at 1 unless you have a reason. Kept for future scoring.' },
                },
              ],
            },
            {
              name: 'valueMetric',
              label: 'Price per unit',
              type: 'group',
              admin: {
                description:
                  'Optional. Lets product cards show a comparable price, e.g. "per 100 g protein". Each product then needs its unit count.',
              },
              fields: [
                { name: 'label', type: 'text', admin: { placeholder: 'per 100 g protein' } },
                { name: 'basis', type: 'number', admin: { placeholder: '100' } },
              ],
            },
            {
              name: 'isApp',
              label: 'This is an app category',
              type: 'checkbox',
              admin: { description: 'Apps are free, so pages say "Use it" instead of "Buy" and show store ratings.' },
            },
            {
              name: 'appCategory',
              label: 'App type (for search engines)',
              type: 'select',
              options: [
                { label: 'Finance', value: 'FinanceApplication' },
                { label: 'Shopping', value: 'ShoppingApplication' },
                { label: 'Lifestyle', value: 'LifestyleApplication' },
                { label: 'Travel', value: 'TravelApplication' },
                { label: 'Health', value: 'HealthApplication' },
                { label: 'Entertainment', value: 'EntertainmentApplication' },
                { label: 'Utilities', value: 'UtilitiesApplication' },
              ],
              admin: { condition: (data) => Boolean(data?.isApp) },
            },
          ],
        },
        { label: 'Questions', fields: [faqField] },
      ],
    },
    slugField('name', {
      validate: validateRootSlug('categories'),
      admin: {
        position: 'sidebar',
        description: 'Sections live at /<this>, categories at /<section>/<this>. Changing it later redirects the old address.',
      },
    }),
    {
      name: 'draftComparisons',
      type: 'ui',
      admin: {
        position: 'sidebar',
        condition: (data) => Boolean(data?.parent),
        components: { Field: '/components/admin/DraftComparisons#DraftComparisons' },
      },
    },
    {
      name: 'refreshDays',
      label: 'Refresh every (days)',
      type: 'number',
      defaultValue: 21,
      admin: { position: 'sidebar', description: 'How often reviews for products in this category are re-collected.' },
    },
    {
      name: 'products',
      type: 'join',
      collection: 'products',
      on: 'category',
      admin: { description: 'Products in this category.' },
    },
  ],
}
