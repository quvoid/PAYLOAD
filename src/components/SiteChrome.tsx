import Link from 'next/link'
import React from 'react'

import { allBestOf, categoryComparisons, listedChildren, listedSilos, productsIn, siteNavigation } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import type { NavLink, Track } from '@/lib/types'

import { Icon, siloIcon } from './Icon'
import { SearchForm } from './SearchForm'
import { ArrowLink, Container, GradientStrip, PillLink } from './ui'
import { Wordmark } from './Wordmark'

// Header and footer. Each page picks one track (DESIGN.md: cinematic OR transactional, never
// both), and the chrome follows it.

const defaultNavLinks: NavLink[] = [
  { href: routes.bestIndex(), label: 'Best lists' },
  { href: routes.compareIndex(), label: 'Compare' },
  { href: routes.methodology(), label: 'How we score' },
]

/** Menu links from Website → Navigation in the admin, or the standard ones if none are set. */
const navLinks = () => (siteNavigation().header.length ? siteNavigation().header : defaultNavLinks)

/** An internal path goes through next/link; a full address opens as a plain link. */
function NavAnchor({ link, className, children }: { link: NavLink; className: string; children: React.ReactNode }) {
  if (/^(https?:|mailto:|tel:)/.test(link.href)) {
    return (
      <a href={link.href} className={className} {...(link.newTab && { target: '_blank', rel: 'noopener noreferrer' })}>
        {children}
      </a>
    )
  }
  return (
    <Link href={link.href} className={className} {...(link.newTab && { target: '_blank' })}>
      {children}
    </Link>
  )
}

/**
 * "Categories" with a full-width panel of every section and its categories. Opens on hover and on
 * keyboard focus (CSS only); clicking or tapping the label goes to /categories. The panel is
 * positioned against the header, so it spans the full page width.
 */
function CategoriesMenu({ track }: { track: Track }) {
  const night = track === 'night'
  const link = night ? 'text-white hover:text-aqua' : 'text-ink hover:text-shade-60'
  const muted = night ? 'text-shade-40' : 'text-shade-60'
  const tile = night ? 'bg-night-deep text-aqua' : 'bg-peach text-indigo'
  return (
    <li className="group">
      {/* The ::after strip bridges the gap between the label and the panel so hover isn't lost. */}
      <Link
        href={routes.categories()}
        className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-3 py-2 text-body-md transition-colors after:absolute after:inset-x-0 after:top-full after:h-6 ${night ? 'text-white hover:bg-night-elevated' : 'text-ink hover:bg-cream'}`}
      >
        Categories
        <Icon name="chevron" className="size-3.5 transition-transform group-focus-within:rotate-180 group-hover:rotate-180" />
      </Link>
      <div
        role="region"
        aria-label="All categories"
        className="invisible absolute inset-x-0 top-full z-30 -translate-y-1 opacity-0 transition-[opacity,visibility,translate] delay-150 duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-focus-within:delay-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-0"
      >
        <div className={night ? 'bg-night-elevated shadow-l2' : 'border-t border-hairline bg-white shadow-l4'}>
          <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-x-10 gap-y-8">
              {listedSilos().map((silo) => (
                <div key={silo.slug}>
                  <Link href={routes.category(silo)} className={`group/silo flex items-start gap-3 ${link}`}>
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tile}`}>
                      <Icon name={siloIcon(silo.slug)} className="size-5" />
                    </span>
                    <span>
                      <span className="block text-heading-sm">{silo.name}</span>
                      <span className={`mt-0.5 block text-caption ${muted}`}>{silo.tagline}</span>
                    </span>
                  </Link>
                  <ul className={`mt-4 space-y-0.5 border-t pt-3 ${night ? 'border-hairline-night' : 'border-hairline'}`}>
                    {listedChildren(silo.slug).map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={routes.category(c)}
                          className={`-mx-2 flex items-baseline justify-between gap-4 rounded-md px-2 py-1.5 text-body-md transition-colors ${night ? 'text-white hover:bg-night-deep hover:text-aqua' : 'text-ink hover:bg-cream'}`}
                        >
                          <span>{c.name}</span>
                          <span className={`text-caption tabular-nums ${muted}`}>{productsIn(c.slug).length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className={`flex flex-col justify-between gap-6 rounded-lg p-6 ${night ? 'bg-night-deep' : 'bg-cream'}`}>
              <div>
                <Icon name="scale" className={`size-6 ${night ? 'text-aqua' : 'text-pink'}`} />
                <p className={`mt-4 text-heading-sm ${night ? 'text-white' : 'text-ink'}`}>Counted, not guessed</p>
                <p className={`mt-2 text-caption ${muted}`}>
                  Every figure comes from reviews, with the likely fakes set aside. See exactly how a verdict is made.
                </p>
              </div>
              <ArrowLink href={routes.methodology()} track={track}>
                How we score
              </ArrowLink>
            </div>
          </Container>
          <div className={`border-t ${night ? 'border-hairline-night' : 'border-hairline'}`}>
            <Container className="py-4">
              <ArrowLink href={routes.categories()} track={track} className="text-caption">
                See all categories
              </ArrowLink>
            </Container>
          </div>
        </div>
      </div>
    </li>
  )
}

function SiteHeader({ track, sticky }: { track: Track; sticky: boolean }) {
  const night = track === 'night'
  const link = night ? 'text-white hover:text-aqua' : 'text-ink hover:text-shade-60'
  const navItem = night ? 'text-white hover:bg-night-elevated' : 'text-ink hover:bg-cream'
  const surface = night
    ? sticky
      ? 'bg-night/90 backdrop-blur-lg backdrop-saturate-150'
      : 'bg-night'
    : 'border-b border-hairline bg-white/85 backdrop-blur-lg backdrop-saturate-150'
  return (
    <header className={`relative z-30 ${surface}`}>
      <Container className="flex min-h-18 items-center justify-between gap-6 py-3">
        <Wordmark track={track} />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            <CategoriesMenu track={track} />
            {navLinks().map((l) => (
              <li key={l.href}>
                <NavAnchor link={l} className={`whitespace-nowrap rounded-pill px-3 py-2 text-body-md transition-colors ${navItem}`}>
                  {l.label}
                </NavAnchor>
              </li>
            ))}
          </ul>
        </nav>
        <SearchForm track={track} shortcut className="hidden w-[22rem] xl:flex" />
        <div className="hidden md:block xl:hidden">
          <PillLink href={routes.search()} variant={night ? 'outline-night' : 'primary'}>
            <Icon name="search" className="size-4" />
            Search
          </PillLink>
        </div>
        {/* Below 768px the nav collapses into a disclosure — no JS needed. */}
        <details className="group md:hidden">
          <summary
            className={`flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-pill px-4 [&::-webkit-details-marker]:hidden ${night ? 'border-2 border-white text-white' : 'border border-indigo text-ink'}`}
          >
            <Icon name="menu" className="size-4 group-open:hidden" />
            <Icon name="x" className="hidden size-4 group-open:block" />
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Close</span>
          </summary>
          <nav
            aria-label="Primary"
            className={`absolute inset-x-0 top-full z-20 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t px-4 pt-4 pb-8 shadow-l4 ${night ? 'border-hairline-night bg-night-elevated' : 'border-hairline bg-white'}`}
          >
            <SearchForm track={track} />
            <p className={`mt-6 text-eyebrow uppercase ${night ? 'text-shade-40' : 'text-shade-60'}`}>Categories</p>
            <ul className="mt-3 grid gap-3">
              {listedSilos().map((silo) => (
                <li key={silo.slug} className={`rounded-lg p-4 ${night ? 'bg-night-deep' : 'bg-cream'}`}>
                  <Link href={routes.category(silo)} className={`flex items-center gap-3 text-body-strong ${link}`}>
                    <Icon name={siloIcon(silo.slug)} className={`size-5 ${night ? 'text-aqua' : 'text-pink'}`} />
                    {silo.name}
                  </Link>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {listedChildren(silo.slug).map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={routes.category(c)}
                          className={`inline-flex min-h-10 items-center rounded-pill px-4 text-caption ${night ? 'border border-hairline-night text-white' : 'bg-white text-ink shadow-l3'}`}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <ul className={`mt-4 divide-y ${night ? 'divide-hairline-night' : 'divide-hairline'}`}>
              {navLinks().map((l) => (
                <li key={l.href}>
                  <NavAnchor link={l} className={`flex items-center justify-between py-4 text-body-strong ${link}`}>
                    {l.label}
                    <Icon name="arrow-right" className="size-4" />
                  </NavAnchor>
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
  links: NavLink[]
  night: boolean
}) {
  return (
    <div>
      <h2 className={`text-eyebrow uppercase ${night ? 'text-shade-40' : 'text-shade-60'}`}>{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <NavAnchor
              link={l}
              className={`text-caption decoration-1 underline-offset-4 transition-colors hover:underline ${night ? 'text-peach hover:text-aqua' : 'text-ink hover:decoration-pink'}`}
            >
              {l.label}
            </NavAnchor>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SiteFooter({ track }: { track: Track }) {
  const night = track === 'night'
  const nav = siteNavigation()
  const extraColumns = nav.footerColumns.length
    ? nav.footerColumns
    : [
        {
          title: 'Trust',
          links: [
            { href: routes.methodology(), label: 'How we score' },
            { href: routes.sources(), label: 'Where our reviews come from' },
          ],
        },
      ]
  return (
    <footer className={night ? 'bg-night text-white' : 'border-t border-hairline bg-cream text-ink'}>
      <GradientStrip />
      <Container className="py-16">
        <div
          className={`mb-14 flex flex-col gap-6 border-b pb-12 md:flex-row md:items-end md:justify-between ${night ? 'border-hairline-night' : 'border-hairline'}`}
        >
          <div>
            <Wordmark track={track} />
            <p className={`mt-5 max-w-[40ch] font-display text-heading-lg md:text-heading-xl ${night ? 'text-white' : 'text-ink'}`}>
              {nav.footerAbout ||
                'Every review, weighed. Numbers are counted by code; every verdict is approved by a named editor.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PillLink href={routes.search()} variant={night ? 'outline-night' : 'primary'}>
              <Icon name="search" className="size-4" />
              Find a product
            </PillLink>
            <PillLink href={routes.methodology()} variant={night ? 'outline-night' : 'outline-light'} arrow>
              How we score
            </PillLink>
          </div>
        </div>
        <div className={`grid gap-10 sm:grid-cols-2 ${extraColumns.length > 1 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
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
          {extraColumns.map((c) => (
            <FooterColumn key={c.title} night={night} title={c.title} links={c.links} />
          ))}
        </div>
        <div
          className={`mt-14 flex flex-col gap-2 border-t pt-6 text-micro sm:flex-row sm:justify-between ${night ? 'border-hairline-night text-shade-40' : 'border-hairline text-shade-60'}`}
        >
          <p>
            © {new Date().getFullYear()} ReviewLens.{' '}
            {nav.footerNote || "We don't earn affiliate commission. If that changes, every affected page will say so."}
          </p>
          <p>{nav.footerRight || 'Review excerpts are short and link to the original.'}</p>
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
      {/* The header sticks on single-track pages. A cinematic header over a light page scrolls
          away with its hero, so an indigo bar never sits over the transactional track. */}
      <div className={`${headerTrack === 'night' ? 'track-night' : ''} ${headerTrack === track ? 'sticky top-0 z-30' : 'relative z-30'}`}>
        <SiteHeader track={headerTrack} sticky={headerTrack === track} />
      </div>
      <main id="main">{children}</main>
      <SiteFooter track={track} />
    </div>
  )
}
