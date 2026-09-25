import type { CollectionConfig, Field } from 'payload'

import { isAdmin, loggedIn, refreshAfterChange } from './shared'

// Collected reviews. The pipeline writes these in bulk straight to the database (skipping
// per-document hooks, so a million rows stay fast); editors can read them and hide one from the
// site, nothing else.
const readOnly = (field: Field): Field => ({ ...field, admin: { ...field.admin, readOnly: true } }) as Field

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Review', plural: 'Reviews' },
  admin: {
    group: 'Data',
    useAsTitle: 'body',
    defaultColumns: ['body', 'product', 'source', 'rating', 'date', 'hidden'],
    listSearchableFields: ['body', 'author'],
    description:
      'Every collected review. They come in automatically and can’t be edited — but you can hide one (spam, abuse, wrong product) and it disappears from the site and the numbers.',
  },
  access: { read: loggedIn, create: isAdmin, update: loggedIn, delete: isAdmin },
  hooks: { afterChange: [refreshAfterChange] },
  fields: [
    {
      name: 'hidden',
      label: 'Hide from the site',
      type: 'checkbox',
      admin: {
        position: 'sidebar',
        description: 'Hidden reviews are left out of every page and every number.',
      },
    },
    readOnly({ name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true }),
    readOnly({ name: 'body', label: 'Review', type: 'textarea', required: true }),
    readOnly({
      type: 'row',
      fields: [
        { name: 'source', type: 'text', required: true, index: true, admin: { readOnly: true } },
        { name: 'rating', label: 'Stars', type: 'number', admin: { readOnly: true } },
        {
          name: 'sentiment',
          type: 'select',
          options: ['positive', 'neutral', 'negative'],
          admin: { readOnly: true },
        },
      ],
    }),
    readOnly({
      type: 'row',
      fields: [
        { name: 'author', type: 'text', admin: { readOnly: true } },
        { name: 'date', type: 'date', admin: { readOnly: true } },
        { name: 'verified', label: 'Verified purchase', type: 'checkbox', admin: { readOnly: true } },
        { name: 'credibility', type: 'number', admin: { readOnly: true, description: '0–1. Below 0.3 counts as likely manipulated.' } },
      ],
    }),
    readOnly({ name: 'url', label: 'Original', type: 'text' }),
    readOnly({ name: 'aspects', label: 'Measures mentioned', type: 'json' }),
    readOnly({ name: 'original', label: 'As written (before translation)', type: 'json' }),
    readOnly({ name: 'externalId', type: 'text', unique: true, index: true, admin: { position: 'sidebar' } }),
  ],
}
