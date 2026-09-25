// Shared between the review-request form (client) and its server action.

export interface RequestState {
  status: 'idle' | 'ok' | 'error'
  message?: string
  /** How many readers have now asked for this product, including this one. */
  count?: number
  /** What the reader typed, returned on error — React resets the form after every submit. */
  values?: { query: string; productUrl: string; email: string }
}

/** Links we accept with a request — the sources our scrapers cover. */
export const PRODUCT_HOSTS = ['amazon.in', 'amazon.com', 'flipkart.com', 'play.google.com', 'apps.apple.com']

export const QUERY_MAX = 120
