import Link from 'next/link'
import React from 'react'

import { allBestOf, categoryComparisons, productsIn, listedChildren, listedSilos } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import type { Track } from '@/lib/types'

import { SearchForm } from './SearchForm'
import { Container, GradientStrip, PillLink } from './ui'
import { Wordmark } from './Wordmark'

// Header and footer. Each page picks one track (DESIGN.md: cinematic OR transactional, never
// both), and the chrome follows it.

const navLinks = () => [
  { href: routes.bestIndex(), label: 'Best lists' },
  { href: routes.compareIndex(), label: 'Compare' },
  { href: routes.methodology(), label: 'How we score' },
]

/**
 * "Categories" with a full-width panel of every section and its categories. Opens on hover and on
 * keyboard focus (CSS only); clicking or tapping the label goes to /categories. The panel is
 * positioned against the header, so it spans the full page width.
 */
function CategoriesMenu({ track }: { track: Track }) {
  const night = track === 'night'
  const link = night ? 'text-white hover:text-aqua' : 'text-ink hover:text-shade-60'
  const muted = night ? 'text-shade-40' : 'text-shade-60'
  return (
    <li className="group">
      {/* The ::after strip bridges the gap between the label and the panel so hover isn't lost. */}
      <Link
        href={routes.categories()}
        className={`relative inline-flex items-center gap-1.5 whitespace-nowrap text-body-md transition-colors after:absolute after:inset-x-0 after:top-full after:h-8 ${link}`}
      >
        Categories
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3 transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Link>
      <div
        role="region"
        aria-label="All categories"
        className="invisible absolute inset-x-0 top-full z-30 opacity-0 transition-[opacity,visibility] delay-150 duration-150 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:delay-0 group-hover:visible group-hover:opacity-100 group-hover:delay-0"
      >
        <div className={night ? 'bg-night-elevated shadow-l2' : 'border-t border-hairline bg-white shadow-l4'}>
          <Container className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-x-10 gap-y-8 py-10">
            {listedSilos().map((silo) => (
              <div key={silo.slug}>
                <Link href={routes.category(silo)} className={`text-heading-md ${link}`}>
                  {silo.name}
                </Link>
                <p className={`mt-1 text-caption ${muted}`}>{silo.tagline}</p>
                <ul className={`mt-4 space-y-1 border-t pt-3 ${night ? 'border-hairline-night' : 'border-hairline'}`}>
                  {listedChildren(silo.slug).map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={routes.category(c)}
                        className={`flex items-baseline justify-between gap-4 rounded-md py-1.5 text-body-md ${link}`}
                      >
                        <span>{c.name}</span>
                        <span className={`text-caption tabular-nums ${muted}`}>{productsIn(c.slug).length}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Container>
          <div className={`border-t ${night ? 'border-hairline-night' : 'border-hairline'}`}>
            <Container className="py-4">
              <Link
                href={routes.categories()}
                className={`text-caption underline underline-offset-4 ${night ? 'text-aqua' : 'text-ink decoration-pink'}`}
              >
                See all categories
              </Link>
            </Container>
          </div>
        </div>
      </div>
    </li>
  )
}

function SiteHeader({ track }: { track: Track }) {
  const night = track === 'night'
  const link = night ? 'text-white hover:text-aqua' : 'text-ink hover:text-shade-60'
  return (
    <header className={`relative z-30 ${night ? 'bg-night' : 'border-b border-hairline bg-white'}`}>
      <Container className="flex items-center justify-between gap-6 py-4">
        <Wordmark track={track} />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            <CategoriesMenu track={track} />
            {navLinks().map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`whitespace-nowrap text-body-md transition-colors ${link}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SearchForm track={track} className="hidden w-72 xl:flex" />
        <div className="hidden md:block xl:hidden">
          <PillLink href={routes.search()} variant={night ? 'outline-night' : 'primary'}>
            Search
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
            className={`absolute right-0 z-20 mt-2 max-h-[75vh] w-72 overflow-y-auto rounded-lg p-2 shadow-l4 ${night ? 'bg-night-elevated shadow-l2' : 'bg-white'}`}
          >
            <SearchForm track={track} className="p-2" />
            <p className={`px-4 pt-3 text-eyebrow uppercase ${night ? 'text-shade-40' : 'text-shade-60'}`}>Categories</p>
            <ul className={`border-b pb-2 ${night ? 'border-hairline-night' : 'border-hairline'}`}>
              {listedSilos().map((silo) => (
                <li key={silo.slug}>
                  <Link href={routes.category(silo)} className={`block rounded-md px-4 pt-3 pb-1 text-body-strong ${link}`}>
                    {silo.name}
                  </Link>
                  <ul>
                    {listedChildren(silo.slug).map((c) => (
                      <li key={c.slug}>
                        <Link href={routes.category(c)} className={`block rounded-md py-2 pr-4 pl-8 text-caption ${link}`}>
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <ul className="pt-2">
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
            links={listedSilos().flatMap((s) => [
              { href: routes.category(s), label: s.name },
              ...listedChildren(s.slug).map((c) => ({ href: routes.category(c), label: c.name })),
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
              ...categoryComparisons().map((c) => ({ href: routes.compare(c.slug), label: `${c.name} compared` })),
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
