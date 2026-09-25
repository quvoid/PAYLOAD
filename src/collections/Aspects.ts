import type { CollectionConfig } from 'payload'

import { isAdmin, loggedIn, refreshAfterChange, refreshAfterDelete, slugField } from './shared'

// "Aspects" in the code; "Measures" to editors: taste, battery life, payment success…
export const Aspects: CollectionConfig = {
  slug: 'aspects',
  labels: { singular: 'Measure', plural: 'Measures' },
  admin: {
    group: 'Scoring',
    useAsTitle: 'label',
    defaultColumns: ['label', 'question', 'slug'],
    description:
      'The things products are judged on, like taste or payment success. Categories choose which measures apply to them.',
  },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    { name: 'label', label: 'Name', type: 'text', required: true, admin: { placeholder: 'Battery life' } },
    {
      name: 'question',
      type: 'text',
      required: true,
      admin: { description: 'How a shopper would ask about it.', placeholder: 'How long does the battery last?' },
    },
    slugField('label', {
      admin: {
        position: 'sidebar',
        description:
          'Internal key the review analysis uses. Filled in from the name; don’t change it once reviews have been analysed.',
      },
    }),
  ],
}
