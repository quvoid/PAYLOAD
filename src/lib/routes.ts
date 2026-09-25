import type { Category } from './types'

// One place that knows every URL shape (docs/PLAN.md §2). Templates never build paths by hand.

export const routes = {
  home: () => '/',
  // Categories live at the root: /apps, /apps/payment-apps. See RESERVED_SEGMENTS.
  category: (c: Pick<Category, 'slug' | 'parent'>) => (c.parent ? `/${c.parent}/${c.slug}` : `/${c.slug}`),
  categories: () => '/categories',
  product: (slug: string) => `/reviews/${slug}`,
  bestIndex: () => '/best',
  best: (slug: string) => `/best/${slug}`,
  compareIndex: () => '/compare',
  compare: (slug: string) => `/compare/${slug}`,
  brand: (slug: string) => `/brands/${slug}`,
  topic: (slug: string) => `/topics/${slug}`,
  author: (slug: string) => `/authors/${slug}`,
  methodology: () => '/methodology',
  sources: () => '/sources',
  search: () => '/search',
}

export const reviewAnchor = (id: string) => `rv-${id}`

/**
 * First URL segments already taken by other pages. A top-level category slug must never be one
 * of these, or its page would be shadowed — checked when the catalogue loads (catalog.ts).
 */
export const RESERVED_SEGMENTS = new Set([
  'reviews',
  'best',
  'compare',
  'brands',
  'topics',
  'authors',
  'methodology',
  'sources',
  'search',
  'categories',
  'preview',
  'exit-preview',
  'admin',
  'api',
  'my-route',
  'sitemap',
  'robots.txt',
  'icon',
  '_next',
])
