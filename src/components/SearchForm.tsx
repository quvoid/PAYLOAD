import type { Track } from '@/lib/types'

import { routes } from '@/lib/routes'

/** Plain GET form to /search — works without JavaScript. Inputs use rounded.md; buttons are pills. */
export function SearchForm({
  track = 'light',
  size = 'sm',
  defaultValue = '',
  className = '',
}: {
  track?: Track
  size?: 'sm' | 'lg'
  defaultValue?: string
  className?: string
}) {
  const night = track === 'night'
  const input = night
    ? 'border-hairline-night bg-night-elevated text-white placeholder:text-shade-40'
    : 'border-hairline bg-white text-ink placeholder:text-shade-50'
  const button = night ? 'bg-white text-indigo hover:bg-peach' : 'bg-indigo text-white hover:bg-shade-70'
  const lg = size === 'lg'
  return (
    <form action={routes.search()} method="get" role="search" className={`flex items-center gap-2 ${className}`}>
      <label className="min-w-0 flex-1">
        <span className="sr-only">Search products</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={lg ? 'Search a product, brand or category' : 'Search products'}
          maxLength={120}
          className={`w-full rounded-md border px-4 ${lg ? 'min-h-14 text-body-lg' : 'min-h-11 text-body-md'} ${input}`}
        />
      </label>
      <button
        type="submit"
        className={`shrink-0 rounded-pill px-6 transition-colors ${lg ? 'min-h-14' : 'min-h-11'} ${button}`}
      >
        Search
      </button>
    </form>
  )
}
