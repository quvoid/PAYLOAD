import Link from 'next/link'
import React from 'react'

import type { Track } from '@/lib/types'

import { Icon, type IconName } from './Icon'

// Small primitives from DESIGN.md: container, pill buttons, tags, section headings, prose.

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-4 md:px-6 lg:px-8 ${className}`}>{children}</div>
}

const pillVariants = {
  primary: 'bg-indigo text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:bg-shade-70 active:bg-shade-70',
  'outline-light': 'border border-indigo bg-white text-indigo hover:bg-cream',
  'outline-night': 'border-2 border-white text-white hover:border-aqua hover:text-aqua',
  blush: 'bg-blush text-indigo hover:bg-peach',
  white: 'bg-white text-indigo hover:bg-peach',
}

/** The only button shape in the system is the pill (DESIGN.md → Buttons). */
export function PillLink({
  href,
  variant = 'primary',
  children,
  arrow = false,
  className = '',
}: {
  href: string
  variant?: keyof typeof pillVariants
  children: React.ReactNode
  /** A trailing arrow that nudges right on hover. */
  arrow?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group/pill inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-3 text-body-md transition-colors ${pillVariants[variant]} ${className}`}
    >
      {children}
      {arrow && <Icon name="arrow-right" className="size-4 transition-transform group-hover/pill:translate-x-0.5" />}
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

/** A quiet text link with a trailing arrow: "See all", "Compare side by side". */
export function ArrowLink({
  href,
  children,
  track = 'light',
  className = '',
}: {
  href: string
  children: React.ReactNode
  track?: Track
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`group/arrow inline-flex items-center gap-1.5 text-body-strong ${track === 'night' ? 'text-aqua' : 'text-ink hover:text-shade-60'} ${className}`}
    >
      <span className={`underline decoration-1 underline-offset-4 ${track === 'night' ? '' : 'decoration-pink'}`}>
        {children}
      </span>
      <Icon name="arrow-right" className="size-4 transition-transform group-hover/arrow:translate-x-0.5" />
    </Link>
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
  action,
  track = 'light',
  className = '',
}: {
  id: string
  title: string
  lead?: React.ReactNode
  children: React.ReactNode
  /** A "See all"-style link set on the right of the heading. */
  action?: { href: string; label: string }
  track?: Track
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className={`py-12 md:py-16 ${className}`}>
      <span aria-hidden className="mb-5 block h-1 w-10 rounded-pill bg-pink" />
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h2
          id={`h-${id}`}
          className={`max-w-[34ch] font-display text-heading-xl md:text-display-sm ${track === 'night' ? 'text-white' : 'text-ink'}`}
        >
          {title}
        </h2>
        {action && (
          <ArrowLink href={action.href} track={track} className="pb-1">
            {action.label}
          </ArrowLink>
        )}
      </div>
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

/**
 * A peach category tile: icon, title, one line, a count and an arrow. The whole tile is the link;
 * it lifts on hover (DESIGN.md → card-peach-band).
 */
export function CategoryTile({
  href,
  title,
  body,
  meta,
  icon = 'layers',
}: {
  href: string
  title: string
  body?: string
  meta: string
  icon?: IconName
}) {
  return (
    <div className="group card-lift relative flex h-full flex-col rounded-lg bg-peach p-7">
      <span className="flex size-11 items-center justify-center rounded-md bg-white text-pink shadow-l3">
        <Icon name={icon} className="size-5" />
      </span>
      <h3 className="mt-6 font-display text-heading-xl">
        <Link href={href} className="after:absolute after:inset-0 after:rounded-lg">
          {title}
        </Link>
      </h3>
      {body && <p className="mt-2 text-shade-60">{body}</p>}
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-caption">{meta}</span>
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-pill bg-white text-ink transition-colors group-hover:bg-indigo group-hover:text-white"
        >
          <Icon name="arrow-right" className="size-4" />
        </span>
      </div>
    </div>
  )
}
