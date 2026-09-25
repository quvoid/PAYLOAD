import Link from 'next/link'

import type { Track } from '@/lib/types'

/** Five bars in palette order: the reviews, lined up and measured. */
export function Wordmark({ track = 'light' }: { track?: Track }) {
  const bars = [
    { h: 11, y: 13, fill: 'var(--color-aqua)' },
    { h: 16, y: 8, fill: track === 'night' ? 'var(--color-white)' : 'var(--color-indigo)' },
    { h: 13, y: 11, fill: 'var(--color-pink)' },
    { h: 9, y: 15, fill: 'var(--color-blush)' },
    { h: 6, y: 18, fill: 'var(--color-peach)' },
  ]
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="ReviewLens home">
      <svg aria-hidden viewBox="4 6 25 20" className="h-6 w-7">
        {bars.map((b, i) => (
          <rect key={i} x={6 + i * 4.5} y={b.y} width={3} height={b.h} rx={1.5} fill={b.fill} />
        ))}
      </svg>
      <span className={`text-heading-md ${track === 'night' ? 'text-white' : 'text-ink'}`}>
        Review<span className="font-display [font-weight:330]">Lens</span>
      </span>
    </Link>
  )
}
