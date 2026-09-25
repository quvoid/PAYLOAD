import type { CollectionConfig } from 'payload'

import { isAdmin, loggedIn, refreshAfterChange, refreshAfterDelete, slugField } from './shared'

export const Sources: CollectionConfig = {
  slug: 'sources',
  labels: { singular: 'Source', plural: 'Sources' },
  admin: {
    group: 'Scoring',
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'weight'],
    description: 'Where reviews come from. Listed publicly on the "Where our reviews come from" page.',
  },
  access: { read: loggedIn, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Marketplace', value: 'marketplace' },
        { label: 'Brand store', value: 'brand-store' },
        { label: 'App store', value: 'app-store' },
        { label: 'Community', value: 'community' },
        { label: 'Video', value: 'video' },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        description: 'How much its star ratings count in our weighted average. Brand-owned stores are down-weighted (0.6).',
      },
    },
    {
      name: 'hasRatings',
      label: 'Reviews have star ratings',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Off for Reddit and YouTube, where people write without a star rating.' },
    },
    { name: 'collection', label: 'How we collect it', type: 'textarea', required: true },
    slugField('name', {
      admin: { position: 'sidebar', description: 'Internal key used by the review pipeline, e.g. play-store.' },
    }),
  ],
}
