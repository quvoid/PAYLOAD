import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { pingIndexNow } from '@/lib/indexnow'

import {
  faqField,
  isAdmin,
  loggedIn,
  previewPath,
  goneOnDelete,
  redirectOnSlugChange,
  refreshAfterChange,
  refreshAfterDelete,
  relatedField,
  uniquenessField,
  uniquenessGuard,
  slugField,
  tagsField,
} from './shared'

// Ranked lists, head-to-head comparisons and guides: pages an editor curates, ranked and filled in
// by numbers computed from reviews.

export const BestLists: CollectionConfig = {
  slug: 'best-lists',
  labels: { singular: 'Ranked list', plural: 'Ranked lists' },
  admin: {
    group: 'Lists & guides',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status'],
    description:
      'Pages like "Best whey protein under ₹2,500". You choose the rule; the ranking updates itself as reviews and prices change. Products marked Skip are never ranked.',
    preview: (doc) => previewPath(`/best/${doc.slug}`),
    livePreview: { url: ({ data }) => previewPath(`/best/${data?.slug ?? ''}`) },
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    beforeChange: [uniquenessGuard('best-lists')],
    afterChange: [
      refreshAfterChange,
      redirectOnSlugChange('best-lists', (d) => `/best/${d.slug}`),
      pingIndexNow((d) => `/best/${d.slug}`),
    ],
    afterDelete: [refreshAfterDelete, goneOnDelete((d) => `/best/${d.slug}`)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'List',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { placeholder: 'Best whey protein under ₹2,500' },
            },
            {
              name: 'category',
              label: 'Category or section',
              type: 'relationship',
              relationTo: 'categories',
              required: true,
              admin: {
                description: 'Pick a section to rank products from all its categories together.',
              },
            },
            {
              name: 'qualifier',
              type: 'text',
              required: true,
              admin: {
                description:
                  'What makes this list different from the category page, e.g. "under ₹2,500" or "without bloating". Lists without one compete with their own category in search.',
              },
            },
            {
              name: 'intro',
              type: 'textarea',
              admin: { description: 'Why these products, and how they are ranked.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'rankBy',
                  label: 'Rank by',
                  type: 'select',
                  required: true,
                  defaultValue: 'satisfaction',
                  options: [
                    { label: 'Overall satisfaction', value: 'satisfaction' },
                    { label: 'Fewest problems with one measure', value: 'fewest-problems' },
                  ],
                },
                {
                  name: 'aspect',
                  label: 'Measure',
                  type: 'relationship',
                  relationTo: 'aspects',
                  admin: {
                    condition: (_, siblingData) => siblingData?.rankBy === 'fewest-problems',
                  },
                },
                {
                  name: 'maxPrice',
                  label: 'Maximum price (₹)',
                  type: 'number',
                  admin: { description: 'Optional.' },
                },
              ],
            },
          ],
        },
        { label: 'Questions', fields: [faqField] },
      ],
    },
    slugField('title', {
      admin: { position: 'sidebar', description: 'The page lives at /best/<this>.' },
    }),
    tagsField,
    relatedField,
    uniquenessField,
  ],
}

/** A head-to-head's address and category come from its two products. */
const pairDetails: CollectionBeforeValidateHook = async ({ data, req }) => {
  const ids = (data?.products ?? []).map((p: number | { id: number }) =>
    typeof p === 'object' ? p.id : p,
  )
  if (ids.length !== 2) return data
  const docs = await Promise.all(
    ids.map((id: number) =>
      req.payload.findByID({ collection: 'products', id, depth: 0, draft: true, req }),
    ),
  )
  const slugs = docs.map((d) => d.slug as string).sort()
  return { ...data, slug: data?.slug || `${slugs[0]}-vs-${slugs[1]}`, category: docs[0].category }
}

export const Comparisons: CollectionConfig = {
  slug: 'comparisons',
  labels: { singular: 'Head-to-head', plural: 'Head-to-heads' },
  admin: {
    group: 'Lists & guides',
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'category', '_status'],
    description:
      'Two products side by side. Pick two from the same category; the table fills itself in. Whole-category tables are made automatically.',
    preview: (doc) => previewPath(`/compare/${doc.slug}`),
    livePreview: { url: ({ data }) => previewPath(`/compare/${data?.slug ?? ''}`) },
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    beforeValidate: [pairDetails],
    beforeChange: [uniquenessGuard('comparisons')],
    afterChange: [refreshAfterChange, pingIndexNow((d) => `/compare/${d.slug}`)],
    afterDelete: [refreshAfterDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Comparison',
          fields: [
            {
              name: 'products',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              required: true,
              minRows: 2,
              maxRows: 2,
              admin: { description: 'Exactly two products from the same category.' },
            },
            {
              name: 'judgement',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'Which suits whom, in a paragraph or two. Leave a blank line between paragraphs.',
              },
            },
            {
              name: 'pickIf',
              label: 'Pick this one if…',
              type: 'array',
              maxRows: 2,
              fields: [
                { name: 'product', type: 'relationship', relationTo: 'products', required: true },
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  admin: { placeholder: 'Pick PayNest if you want the simplest app…' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { position: 'sidebar', readOnly: true, description: 'Taken from the products.' },
    },
    {
      name: 'slug',
      label: 'Web address',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Made from the two products: /compare/<this>.',
      },
    },
    uniquenessField,
  ],
}

export const Guides: CollectionConfig = {
  slug: 'guides',
  labels: { singular: 'Guide', plural: 'Guides' },
  admin: {
    group: 'Lists & guides',
    useAsTitle: 'title',
    defaultColumns: ['title', 'aspect', '_status'],
    description:
      'Explainers about one measure across a whole section, e.g. "Does protein powder cause bloating?". The ranking of products fills itself in.',
    preview: (doc) => previewPath(`/topics/${doc.slug}`),
    livePreview: { url: ({ data }) => previewPath(`/topics/${data?.slug ?? ''}`) },
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    beforeChange: [uniquenessGuard('guides')],
    afterChange: [
      refreshAfterChange,
      redirectOnSlugChange('guides', (d) => `/topics/${d.slug}`),
      pingIndexNow((d) => `/topics/${d.slug}`),
    ],
    afterDelete: [refreshAfterDelete, goneOnDelete((d) => `/topics/${d.slug}`)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Guide',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: 'Phrase it as the question people search for.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'aspect',
                  label: 'Measure',
                  type: 'relationship',
                  relationTo: 'aspects',
                  required: true,
                },
                {
                  name: 'section',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                  filterOptions: { parent: { exists: false } },
                },
              ],
            },
            {
              name: 'explainer',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'A few paragraphs explaining the issue. Leave a blank line between paragraphs.',
              },
            },
          ],
        },
        { label: 'Questions', fields: [faqField] },
      ],
    },
    slugField('title', {
      admin: { position: 'sidebar', description: 'The page lives at /topics/<this>.' },
    }),
    tagsField,
    relatedField,
    uniquenessField,
  ],
}
