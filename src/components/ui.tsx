import Link from 'next/link'
import React from 'react'

import type { Track } from '@/lib/types'

// Small primitives from DESIGN.md: container, pill buttons, tags, section headings, prose.

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-4 md:px-6 lg:px-8 ${className}`}>{children}</div>
}

const pillVariants = {
  primary: 'bg-indigo text-white hover:bg-shade-70 active:bg-shade-70',
  'outline-light': 'border border-indigo bg-white text-indigo hover:bg-cream',
  'outline-night': 'border-2 border-white text-white hover:border-aqua hover:text-aqua',
  blush: 'bg-blush text-indigo hover:bg-peach',
}

/** The only button shape in the system is the pill (DESIGN.md → Buttons). */
export function PillLink({
  href,
  variant = 'primary',
  children,
  className = '',
}: {
  href: string
  variant?: keyof typeof pillVariants
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-3 text-body-md transition-colors ${pillVariants[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}

const tagVariants = {
  blush: 'bg-blush text-indigo',
  shade: 'bg-shade-30 text-indigo',
  peach: 'bg-peach text-indigo',
  night: 'border border-hairline-night text-peach',
}

export function Tag({
  children,
  variant = 'shade',
  className = '',
}: {
  children: React.ReactNode
  variant?: keyof typeof tagVariants
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-eyebrow uppercase ${tagVariants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Eyebrow({ children, track = 'light' }: { children: React.ReactNode; track?: Track }) {
  return (
    <p className={`text-eyebrow uppercase ${track === 'night' ? 'text-peach' : 'text-shade-60'}`}>
      {children}
    </p>
  )
}

/**
 * A page section labelled by its heading (docs/PLAN.md §5). Headings are phrased as the
 * question a reader would ask; the id is a stable anchor answer engines can cite.
 */
export function Section({
  id,
  title,
  lead,
  children,
  track = 'light',
  className = '',
}: {
  id: string
  title: string
  lead?: React.ReactNode
  children: React.ReactNode
  track?: Track
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className={`py-10 md:py-14 ${className}`}>
      <span aria-hidden className="mb-5 block h-1 w-10 rounded-pill bg-pink" />
      <h2
        id={`h-${id}`}
        className={`font-display text-heading-xl md:text-display-sm ${track === 'night' ? 'text-white' : 'text-ink'}`}
      >
        {title}
      </h2>
      {lead && (
        <div className={`mt-3 max-w-[70ch] text-body-md ${track === 'night' ? 'text-shade-40' : 'text-shade-60'}`}>
          {lead}
        </div>
      )}
      <div className="mt-8">{children}</div>
    </section>
  )
}

export function Prose({ paragraphs, className = '' }: { paragraphs: string[]; className?: string }) {
  return (
    <div className={`max-w-[70ch] space-y-4 ${className}`}>
      {paragraphs.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </div>
  )
}

/** A figure with its label: large number, small caption. */
export function Stat({
  value,
  label,
  track = 'light',
  accent = false,
}: {
  value: React.ReactNode
  label: React.ReactNode
  track?: Track
  accent?: boolean
}) {
  const valueColour = track === 'night' ? (accent ? 'text-aqua' : 'text-white') : accent ? 'text-pink' : 'text-ink'
  return (
    <div>
      <dt className={`text-caption ${track === 'night' ? 'text-shade-40' : 'text-shade-60'}`}>{label}</dt>
      <dd className={`mt-1 font-display text-display-sm tabular-nums ${valueColour}`}>{value}</dd>
    </div>
  )
}

export function GradientStrip({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`h-1 w-full bg-brand-gradient ${className}`} />
}
