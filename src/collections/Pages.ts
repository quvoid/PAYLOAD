import {
  BlocksFeature,
  FixedToolbarFeature,
  HorizontalRuleFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig, TextFieldSingleValidation } from 'payload'

import { RESERVED_SEGMENTS } from '@/lib/routes'

import {
  isAdmin,
  loggedIn,
  previewPath,
  redirectOnSlugChange,
  refreshAfterChange,
  refreshAfterDelete,
  slugField,
  tagsField,
} from './shared'

/** Pages live at the site root (/about), next to sections (/apps), so they can't share an address. */
export const validateRootSlug =
  (collection: 'pages' | 'categories'): TextFieldSingleValidation =>
  async (value, { req, siblingData }) => {
    if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return 'Use lowercase letters, numbers and hyphens only, e.g. about-us.'
    }
    // Categories inside a section live at /section/category, so only sections are checked.
    if (collection === 'categories' && (siblingData as { parent?: unknown })?.parent) return true
    if (RESERVED_SEGMENTS.has(value)) return `"${value}" is already used by another page. Choose a different web address.`
    const other = collection === 'pages' ? 'categories' : 'pages'
    const clash = await req.payload.find({
      collection: other,
      where: {
        slug: { equals: value },
        ...(other === 'categories' && { parent: { exists: false } }),
      },
      limit: 1,
      depth: 0,
      draft: true,
      req,
    })
    if (clash.docs.length) {
      return other === 'pages'
        ? `A page already uses /${value}. Choose a different web address.`
        : `The section "${(clash.docs[0] as { name?: string }).name}" already uses /${value}. Choose a different web address.`
    }
    return true
  }

const callout: Block = {
  slug: 'callout',
  labels: { singular: 'Highlighted note', plural: 'Highlighted notes' },
  fields: [
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'info',
      options: [
        { label: 'Information', value: 'info' },
        { label: 'Warning', value: 'warning' },
      ],
    },
    { name: 'text', type: 'textarea', required: true },
  ],
}

const button: Block = {
  slug: 'button',
  labels: { singular: 'Button', plural: 'Buttons' },
  fields: [
    { name: 'label', type: 'text', required: true },
    {
      name: 'url',
      label: 'Web address',
      type: 'text',
      required: true,
      admin: { placeholder: '/best  or  https://…' },
    },
  ],
}

// Free-form pages: About, Contact, Privacy policy, landing pages. Written in a word-processor-style
// editor, with drafts, autosave, live preview and version history.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    description:
      'Your own pages: About, Contact, Privacy policy and so on. Each lives at /<web address>. Add them to the menu or footer under Website → Navigation.',
    preview: (doc) => previewPath(`/${doc.slug}`),
    livePreview: { url: ({ data }) => previewPath(`/${data?.slug ?? ''}`) },
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  trash: true,
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    afterChange: [refreshAfterChange, redirectOnSlugChange('pages', (d) => `/${d.slug}`)],
    afterDelete: [refreshAfterDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { placeholder: 'About ReviewLens' } },
            {
              name: 'intro',
              label: 'Summary',
              type: 'textarea',
              admin: { description: 'Optional. A sentence or two shown in large type under the title.' },
            },
            {
              name: 'heroImage',
              label: 'Top image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Optional. Shown under the summary, full width.' },
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  FixedToolbarFeature(),
                  HorizontalRuleFeature(),
                  BlocksFeature({ blocks: [callout, button] }),
                ],
              }),
              admin: {
                description:
                  'Write as in a word processor. Type "/" for headings, lists, images, quotes, highlighted notes and buttons.',
              },
            },
          ],
        },
      ],
    },
    slugField('title', {
      validate: validateRootSlug('pages'),
      admin: {
        position: 'sidebar',
        description: 'The page lives at /<this>. Changing it later sends the old address to the new one automatically.',
      },
    }),
    tagsField,
    {
      name: 'publishedAt',
      label: 'Published on',
      type: 'date',
      admin: { position: 'sidebar', description: 'Set automatically the first time you publish.' },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => value ?? (siblingData?._status === 'published' ? new Date().toISOString() : value),
        ],
      },
    },
  ],
}
