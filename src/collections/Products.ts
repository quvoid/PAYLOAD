import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook, CollectionConfig } from 'payload'

import { faqField, isAdmin, loggedIn, previewPath, refreshAfterChange, refreshAfterDelete, slugField } from './shared'

// Publishing is approval: the person who presses Publish becomes the named editor on the page.
const recordApproval: CollectionBeforeChangeHook = ({ data, req }) => {
  if (data._status === 'published' && req.user) {
    return { ...data, author: req.user.id, approvedAt: new Date().toISOString() }
  }
  return data
}

// Reviews belong to one product; remove them first so deleting a product can't fail half-way.
const deleteReviews: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({ collection: 'reviews', where: { product: { equals: id } }, req, context: { skipRefresh: true } })
}

const storeRow = [
  { name: 'source', type: 'relationship', relationTo: 'sources', required: true },
] as const

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  admin: {
    group: 'Catalogue',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'brand', '_status', 'updatedAt'],
    listSearchableFields: ['name', 'slug'],
    description:
      'Every product we review. Draft products are hidden from the site: read the draft with Preview, then press Publish to approve it.',
    preview: (doc) => previewPath(`/reviews/${doc.slug}`),
  },
  versions: { drafts: true },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: isAdmin },
  hooks: {
    beforeChange: [recordApproval],
    beforeDelete: [deleteReviews],
    afterChange: [refreshAfterChange],
    afterDelete: [refreshAfterDelete],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basics',
          fields: [
            { name: 'name', type: 'text', required: true, admin: { placeholder: 'boAt Airdopes 141 Gen 2' } },
            {
              name: 'shortName',
              label: 'Short name',
              type: 'text',
              required: true,
              admin: { description: 'Used in tables and comparisons, e.g. "Airdopes 141 Gen 2".' },
            },
            {
              type: 'row',
              fields: [
                { name: 'brand', type: 'relationship', relationTo: 'brands', required: true },
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  required: true,
                  filterOptions: { parent: { exists: true } },
                },
              ],
            },
            {
              name: 'variant',
              label: 'Variant shown under the title',
              type: 'text',
              admin: { placeholder: '1 kg · Rich Chocolate' },
            },
            {
              name: 'sample',
              label: 'Fictional sample product',
              type: 'checkbox',
              admin: { description: 'Sample products are made up for development and labelled "Sample" on the site.' },
            },
          ],
        },
        {
          label: 'Verdict & wording',
          description:
            'The verdict itself (Buy, Skip…) and every number are calculated from reviews — you only write the words. The sidebar shows what the rules currently say.',
          fields: [
            {
              name: 'answer',
              label: 'Short answer',
              type: 'textarea',
              required: true,
              maxLength: 320,
              admin: {
                description:
                  'The first thing readers see: the verdict in one or two sentences, up to 320 characters. No statistics.',
              },
            },
            {
              name: 'verdictBody',
              label: 'Verdict explained',
              type: 'textarea',
              admin: { description: 'Two short paragraphs. Leave a blank line between them.' },
            },
            {
              name: 'claims',
              label: 'Pros and cons',
              type: 'array',
              labels: { singular: 'Pro or con', plural: 'Pros and cons' },
              admin: {
                description:
                  'Each one needs at least two reviews behind it — ones without enough evidence are hidden automatically. The page adds the percentage and a quote.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'sentiment',
                      label: 'Type',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Pro', value: 'positive' },
                        { label: 'Con', value: 'negative' },
                      ],
                    },
                    { name: 'aspect', label: 'Measure', type: 'relationship', relationTo: 'aspects', required: true },
                  ],
                },
                { name: 'text', type: 'text', required: true, admin: { placeholder: 'Battery backup shorter than expected' } },
              ],
            },
          ],
        },
        { label: 'Questions', fields: [faqField] },
        {
          label: 'Where to buy',
          fields: [
            {
              name: 'offers',
              label: 'Prices',
              type: 'array',
              labels: { singular: 'Price', plural: 'Prices' },
              admin: { description: 'One row per store. Use 0 for free apps.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    ...storeRow,
                    { name: 'price', type: 'number', required: true },
                    { name: 'mrp', label: 'MRP', type: 'number' },
                    { name: 'inStock', label: 'In stock', type: 'checkbox', defaultValue: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'url', label: 'Link', type: 'text' },
                    { name: 'checkedAt', label: 'Checked on', type: 'date' },
                  ],
                },
              ],
            },
            {
              name: 'valueQuantity',
              label: 'Units for price per unit',
              type: 'number',
              defaultValue: 0,
              admin: {
                description:
                  'Only if the category shows a price per unit: e.g. grams of protein in the pack. Leave 0 if unknown.',
              },
            },
            {
              name: 'specs',
              label: 'Key facts',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'value', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Data collection',
          description: 'Filled in by the review pipeline. Add store links so the pipeline knows where to collect reviews.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'flipkartUrl', label: 'Flipkart link', type: 'text' },
                { name: 'playStoreId', label: 'Google Play ID', type: 'text', admin: { placeholder: 'com.phonepe.app' } },
                { name: 'appStoreId', label: 'App Store ID', type: 'text', admin: { placeholder: '1170055821' } },
              ],
            },
            {
              name: 'redditPhrases',
              label: 'Reddit search phrases',
              type: 'text',
              admin: { description: 'Comma-separated, e.g. "Airdopes 141, boAt Airdopes".' },
            },
            {
              name: 'platformStats',
              label: 'Store ratings',
              type: 'array',
              admin: { description: 'Each store’s own rating and rating count, as the store reports them.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    ...storeRow,
                    { name: 'rating', type: 'number', required: true },
                    { name: 'total', label: 'Number of ratings', type: 'number', required: true },
                  ],
                },
              ],
            },
            {
              name: 'dataUpdatedAt',
              label: 'Reviews last collected',
              type: 'date',
              admin: { description: 'Shown on the page as "Updated". Moves only when new reviews are collected.' },
            },
          ],
        },
      ],
    },
    {
      name: 'verdictPreview',
      type: 'ui',
      admin: { position: 'sidebar', components: { Field: '/components/admin/VerdictPreview#VerdictPreview' } },
    },
    slugField('name', {
      admin: {
        position: 'sidebar',
        description: 'The page lives at /reviews/<this>. Filled in from the name; don’t change it after publishing.',
      },
    }),
    {
      name: 'author',
      label: 'Approved by',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true, description: 'Set automatically to whoever publishes.' },
    },
    {
      name: 'approvedAt',
      label: 'Approved on',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
