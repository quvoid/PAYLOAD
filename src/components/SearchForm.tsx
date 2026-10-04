import type { Track } from '@/lib/types'

import { routes } from '@/lib/routes'

import { Icon } from './Icon'

/** Plain GET form to /search — works without JavaScript. Inputs use rounded.md; buttons are pills. */
export function SearchForm({
  track = 'light',
  size = 'sm',
  defaultValue = '',
  shortcut = false,
  className = '',
}: {
  track?: Track
  size?: 'sm' | 'lg'
  defaultValue?: string
  /** Show the "/" key hint. The key itself is handled once per page by SearchShortcut. */
  shortcut?: boolean
  className?: string
}) {
  const night = track === 'night'
  const input = night
    ? 'border-hairline-night bg-night-elevated text-white placeholder:text-shade-40 hover:border-shade-50 focus:border-aqua'
    : 'border-hairline bg-white text-ink placeholder:text-shade-50 hover:border-shade-40 focus:border-indigo'
  const button = night ? 'bg-white text-indigo hover:bg-peach' : 'bg-indigo text-white hover:bg-shade-70'
  const lg = size === 'lg'
  return (
    <form action={routes.search()} method="get" role="search" className={`flex items-center gap-2 ${className}`}>
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search products</span>
        <Icon
          name="search"
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${lg ? 'left-5 size-5' : 'left-3.5 size-4'} ${night ? 'text-shade-40' : 'text-shade-50'}`}
        />
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={lg ? 'Search products, brands, categories' : 'Search products'}
          maxLength={120}
          className={`w-full rounded-md border transition-colors ${lg ? 'min-h-14 pl-13 pr-4 text-body-lg' : 'min-h-11 pl-10 pr-10 text-body-md'} ${input}`}
        />
        {shortcut && !lg && (
          <kbd
            aria-hidden
            className={`pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-xs border px-1.5 font-sans text-micro ${night ? 'border-hairline-night text-shade-40' : 'border-hairline text-shade-50'}`}
          >
            /
          </kbd>
        )}
      </label>
      <button
        type="submit"
        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-pill transition-colors ${lg ? 'min-h-14 min-w-14 px-4 text-body-strong sm:px-6' : 'min-h-11 px-6'} ${button}`}
      >
        {lg && <Icon name="search" className="size-5 sm:hidden" />}
        <span className={lg ? 'max-sm:sr-only' : undefined}>Search</span>
      </button>
    </form>
  )
}
