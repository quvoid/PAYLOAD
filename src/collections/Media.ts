import type { CollectionConfig } from 'payload'

import { loggedIn } from './shared'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: { group: 'Settings', description: 'Product photos, brand logos and team photos.' },
  access: {
    read: () => true,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  fields: [
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
      admin: { description: 'What the image shows, for screen readers and search engines.' },
    },
  ],
  upload: true,
}
