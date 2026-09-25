import { revalidatePath } from 'next/cache'
import type {
  Access,
  ArrayField,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
  TextField,
} from 'payload'

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
export const refreshSite = async (req: PayloadRequest, context: Record<string, unknown> = {}) => {
  if (context.skipRefresh) return
  const state = await req.payload.findGlobal({ slug: 'catalog-state', req, depth: 0 })
  await req.payload.updateGlobal({
    slug: 'catalog-state',
    data: { version: (state.version ?? 0) + 1 },
    req,
    context: { skipRefresh: true },
  })
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Outside Next.js (seed and import scripts) there is no page cache to clear.
  }
}

export const refreshAfterChange: CollectionAfterChangeHook = async ({ req, context }) => {
  await refreshSite(req, context)
}
export const refreshAfterDelete: CollectionAfterDeleteHook = async ({ req, context }) => {
  await refreshSite(req, context)
}
export const refreshAfterGlobalChange: GlobalAfterChangeHook = async ({ req, context }) => {
  await refreshSite(req, context)
}

/** Draft pages open through /preview, which checks the admin login and turns on draft mode. */
export const previewPath = (path: string) => `/preview?path=${encodeURIComponent(path)}`
