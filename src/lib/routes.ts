import type { Category } from './types'

// One place that knows every URL shape (docs/PLAN.md §2). Templates never build paths by hand.

export const routes = {
  home: () => '/',
  category: (c: Pick<Category, 'slug' | 'parent'>) =>
    c.parent ? `/category/${c.parent}/${c.slug}` : `/category/${c.slug}`,
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
}

export const reviewAnchor = (id: string) => `rv-${id}`
