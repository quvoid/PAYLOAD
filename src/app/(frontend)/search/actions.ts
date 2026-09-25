'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { normalizeQuery } from '@/lib/catalog'
import { PRODUCT_HOSTS, QUERY_MAX, type RequestState } from '@/lib/requests'

const productLink = (raw: string) => {
  try {
    const url = new URL(raw)
    const allowed =
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      PRODUCT_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))
    return allowed ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Records a reader's request for a product we haven't reviewed. Requests for the same product
 * (by normalised name) are merged into one document and counted.
 */
export async function requestReview(_prev: RequestState, form: FormData): Promise<RequestState> {
  // Honeypot: the field is hidden from people, so anything in it came from a bot. Pretend success.
  if (String(form.get('website') ?? '')) return { status: 'ok', count: 1 }

  const query = String(form.get('query') ?? '').trim().slice(0, QUERY_MAX)
  const rawLink = String(form.get('productUrl') ?? '').trim()
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const fail = (message: string): RequestState => ({
    status: 'error',
    message,
    values: { query, productUrl: rawLink, email },
  })

  const normalizedQuery = normalizeQuery(query)
  if (normalizedQuery.length < 2) return fail('Tell us which product you want reviewed.')

  const productUrl = rawLink ? productLink(rawLink) : null
  if (rawLink && !productUrl) {
    return fail('Links need to be from Amazon, Flipkart, Google Play or the App Store.')
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail('That email address doesn’t look right.')
  }

  try {
    const payload = await getPayload({ config })
    const now = new Date().toISOString()
    const { docs } = await payload.find({
      collection: 'review-requests',
      where: { normalizedQuery: { equals: normalizedQuery }, status: { in: ['new', 'queued'] } },
      limit: 1,
      depth: 0,
    })
    const existing = docs[0]

    if (!existing) {
      await payload.create({
        collection: 'review-requests',
        data: {
          query,
          normalizedQuery,
          productUrl,
          subscribers: email ? [{ email }] : [],
          status: 'new',
          requestCount: 1,
          lastRequestedAt: now,
        },
      })
      return { status: 'ok', count: 1 }
    }

    const subscribers = (existing.subscribers ?? []).map((s) => ({ email: s.email }))
    const updated = await payload.update({
      collection: 'review-requests',
      id: existing.id,
      data: {
        requestCount: existing.requestCount + 1,
        lastRequestedAt: now,
        ...(!existing.productUrl && productUrl && { productUrl }),
        ...(email && !subscribers.some((s) => s.email === email) && { subscribers: [...subscribers, { email }] }),
      },
    })
    return { status: 'ok', count: updated.requestCount }
  } catch (error) {
    console.error('review request failed', error)
    return fail('Something went wrong on our side. Please try again in a moment.')
  }
}
