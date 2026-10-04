import type { Metadata } from 'next'
import Link from 'next/link'

import { Icon, siloIcon, type IconName } from '@/components/Icon'
import { JsonLd } from '@/components/JsonLd'
import { ProductCard, ProductMark, ScoreRing, VerdictBadge } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { SearchForm } from '@/components/SearchForm'
import { ArrowLink, Container, GradientStrip, PillLink, Section } from '@/components/ui'
import {
  allBestOf,
  allProducts,
  allSources,
  getBrand,
  getCategory,
  isApp,
  listedChildren,
  listedSilos,
  productsIn,
  recentlyUpdated,
} from '@/lib/catalog'
import { formatCount, formatPct } from '@/lib/format'
import { compositeScore, countedReviews, productSentiment, sourcesUsed, suspiciousCount } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { fixedPageMetadata, graph, SITE } from '@/lib/seo'
import { ensureCatalog, settings } from '@/lib/store'
import type { Product } from '@/lib/types'

export async function generateMetadata(): Promise<Metadata> {
  await ensureCatalog()
  return fixedPageMetadata('home', routes.home())
}

// Hero copy and the "how it works" steps are edited in the admin: Settings → Site settings.

const stepIcons: IconName[] = ['layers', 'flag', 'list', 'user']

/**
 * The hero's right column: one real verdict broken into tiles, so the first screen shows what a
 * ReviewLens answer looks like rather than describing it. Night track: elevated indigo cards,
 * aqua for the key figures, no drop shadows beyond the inset sheen.
 */
function VerdictShowcase({ product, flagged }: { product: Product; flagged: number }) {
  const split = productSentiment(product)
  const used = sourcesUsed(product)
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link
        href={routes.product(product.slug)}
        className="group col-span-2 rounded-xl bg-night-elevated p-6 shadow-l1 transition-colors hover:bg-night-deep"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <ProductMark product={product} track="night" size="sm" />
            <div className="min-w-0">
              <p className="truncate text-eyebrow uppercase text-peach">
                {getBrand(product.brand)!.name} · {getCategory(product.category)!.name}
              </p>
              <p className="mt-1 text-heading-md text-white">{product.name}</p>
              <div className="mt-3">
                <VerdictBadge verdict={product.verdict} track="night" app={isApp(product)} />
              </div>
            </div>
          </div>
          <ScoreRing product={product} track="night" size="md" />
        </div>
        <p className="mt-5 line-clamp-2 text-caption text-shade-40">{product.answer}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-caption text-aqua">
          Read the verdict
          <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      <div className="rounded-xl bg-night-elevated p-5 shadow-l1">
        <p className="text-caption text-shade-40">Reviewers positive</p>
        <p className="mt-1 font-display text-display-sm text-aqua tabular-nums">{formatPct(split.positive)}</p>
        <div aria-hidden className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-pill">
          <div className="rounded-l-pill bg-aqua" style={{ width: `${split.positive * 100}%` }} />
          <div className="bg-shade-60" style={{ width: `${split.neutral * 100}%` }} />
          <div className="rounded-r-pill bg-pink" style={{ width: `${split.negative * 100}%` }} />
        </div>
        <p className="mt-3 text-micro text-shade-40 tabular-nums">
          {formatCount(countedReviews(product).length)} reviews counted
        </p>
      </div>

      <div className="rounded-xl bg-night-elevated p-5 shadow-l1">
        <p className="flex items-center gap-2 text-caption text-shade-40">
          <Icon name="flag" className="size-4 text-pink" />
          Set aside
        </p>
        <p className="mt-1 font-display text-display-sm text-white tabular-nums">{formatCount(flagged)}</p>
        <p className="mt-3 text-micro text-shade-40">reviews flagged as likely fake across the site</p>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2 rounded-xl border border-hairline-night p-4">
        <span className="mr-1 text-micro text-shade-40">Read from</span>
        {used.map((s) => (
          <span key={s.id} className="rounded-pill border border-hairline-night px-3 py-1 text-micro text-peach">
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// A transactional page opened by one cinematic band: indigo nav + hero, ending at the brand
// gradient strip. Everything below is on the light track (DESIGN.md → Iteration Guide).
export default async function HomePage() {
  await ensureCatalog()
  const products = allProducts()
  const reviews = products.reduce((n, p) => n + countedReviews(p).length, 0)
  const flagged = products.reduce((n, p) => n + suspiciousCount(p), 0)
  // The showcase uses the best-scoring product with a clear verdict, so it always shows a full answer.
  const featured = [...products]
    .filter((p) => p.verdict === 'buy' || p.verdict === 'buy-with-caveats')
    .sort((a, b) => compositeScore(b) - compositeScore(a))[0]

  return (
    <PageShell track="light" headerTrack="night">
      <section aria-labelledby="h-hero" className="track-night relative overflow-hidden bg-night text-white">
        <div aria-hidden className="bg-night-grid absolute inset-0" />
        <Container className="relative grid items-center gap-14 pt-14 pb-20 md:pt-20 md:pb-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-pill border border-hairline-night px-3 py-1.5 text-eyebrow uppercase text-peach">
              <span aria-hidden className="size-1.5 rounded-pill bg-aqua" />
              {settings.heroEyebrow}
            </p>
            <h1
              id="h-hero"
              className="mt-6 max-w-[15ch] font-display text-display-md text-white md:text-display-xl lg:text-display-lg xl:text-display-xl"
            >
              {settings.heroTitle}
            </h1>
            {settings.heroText && <p className="mt-8 max-w-[52ch] text-body-lg text-peach">{settings.heroText}</p>}
            <SearchForm track="night" size="lg" className="mt-10 max-w-2xl" />
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <PillLink href="#categories" variant="outline-night">
                Browse categories
              </PillLink>
              <ArrowLink href={routes.methodology()} track="night">
                How we score
              </ArrowLink>
            </div>
            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-y-6 sm:grid-cols-4">
              {[
                { label: 'Products judged', value: formatCount(products.length) },
                { label: 'Reviews read', value: formatCount(reviews) },
                { label: 'Likely fakes', value: formatCount(flagged) },
                { label: 'Sources', value: allSources().length },
              ].map((s, i) => (
                <div key={s.label} className={`pr-4 ${i ? 'sm:border-l sm:border-hairline-night sm:pl-5' : ''}`}>
                  <dt className="whitespace-nowrap text-caption text-shade-40">{s.label}</dt>
                  <dd className="mt-1 font-display text-heading-xl text-aqua tabular-nums md:text-display-sm">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {featured && <VerdictShowcase product={featured} flagged={flagged} />}
        </Container>
      </section>
      <GradientStrip />

      <Container>
        <Section
          id="categories"
          title="What are you shopping for?"
          action={{ href: routes.categories(), label: 'All categories' }}
        >
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {listedSilos().map((silo) => {
              const children = listedChildren(silo.slug)
              const count = children.reduce((n, c) => n + productsIn(c.slug).length, 0)
              return (
                <li key={silo.slug} className="group card-lift relative flex flex-col rounded-lg bg-peach p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-12 items-center justify-center rounded-md bg-white text-pink shadow-l3">
                      <Icon name={siloIcon(silo.slug)} className="size-6" />
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-display-sm leading-none tabular-nums">{count}</span>
                      <span className="text-micro text-shade-60">products</span>
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-heading-xl">
                    <Link href={routes.category(silo)} className="after:absolute after:inset-0 after:rounded-lg">
                      {silo.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-shade-60">{silo.tagline}</p>
                  <ul className="relative mt-6 flex flex-wrap gap-2">
                    {children.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={routes.category(c)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-white px-4 text-caption text-ink transition-colors hover:bg-indigo hover:text-white"
                        >
                          {c.name}
                          <span className="tabular-nums opacity-60">{productsIn(c.slug).length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </Section>

        <Section id="latest" title="Latest verdicts" action={{ href: routes.bestIndex(), label: 'See ranked lists' }}>
          <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {recentlyUpdated(6).map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="lists" title="Ranked lists" action={{ href: routes.bestIndex(), label: 'All lists' }}>
          <ol className="grid gap-x-10 md:grid-cols-2">
            {allBestOf().map((b, i) => (
              <li key={b.slug} className="border-t border-hairline">
                <Link
                  href={routes.best(b.slug)}
                  className="group -mx-3 flex items-center gap-5 rounded-lg px-3 py-5 transition-colors hover:bg-cream"
                >
                  <span className="w-8 font-display text-heading-xl text-pink tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-eyebrow uppercase text-shade-60">{getCategory(b.category)!.name}</span>
                    <span className="mt-1 block text-heading-sm">{b.title}</span>
                  </span>
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-pill border border-hairline transition-colors group-hover:border-indigo group-hover:bg-indigo group-hover:text-white"
                  >
                    <Icon name="arrow-right" className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Section>
      </Container>

      {settings.steps.length > 0 && (
        <section className="bg-peach">
          <Container>
            <Section id="how" title="How does a verdict get made?" action={{ href: routes.methodology(), label: 'Full methodology' }}>
              <ol className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {/* The line joining the steps, drawn behind the number badges on wide screens. */}
                <span aria-hidden className="absolute top-12 right-[12%] left-[12%] hidden h-px bg-shade-40 xl:block" />
                {settings.steps.map((s, i) => (
                  <li key={s.title} className="relative rounded-lg bg-white p-6 shadow-l3">
                    <div className="flex items-center justify-between">
                      <span className="flex size-12 items-center justify-center rounded-pill bg-indigo text-white">
                        <Icon name={stepIcons[i % stepIcons.length]} className="size-5" />
                      </span>
                      <span className="font-display text-heading-xl text-pink tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="mt-6 text-heading-md">{s.title}</h3>
                    <p className="mt-2 text-caption text-shade-60">{s.body}</p>
                  </li>
                ))}
              </ol>
            </Section>
          </Container>
        </section>
      )}
      <JsonLd data={graph({ '@type': 'WebPage', url: `${SITE.url}/`, name: settings.heroTitle, about: { '@id': `${SITE.url}/#organization` } })} />
    </PageShell>
  )
}
