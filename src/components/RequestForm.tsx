'use client'

import React, { useActionState } from 'react'

import { requestReview } from '@/app/(frontend)/search/actions'
import { QUERY_MAX, type RequestState } from '@/lib/requests'

const field = 'mt-1 min-h-11 w-full rounded-md border border-hairline bg-white px-4 text-ink placeholder:text-shade-50'

export function RequestForm({ query }: { query: string }) {
  const [state, action, pending] = useActionState<RequestState, FormData>(requestReview, { status: 'idle' })

  if (state.status === 'ok') {
    return (
      <div role="status" className="rounded-lg bg-white p-6 shadow-l3">
        <p className="text-heading-md">Thanks — it’s on our list.</p>
        <p className="mt-2 text-shade-60">
          {state.count && state.count > 1
            ? `${state.count} readers have now asked for this product. The most-requested products get reviewed first.`
            : 'You’re the first to ask for this one. The most-requested products get reviewed first.'}
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      <label className="md:col-span-2">
        <span className="text-caption">Which product?</span>
        <input name="query" required maxLength={QUERY_MAX} defaultValue={state.values?.query ?? query} className={field} />
      </label>
      <label>
        <span className="text-caption">
          Link to it <span className="text-shade-60">(optional)</span>
        </span>
        <input
          name="productUrl"
          type="url"
          defaultValue={state.values?.productUrl}
          placeholder="Amazon, Flipkart, Play Store or App Store link"
          className={field}
        />
      </label>
      <label>
        <span className="text-caption">
          Email me when it’s reviewed <span className="text-shade-60">(optional)</span>
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          placeholder="you@example.com"
          className={field}
        />
      </label>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4 md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-pill bg-indigo px-6 text-white transition-colors hover:bg-shade-70 disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Request a review'}
        </button>
        <p className="text-micro text-shade-60">We use your email once, to tell you the review is live.</p>
      </div>
      {state.status === 'error' && (
        <p role="alert" className="rounded-pill bg-blush px-4 py-2 text-caption md:col-span-2">
          {state.message}
        </p>
      )}
    </form>
  )
}
