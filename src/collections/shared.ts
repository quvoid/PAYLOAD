import { revalidatePath } from 'next/cache'
import type {
  Access,
  ArrayField,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  Field,
  GlobalAfterChangeHook,
  GroupField,
  PayloadRequest,
  RelationshipField,
  TextField,
  UIField,
} from 'payload'
import { ValidationError } from 'payload'

import { nearestTo, publishedDocs, UNIQUENESS_THRESHOLD, type UniqueCollection } from '@/lib/uniqueness'
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

/**
 * Hand-picked "Related" links shown near the end of the page. Pages that already list related
 * items automatically (same-category products, lists, head-to-heads) keep those; these come first.
 */
export const relatedField: RelationshipField = {
  name: 'related',
  label: 'Related',
  type: 'relationship',
  relationTo: ['products', 'best-lists', 'comparisons', 'guides', 'pages'],
  hasMany: true,
  maxRows: 6,
  admin: {
    position: 'sidebar',
    description: 'Up to six pages readers should see next. Drafts are skipped until they are published.',
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
      urlField({
        name: 'url',
        label: 'Web address',
        required: true,
        admin: {
          condition: (_, sibling) => sibling?.type === 'custom',
          placeholder: '/best  or  https://…',
          description: 'A path on this site (/best) or a full address.',
        },
      }),
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
 * Keeps addresses consistent when a document is saved:
 * - When a published page's web address changes, the old address is sent to the new one, so links
 *   and search results keep working. Editors see (and can edit) these under Website → Redirects.
 * - A published page's own address never carries a redirect or a "Gone" rule, which would hide it.
 */
export const redirectOnSlugChange =
  (collection: RedirectTarget, pathOf: (doc: Record<string, unknown>) => Promise<string> | string): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, operation }) => {
    const live = !('_status' in doc) || doc._status === 'published'
    if (!live || !doc.slug) return
    const ctx = { skipRefresh: true }
    const to = await pathOf(doc)
    await req.payload.delete({ collection: 'redirects', where: { from: { equals: to } }, req, context: ctx })

    if (operation !== 'update' || !previousDoc?.slug || previousDoc.slug === doc.slug) return
    if ('_status' in previousDoc && previousDoc._status !== 'published') return
    const from = await pathOf(previousDoc)
    if (from === to) return
    const existing = await req.payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1, req })
    const data = {
      from,
      type: '301' as const,
      to: { type: 'reference' as const, reference: { relationTo: collection, value: doc.id } as NonNullable<Redirect['to']>['reference'] },
    }
    if (existing.docs[0]) await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data, req, context: ctx })
    else await req.payload.create({ collection: 'redirects', data, req, context: ctx })
  }

/**
 * Deleting a published page for good answers its address with "410 Gone", which tells search
 * engines to drop it sooner than a plain "not found". Switch off in Site settings → Crawlers.
 */
export const goneOnDelete =
  (pathOf: (doc: Record<string, unknown>) => Promise<string> | string): CollectionAfterDeleteHook =>
  async ({ doc, req }) => {
    if (!doc?.slug || ('_status' in doc && doc._status !== 'published')) return
    const site = await req.payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    if (site.goneOnDelete === false) return
    const from = await pathOf(doc)
    const existing = await req.payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1, req })
    if (existing.docs.length) return
    await req.payload.create({ collection: 'redirects', data: { from, type: '410' }, req, context: { skipRefresh: true } })
  }

/**
 * Web addresses typed into the admin: http:// becomes https:// (a page served over HTTPS that
 * loads or links http:// content shows "Not secure" warnings), and anything else must be a
 * full https:// address or a path on this site.
 */
export const secureUrlHooks = {
  beforeValidate: [
    ({ value }: { value?: unknown }) =>
      typeof value === 'string' ? value.trim().replace(/^http:\/\//i, 'https://') : value,
  ],
}
export const validateSecureUrl = (value: unknown) =>
  !value || /^(https:\/\/|\/|mailto:|tel:)/i.test(String(value))
    ? true
    : 'Use a full address starting with https://, or a path on this site starting with /.'

/** A text field for a web address, upgraded to https:// on save. */
export const urlField = (field: Omit<TextField, 'type'>): TextField =>
  ({
    ...field,
    type: 'text',
    hooks: { ...field.hooks, ...secureUrlHooks },
    validate: validateSecureUrl,
  }) as TextField

/**
 * Links that identify the same thing elsewhere (Wikipedia, Wikidata, official profiles). Search
 * engines and AI answer engines use them to know exactly what a page is about.
 */
export const sameAsField = (description: string): ArrayField => ({
  name: 'sameAs',
  label: 'Same thing elsewhere',
  type: 'array',
  labels: { singular: 'Link', plural: 'Links' },
  admin: { description },
  fields: [urlField({ name: 'url', required: true, admin: { placeholder: 'https://www.wikidata.org/wiki/Q…' } })],
})

/** Sidebar panel: how different this page is from its closest match (see src/lib/uniqueness.ts). */
export const uniquenessField: UIField = {
  name: 'uniqueness',
  type: 'ui',
  admin: { position: 'sidebar', components: { Field: '/components/admin/UniquenessPanel#UniquenessPanel' } },
}

/**
 * Refuses to publish a near-duplicate when Site settings → Programmatic SEO → "Stop near-duplicate
 * pages" is on. Drafts are never blocked.
 */
export const uniquenessGuard =
  (collection: UniqueCollection): CollectionBeforeChangeHook =>
  async ({ data, originalDoc, req }) => {
    if (data?._status !== 'published') return data
    const site = await req.payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    if (!site.blockDuplicates) return data
    const threshold = site.uniquenessThreshold ?? UNIQUENESS_THRESHOLD
    const doc = { ...originalDoc, ...data }
    const result = nearestTo(collection, doc, await publishedDocs(req.payload, collection))
    if (!result.tooShort && result.distance < threshold && result.nearest) {
      throw new ValidationError({
        collection,
        errors: [
          {
            path: '_status',
            message: `Too similar to “${result.nearest.title}”: only ${Math.round(result.distance * 100)}% of the wording is this page’s own (at least ${Math.round(threshold * 100)}% needed). Rewrite the shared parts, or save as a draft.`,
          },
        ],
      })
    }
    return data
  }
