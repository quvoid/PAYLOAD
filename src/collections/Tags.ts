import type { CollectionConfig } from 'payload'

import { pingIndexNow } from '@/lib/indexnow'

import {
  loggedIn,
  goneOnDelete,
  redirectOnSlugChange,
  refreshAfterChange,
  refreshAfterDelete,
  slugField,
} from './shared'

// Free-form labels ("Budget picks", "Made in India") that group products, lists, guides and pages.
export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    group: 'Website',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    description:
      'Labels that group related pages, e.g. "Budget picks". Add them from the sidebar of any product, list, guide or page. Each tag has a page at /tags/<web address> listing everything with it.',
  },
  versions: { maxPerDoc: 25 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks: {
    afterChange: [
      refreshAfterChange,
      redirectOnSlugChange('tags', (d) => `/tags/${d.slug}`),
      pingIndexNow((d) => `/tags/${d.slug}`),
    ],
    afterDelete: [refreshAfterDelete, goneOnDelete((d) => `/tags/${d.slug}`)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Tag',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { placeholder: 'Budget picks' } },
            {
              name: 'description',
              type: 'textarea',
              admin: { description: 'Shown at the top of the tag’s page. A sentence or two on what ties these together.' },
            },
          ],
        },
      ],
    },
    slugField('name', { admin: { position: 'sidebar', description: 'The tag’s page lives at /tags/<this>.' } }),
  ],
}
