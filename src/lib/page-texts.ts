// Wording of the site's fixed pages (Home, Categories, Ranked lists…), edited in the admin under
// Website → Page texts. These defaults are what the admin starts from and what the site shows
// when a field is left empty.

export const PAGE_TEXT_KEYS = ['home', 'categories', 'best', 'compare', 'methodology', 'sources', 'search', 'notFound'] as const
export type PageTextKey = (typeof PAGE_TEXT_KEYS)[number]

export interface PageText {
  /** Admin tab label. */
  label: string
  /** The page's main heading. Unused for Home (its headline lives in Site settings). */
  heading: string
  intro: string
  /** Search result title (the site name is added) and description. */
  title: string
  description: string
}

export const PAGE_TEXT_DEFAULTS: Record<PageTextKey, PageText> = {
  home: {
    label: 'Home',
    heading: '',
    intro: '',
    title: 'Every review, weighed — honest buying verdicts',
    description:
      'Every review of a product from across the internet, weighed honestly, with a straight answer on whether to buy it.',
  },
  categories: {
    label: 'Categories',
    heading: 'All categories',
    intro:
      'Every category we review. Each one is scored on the measures that matter for it, so products are always compared like with like.',
    title: 'All categories',
    description: 'Every category ReviewLens reviews, from protein powder to UPI apps.',
  },
  best: {
    label: 'Ranked lists',
    heading: 'Ranked lists',
    intro:
      'Each list ranks products by a score we compute from reviews, and re-ranks itself whenever reviews or prices change.',
    title: 'Ranked lists — best products by what matters',
    description: 'Every ranked list on ReviewLens, each ordered by scores computed from real reviews.',
  },
  compare: {
    label: 'Compare',
    heading: 'Compare',
    intro: 'Scores, sentiment and share of voice side by side — for a whole category, or two products head to head.',
    title: 'Compare products side by side',
    description: 'Head-to-head comparisons and whole-category tables, every measure computed from reviews.',
  },
  methodology: {
    label: 'How we score',
    heading: 'How we score',
    intro:
      'Code counts; people judge. Every number on ReviewLens is computed from reviews by fixed rules. A model writes the wording of pros, cons and verdicts, but never a number, and a named editor approves every page.',
    title: 'How we score products',
    description:
      'How ReviewLens collects reviews, discounts manipulation, computes every number and reaches a verdict.',
  },
  sources: {
    label: 'Sources',
    heading: 'Where our reviews come from',
    intro:
      'We collect reviews from {sources} kinds of source. We show short excerpts only, and every review links back to where it was posted.',
    title: 'Where our reviews come from',
    description:
      'Every source ReviewLens collects reviews from, how we collect them, and how much each one counts.',
  },
  search: {
    label: 'Search',
    heading: 'Search the catalogue',
    intro: '',
    title: 'Search',
    description: '',
  },
  notFound: {
    label: 'Not found (404)',
    heading: 'We haven’t reviewed that.',
    intro: 'The page you’re looking for doesn’t exist, or the product isn’t in our catalogue yet.',
    title: '',
    description: '',
  },
}
