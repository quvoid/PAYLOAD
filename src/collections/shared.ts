import { revalidatePath } from 'next/cache'
import type {
  Access,
  ArrayField,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Field,
  GlobalAfterChangeHook,
  GroupField,
  PayloadRequest,
  RelationshipField,
  TextField,
} from 'payload'

import type { Redirect } from '@/payload-types'

/** Collections a redirect can point at (see redirectsPlugin in payload.config.ts). */
type RedirectTarget = NonNullable<NonNullable<Redirect['to']>['reference']>['relationTo']

// Shared pieces for the collections. Everything an editor sees is labelled in plain language:
// the admin is meant to be run by people who never open the code.

export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')

/** Web address, filled in from another field the first time the document is saved. */
export const slugField = (from: string, overrides: Partial<TextField> = {}): TextField =>
  ({
    name: 'slug',
    label: 'Web address',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Filled in automatically from the name. Changing it after publishing breaks existing links.',
    },
    hooks: {
      beforeValidate: [({ value, data }) => value || (data?.[from] ? slugify(String(data[from])) : value)],
    },
    validate: (value: unknown) =>
      typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ? true
        : 'Use lowercase letters, numbers and hyphens only, e.g. whey-protein.',
    ...overrides,
  }) as TextField

export const faqField: ArrayField = {
  name: 'faq',
  label: 'Questions and answers',
  type: 'array',
  labels: { singular: 'Question', plural: 'Questions' },
  admin: {
    description: 'Shown on the page and marked up for search engines. Phrase questions the way people ask them.',
  },
  fields: [
    { name: 'q', label: 'Question', type: 'text', required: true },
    {
      name: 'a',
      label: 'Answer',
      type: 'textarea',
      required: true,
      admin: { description: 'About 40–60 words. No statistics — the page shows every figure next to the text.' },
    },
  ],
}

/**
 * Tell the site something changed: bump the version the site checks before rendering, and clear
 * cached pages. Skipped for writes that pass `context.skipRefresh` (bulk imports refresh once at
 * the end).
 */
export const refreshSite = async (
  req: PayloadRequest,
  context: Record<string, unknown> = {},
  { clearPages = true }: { clearPages?: boolean } = {},
) => {
  if (context.skipRefresh) return
  const state = await req.payload.findGlobal({ slug: 'catalog-state', req, depth: 0 })
  await req.payload.updateGlobal({
    slug: 'catalog-state',
    data: { version: (state.version ?? 0) + 1 },
    req,
    context: { skipRefresh: true },
  })
  if (!clearPages) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Outside Next.js (seed and import scripts) there is no page cache to clear.
  }
}

// A draft save (including autosave while someone types) changes nothing the public sees, so the
// page cache is kept; the version still moves so Preview shows the new draft. Unpublishing is a
// draft save over a published document, and does clear the cache.
export const refreshAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req, context }) => {
  const draftOnly = doc?._status === 'draft' && previousDoc?._status !== 'published'
  await refreshSite(req, context, { clearPages: !draftOnly })
}
export const refreshAfterDelete: CollectionAfterDeleteHook = async ({ req, context }) => {
  await refreshSite(req, context)
}
export const refreshAfterGlobalChange: GlobalAfterChangeHook = async ({ req, context }) => {
  await refreshSite(req, context)
}

/** Draft pages open through /preview, which checks the admin login and turns on draft mode. */
export const previewPath = (path: string) => `/preview?path=${encodeURIComponent(path)}`

/** Tags: free-form labels editors add to group related pages (each tag gets its own page). */
export const tagsField: RelationshipField = {
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true,
  admin: {
    position: 'sidebar',
    description: 'Group this with related pages. Each tag has its own page listing everything tagged with it.',
  },
}

/** A link an editor can point at one of our pages or at any web address. */
export const linkFields = (): Field[] => [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', required: true },
      {
        name: 'type',
        label: 'Links to',
        type: 'radio',
        defaultValue: 'page',
        options: [
          { label: 'One of our pages', value: 'page' },
          { label: 'A web address', value: 'custom' },
        ],
      },
    ],
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    required: true,
    admin: { condition: (_, sibling) => sibling?.type !== 'custom' },
  },
  {
    type: 'row',
    fields: [
      {
        name: 'url',
        label: 'Web address',
        type: 'text',
        required: true,
        admin: {
          condition: (_, sibling) => sibling?.type === 'custom',
          placeholder: '/best  or  https://…',
          description: 'A path on this site (/best) or a full address.',
        },
      },
      {
        name: 'newTab',
        label: 'Open in a new tab',
        type: 'checkbox',
        admin: { condition: (_, sibling) => sibling?.type === 'custom' },
      },
    ],
  },
]

export const linkGroup = (name: string, label: string): GroupField => ({ name, label, type: 'group', fields: linkFields() })

/**
 * When a published page's web address changes, send the old address to the new one, so links
 * and search results keep working. Editors see (and can edit) these under Website → Redirects.
 */
export const redirectOnSlugChange =
  (collection: RedirectTarget, pathOf: (doc: Record<string, unknown>) => Promise<string> | string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update' || !previousDoc?.slug || previousDoc.slug === doc.slug) return
    if ('_status' in previousDoc && previousDoc._status !== 'published') return
    const from = await pathOf(previousDoc)
    const to = await pathOf(doc)
    if (from === to) return
    const ctx = { skipRefresh: true }
    // Anything that pointed at the new address would now loop; the page itself lives there again.
    await req.payload.delete({ collection: 'redirects', where: { from: { equals: to } }, req, context: ctx })
    const existing = await req.payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1, req })
    const data = {
      from,
      type: '301' as const,
      to: { type: 'reference' as const, reference: { relationTo: collection, value: doc.id } as NonNullable<Redirect['to']>['reference'] },
    }
    if (existing.docs[0]) await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data, req, context: ctx })
    else await req.payload.create({ collection: 'redirects', data, req, context: ctx })
  }
