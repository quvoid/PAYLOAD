import Link from 'next/link'
import React from 'react'

import { allBestOf, categoryComparisons, childrenOf, silos } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import type { Track } from '@/lib/types'

import { Container, GradientStrip, PillLink } from './ui'
import { Wordmark } from './Wordmark'

// Header and footer. Each page picks one track (DESIGN.md: cinematic OR transactional, never
// both), and the chrome follows it.

const navLinks = () => [
  ...silos().map((s) => ({ href: routes.category(s), label: s.name.split(' & ')[0] })),
  { href: routes.bestIndex(), label: 'Best lists' },
  { href: routes.compareIndex(), label: 'Compare' },
  { href: routes.methodology(), label: 'How we score' },
]

function SiteHeader({ track }: { track: Track }) {
  const night = track === 'night'
  const link = night ? 'text-white hover:text-aqua' : 'text-ink hover:text-shade-60'
  return (
    <header className={night ? 'bg-night' : 'border-b border-hairline bg-white'}>
      <Container className="flex items-center justify-between gap-6 py-4">
        <Wordmark track={track} />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {navLinks().map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`text-body-md transition-colors ${link}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden md:block">
          <PillLink href={routes.category(silos()[0])} variant={night ? 'outline-night' : 'primary'}>
            Browse reviews
          </PillLink>
        </div>
        {/* Below 768px the nav collapses into a disclosure — no JS needed. */}
        <details className="group relative md:hidden">
          <summary
            className={`flex min-h-11 cursor-pointer list-none items-center rounded-pill px-5 ${night ? 'border-2 border-white text-white' : 'border border-indigo text-ink'}`}
          >
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Close</span>
          </summary>
          <nav
            aria-label="Primary"
            className={`absolute right-0 z-20 mt-2 w-60 rounded-lg p-2 shadow-l4 ${night ? 'bg-night-elevated shadow-l2' : 'bg-white'}`}
          >
            <ul>
              {navLinks().map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`block rounded-md px-4 py-3 ${link}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      </Container>
    </header>
  )
}

function FooterColumn({
  title,
  links,
  night,
}: {
  title: string
  links: { href: string; label: string }[]
  night: boolean
}) {
  return (
    <div>
      <h2 className={`text-eyebrow uppercase ${night ? 'text-shade-40' : 'text-shade-60'}`}>{title}</h2>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`text-caption underline decoration-1 underline-offset-4 ${night ? 'text-peach hover:text-aqua' : 'text-ink decoration-shade-40 hover:decoration-pink'}`}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SiteFooter({ track }: { track: Track }) {
  const night = track === 'night'
  return (
    <footer className={night ? 'bg-night text-white' : 'border-t border-hairline bg-cream text-ink'}>
      <GradientStrip />
      <Container className="py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Wordmark track={track} />
            <p className={`mt-4 max-w-[36ch] text-caption ${night ? 'text-shade-40' : 'text-shade-60'}`}>
              Every review, weighed. Numbers are counted by code; every verdict is approved by a
              named editor.
            </p>
          </div>
          <FooterColumn
            night={night}
            title="Categories"
            links={silos().flatMap((s) => [
              { href: routes.category(s), label: s.name },
              ...childrenOf(s.slug).map((c) => ({ href: routes.category(c), label: c.name })),
            ])}
          />
          <FooterColumn
            night={night}
            title="Ranked lists"
            links={allBestOf().map((b) => ({ href: routes.best(b.slug), label: b.title }))}
          />
          <FooterColumn
            night={night}
            title="Compare"
            links={[
              ...categoryComparisons().map((c) => ({ href: routes.compare(c.slug), label: `Every ${c.name.toLowerCase()} compared` })),
              { href: routes.compareIndex(), label: 'All comparisons' },
            ]}
          />
          <FooterColumn
            night={night}
            title="Trust"
            links={[
              { href: routes.methodology(), label: 'How we score' },
              { href: routes.sources(), label: 'Where our reviews come from' },
            ]}
          />
        </div>
        <div
          className={`mt-14 flex flex-col gap-2 border-t pt-6 text-micro sm:flex-row sm:justify-between ${night ? 'border-hairline-night text-shade-40' : 'border-hairline text-shade-60'}`}
        >
          <p>© 2026 ReviewLens. We don&apos;t earn affiliate commission. If that changes, every affected page will say so.</p>
          <p>Review excerpts are short and link to the original.</p>
        </div>
      </Container>
    </footer>
  )
}

/**
 * `headerTrack` lets a light page open with a cinematic night band (header + hero). Below that
 * band the page stays on one track (DESIGN.md → Iteration Guide).
 */
export function PageShell({
  track,
  headerTrack = track,
  children,
}: {
  track: Track
  headerTrack?: Track
  children: React.ReactNode
}) {
  return (
    <div className={track === 'night' ? 'track-night bg-night text-white' : 'track-light bg-white text-ink'}>
      <div className={headerTrack === 'night' ? 'track-night' : undefined}>
        <SiteHeader track={headerTrack} />
      </div>
      <main id="main">{children}</main>
      <SiteFooter track={track} />
    </div>
  )
}
