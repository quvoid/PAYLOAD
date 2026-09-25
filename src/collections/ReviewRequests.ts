import type { CollectionConfig } from 'payload'

// Products readers searched for and asked us to review. Created only by the site's server
// action (src/app/(frontend)/search/actions.ts); repeat requests are merged, so the list sorted
// by count is the demand signal for what to add to the catalogue next.
export const ReviewRequests: CollectionConfig = {
  slug: 'review-requests',
  labels: { singular: 'Review request', plural: 'Review requests' },
  admin: {
    useAsTitle: 'query',
    defaultColumns: ['query', 'requestCount', 'status', 'lastRequestedAt'],
    group: 'Editorial',
    description: 'Products readers asked us to review. Most-requested first.',
  },
  defaultSort: '-requestCount',
  access: {
    // Public submissions come through the server action (Local API), never REST or GraphQL.
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'query',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: { description: 'What the reader typed.' },
    },
    {
      name: 'productUrl',
      type: 'text',
      admin: { description: 'Optional link the reader gave (Amazon, Flipkart, Google Play, App Store).' },
    },
    {
      name: 'subscribers',
      type: 'array',
      admin: { description: 'Readers who asked to be emailed once, when the review goes live.' },
      fields: [{ name: 'email', type: 'email', required: true }],
    },
    {
      name: 'product',
      label: 'Added as',
      type: 'relationship',
      relationTo: 'products',
      admin: { description: 'Once the product is in the catalogue, link it here and set the status to "Added to catalogue".' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { description: 'Internal notes. Never shown on the site.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Queued for fetch', value: 'queued' },
        { label: 'Added to catalogue', value: 'added' },
        { label: 'Declined', value: 'declined' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'requestCount',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'lastRequestedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'normalizedQuery',
      type: 'text',
      required: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Used to merge repeat requests.' },
    },
  ],
}
