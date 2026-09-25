import type { CollectionConfig } from 'payload'

import { isAdmin, loggedIn, refreshAfterChange, refreshAfterDelete, slugField } from './shared'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Brand', plural: 'Brands' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    description: 'Every brand gets its own page listing its products.',
  },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'about',
      type: 'textarea',
      admin: { description: 'A short, factual description. Leave a blank line between paragraphs.' },
    },
    { name: 'website', type: 'text', admin: { placeholder: 'https://…' } },
    {
      name: 'sameAs',
      label: 'Other official profiles',
      type: 'array',
      admin: { description: 'e.g. the brand’s Wikipedia or Wikidata page. Helps search engines identify the brand.' },
      fields: [{ name: 'url', type: 'text', required: true }],
    },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    slugField('name'),
    { name: 'products', type: 'join', collection: 'products', on: 'brand' },
  ],
}
