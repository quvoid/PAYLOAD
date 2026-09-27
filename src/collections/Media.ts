import type { CollectionConfig } from 'payload'

import { loggedIn, refreshAfterChange, refreshAfterDelete } from './shared'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    group: 'Website',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    listSearchableFields: ['filename', 'alt', 'caption'],
    description:
      'Every image on the site: product photos, logos, page images and share images. Drag an image in, write what it shows, and optionally click the point that must never be cropped.',
  },
  access: {
    read: () => true,
    create: loggedIn,
    update: loggedIn,
    delete: loggedIn,
  },
  folders: true,
  trash: true,
  hooks: { afterChange: [refreshAfterChange], afterDelete: [refreshAfterDelete] },
  fields: [
    {
      name: 'alt',
      label: 'Description',
      type: 'text',
      required: true,
      admin: { description: 'What the image shows, for screen readers and search engines.' },
    },
    { name: 'caption', type: 'text', admin: { description: 'Optional. Shown under the image where there is room.' } },
    { name: 'credit', type: 'text', admin: { description: 'Optional. Photographer or source, e.g. "Photo: boAt".' } },
  ],
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    // Resized copies made on upload. "share" is the 1200×630 size link previews use.
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 900 },
      { name: 'share', width: 1200, height: 630, position: 'centre' },
    ],
  },
}
