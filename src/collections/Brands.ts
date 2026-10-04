import type { CollectionConfig } from 'payload'

import { pingIndexNow } from '@/lib/indexnow'

import {
  isAdmin,
  loggedIn,
  goneOnDelete,
  redirectOnSlugChange,
  refreshAfterChange,
  refreshAfterDelete,
  slugField,
  urlField,
} from './shared'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Brand', plural: 'Brands' },
  admin: {
    group: 'Products',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Every brand gets its own page listing its products.',
  },
  versions: { maxPerDoc: 25 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    afterChange: [
      refreshAfterChange,
      redirectOnSlugChange('brands', (d) => `/brands/${d.slug}`),
      pingIndexNow((d) => `/brands/${d.slug}`),
    ],
    afterDelete: [refreshAfterDelete, goneOnDelete((d) => `/brands/${d.slug}`)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'about',
              type: 'textarea',
              admin: {
                description: 'A short, factual description. Leave a blank line between paragraphs.',
              },
            },
            urlField({ name: 'website', admin: { placeholder: 'https://…' } }),
            {
              name: 'sameAs',
              label: 'Other official profiles',
              type: 'array',
              admin: {
                description:
                  'e.g. the brand’s Wikipedia or Wikidata page. Helps search engines identify the brand.',
              },
              fields: [urlField({ name: 'url', required: true })],
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
    slugField('name', {
      admin: { position: 'sidebar', description: 'The brand’s page lives at /brands/<this>.' },
    }),
    { name: 'products', type: 'join', collection: 'products', on: 'brand' },
  ],
}
