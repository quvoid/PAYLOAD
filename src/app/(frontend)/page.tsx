import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductCard } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, GradientStrip, PillLink, Section, Stat } from '@/components/ui'
import {
  allBestOf,
  allProducts,
  allSources,
  childrenOf,
  getCategory,
  productsIn,
  recentlyUpdated,
  silos,
} from '@/lib/catalog'
import { formatCount } from '@/lib/format'
import { countedReviews, suspiciousCount } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { pageMetadata, SITE } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Every review, weighed — honest buying verdicts',
  description: SITE.description,
  path: routes.home(),
})

const steps = [
  {
    title: 'Collect everything',
    body: 'Marketplaces, brand stores, Reddit threads and YouTube reviews — every review we can find for one exact product.',
  },
  {
    title: 'Discount the fakes',
    body: 'Bursts of generic 5★ reviews and other manipulation signals are flagged and excluded from our counts. We show both averages.',
  },
  {
    title: 'Count, don’t guess',
    body: 'Every percentage is counted from reviews by code. No number on this site is written by an AI.',
  },
  {
    title: 'A person signs it off',
    body: 'Rules produce the verdict; a named editor reads it and approves it before anyone else sees it.',
  },
]

// A transactional page opened by one cinematic band: indigo nav + hero, ending at the brand
// gradient strip. Everything below is on the light track (DESIGN.md → Iteration Guide).
export default function HomePage() {
  const products = allProducts()
  const reviews = products.reduce((n, p) => n + countedReviews(p).length, 0)
  const flagged = products.reduce((n, p) => n + suspiciousCount(p), 0)

  return (
    <PageShell track="light" headerTrack="night">
      <section aria-labelledby="h-hero" className="track-night bg-night pb-20 pt-16 text-white md:pb-24 md:pt-20">
        <Container>
          <p className="text-eyebrow uppercase text-peach">Reviews from everywhere · one honest answer</p>
          <h1
            id="h-hero"
            className="mt-6 max-w-[14ch] font-display text-display-sm text-white md:text-display-xl wide:text-display-xxl"
          >
            Should you buy it? Every review, weighed.
          </h1>
          <p className="mt-8 max-w-[56ch] text-body-lg text-peach">
            We read every review of a product across Amazon, Flipkart, Reddit and YouTube, set aside the ones
            that look fake, count what people actually say — and give you a straight answer.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <PillLink href="#categories" variant="outline-night">
              Browse categories
            </PillLink>
            <Link href={routes.methodology()} className="text-body-md text-aqua underline underline-offset-4">
              How we score
            </Link>
          </div>
          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4">
            <Stat track="night" accent value={formatCount(products.length)} label="Products judged" />
            <Stat track="night" accent value={formatCount(reviews)} label="Reviews counted" />
            <Stat track="night" accent value={formatCount(flagged)} label="Flagged as likely fake" />
            <Stat track="night" accent value={allSources().length} label="Sources" />
          </dl>
        </Container>
      </section>
      <GradientStrip />

      <Container>
        <Section id="categories" title="What are you shopping for?">
          <ul className="grid gap-6 md:grid-cols-2">
            {silos().map((silo) => (
              <li key={silo.slug} className="relative rounded-lg bg-peach p-8">
                <h3 className="font-display text-heading-xl">
                  <Link href={routes.category(silo)} className="after:absolute after:inset-0 after:rounded-lg">
                    {silo.name}
                  </Link>
                </h3>
                <p className="mt-2">{silo.tagline}</p>
                <ul className="relative mt-6 flex flex-wrap gap-2">
                  {childrenOf(silo.slug).map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={routes.category(c)}
                        className="inline-flex min-h-11 items-center rounded-pill bg-white px-4 text-caption text-ink hover:bg-cream"
                      >
                        {c.name} · {productsIn(c.slug).length}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="latest" title="Latest verdicts">
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentlyUpdated(6).map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="lists" title="Ranked lists">
          <ul className="grid gap-4 md:grid-cols-3">
            {allBestOf().map((b) => (
              <li key={b.slug}>
                <Link
                  href={routes.best(b.slug)}
                  className="flex h-full flex-col justify-between gap-6 rounded-lg border border-hairline p-6 hover:border-indigo"
                >
                  <span>
                    <span className="text-eyebrow uppercase text-shade-60">{getCategory(b.category)!.name}</span>
                    <span className="mt-2 block text-heading-md">{b.title}</span>
                  </span>
                  <span className="text-caption underline decoration-pink underline-offset-4">See the ranking</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </Container>

      <section className="bg-peach">
        <Container>
          <Section id="how" title="How does a verdict get made?">
            <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="rounded-lg bg-white p-6 shadow-l3">
                  <span className="font-display text-display-sm text-pink tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 text-heading-md">{s.title}</h3>
                  <p className="mt-2 text-caption text-shade-60">{s.body}</p>
                </li>
              ))}
            </ol>
          </Section>
        </Container>
      </section>
    </PageShell>
  )
}
