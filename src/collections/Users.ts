import type { CollectionConfig } from 'payload'

import { isAdmin, loggedIn, refreshAfterChange, sameAsField, slugField } from './shared'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
    description:
      'Everyone who can log in. Editors approve verdicts, and their name and bio appear on every page they publish.',
  },
  auth: {
    // Five wrong passwords lock the account for ten minutes.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Logged in for a week; cookies only over HTTPS once the site runs on it.
    tokenExpiration: 7 * 24 * 60 * 60,
    cookies: {
      secure: (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://'),
      sameSite: 'Lax',
    },
  },
  access: {
    read: loggedIn,
    create: isAdmin,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The very first account is always an admin, so nobody gets locked out of their own site.
      async ({ data, operation, req }) => {
        if (operation === 'create' && (await req.payload.count({ collection: 'users', req })).totalDocs === 0) {
          return { ...data, role: 'admin' }
        }
        return data
      },
    ],
    afterChange: [refreshAfterChange],
  },
  fields: [
    // Name, address and role are checked on save rather than enforced by the database, so adding
    // them never forces a migration to touch existing accounts.
    {
      name: 'name',
      type: 'text',
      validate: (value: unknown) => (typeof value === 'string' && value.trim() ? true : 'Please enter a name.'),
      admin: { description: 'Shown on every verdict you approve, e.g. "Approved by Omkar".' },
    },
    slugField('name', {
      required: false,
      admin: { position: 'sidebar', description: 'Address of your public profile page, /authors/…' },
    }),
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: { update: ({ req }) => req.user?.role === 'admin' },
      admin: {
        position: 'sidebar',
        description: 'Editors write and publish. Admins can also manage the team and the scoring rules.',
      },
    },
    { name: 'jobTitle', label: 'Title shown on the site', type: 'text', defaultValue: 'Editor' },
    { name: 'bio', type: 'textarea', admin: { description: 'A few sentences for your public profile page.' } },
    { name: 'credentials', type: 'text', admin: { description: 'Optional, e.g. "Certified nutritionist".' } },
    sameAsField('Optional. Your LinkedIn, X or personal site. Shown to search engines as the same person.'),
    { name: 'photo', type: 'upload', relationTo: 'media' },
  ],
}
