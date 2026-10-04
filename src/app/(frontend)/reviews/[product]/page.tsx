import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { RelatedLinks } from '@/components/RelatedLinks'
import { TagList } from '@/components/TagList'
import { MobileBuyBar, PriceTable, ProsCons, VerdictRationale } from '@/components/product'
import {
  AspectTable,
  Breadcrumbs,
  Faq,
  ProductCard,
  ProductMark,
  RatingPair,
  ScoreRing,
  SentimentBar,
  SovChart,
  VerdictBadge,
} from '@/components/review'
import { Icon, Stars } from '@/components/Icon'
import { ReviewList } from '@/components/ReviewList'
import { SectionTabs } from '@/components/SectionTabs'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import {
  allProducts,
  alternativesFor,
  bestOfListing,
  categoryComparisons,
  comparisonsFor,
  getAuthor,
  getBrand,
  getCategory,
  getProduct,
  getProductForPreview,
  isApp,
} from '@/lib/catalog'
import { formatDate, formatPct, formatRating, inSentence, isoDate } from '@/lib/format'
import {
  aspectStats,
  claimQuotes,
  confidence,
  countedReviews,
  marketplaceAverage,
  productSentiment,
  reviewsBySource,
  shareOfVoice,
  sourcesUsed,
  weightedRating,
} from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { RULES } from '@/lib/rules'
import { breadcrumbLd, faqLd, graph, ogImage, pageMetadata, productCrumbs, productReviewLd } from '@/lib/seo'
import { verdictLabel } from '@/lib/verdict'
import { notFoundOrRedirect } from '@/lib/not-found'
import { productTemplated } from '@/lib/seo-templates'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ product: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return allProducts().map((p) => ({ product: p.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const p = getProduct((await params).product)
  if (!p) return {}
  return pageMetadata({
    title: `${p.name} Review: ${verdictLabel(p.verdict, isApp(p))}`,
    description: p.answer.length > 158 ? `${p.answer.slice(0, 155).trimEnd()}…` : p.answer,
    path: routes.product(p.slug),
    seo: p.seo,
    templated: productTemplated(p),
    image: ogImage('product', p.slug, `${p.name} review`),
    // Thin-data products and unapproved drafts stay out of the index (docs/PLAN.md §7).
    noindex: p.verdict === 'thin-data' || Boolean(p.draft),
  })
}

export default async function ProductPage({ params }: { params: Params }) {
  await ensureCatalog()
  const { isEnabled: previewing } = await draftMode()
  const slug = (await params).product
  const product = previewing ? getProductForPreview(slug) : getProduct(slug)
  if (!product) notFoundOrRedirect(`/reviews/${slug}`)

  const category = getCategory(product.category)!
  const brand = getBrand(product.brand)!
  const author = getAuthor(product.author)
  const crumbs = productCrumbs(product)
  const counted = countedReviews(product)
  const used = sourcesUsed(product)
  const sov = shareOfVoice(product)
  const alternatives = alternativesFor(product)
  const pairs = comparisonsFor(product.slug)
  const lists = bestOfListing(product)
  const hasCategoryTable = categoryComparisons().includes(category)
  const stats = aspectStats(product)
  const app = isApp(product)
  // Ship the newest reviews plus every quoted one in the HTML; the rest load on demand.
  const quoted = new Set([...claimQuotes(product).values()].map((r) => r.id))
  // In preview (editors only) ship everything: drafts have no public reviews file yet.
  const initialReviews = previewing ? product.reviews : product.reviews.filter((r, i) => i < 60 || quoted.has(r.id))

  return (
    <PageShell track="light">
      <Container>
        <article>
          <Breadcrumbs crumbs={crumbs} />
          {product.draft && (
            <p role="note" className="mb-6 rounded-lg bg-peach px-5 py-4 text-caption">
              <strong className="text-body-strong">Draft, not yet approved.</strong> Collected {formatDate(product.updatedAt)}{' '}
              from {used.map((s) => s.name).join(', ')}. Every figure is computed from real reviews; the wording is an
              unreviewed draft, and no editor has signed it off.
            </p>
          )}

          <header className="grid gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <ProductMark product={product} size="md" />
                </div>
                <p className="text-eyebrow uppercase text-shade-60">
                  <Link href={routes.category(category)} className="hover:text-ink">
                    {category.name}
                  </Link>{' '}
                  ·{' '}
                  <Link href={routes.brand(brand.slug)} className="hover:text-ink">
                    {brand.name}
                  </Link>{' '}
                  · {product.variant}
                </p>
              </div>
              <h1 className="mt-6 font-display text-display-sm md:text-display-md lg:text-display-lg">
                {product.name} review
              </h1>
              <div className="mt-6">
                <VerdictBadge verdict={product.verdict} size="lg" app={app} />
              </div>
              {/* Answer first: the verdict in one extractable paragraph (≤320 chars). */}
              <p className="answer mt-5 max-w-[62ch] text-body-lg">{product.answer}</p>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-caption">
                <div className="flex items-start gap-2.5">
                  <Icon name="message" className="mt-0.5 size-4 text-pink" />
                  <div>
                    <dt className="text-shade-60">Based on</dt>
                    <dd className="tabular-nums">
                      {counted.length.toLocaleString('en-IN')} reviews across {used.length} sources
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Icon name="clock" className="mt-0.5 size-4 text-pink" />
                  <div>
                    <dt className="text-shade-60">Updated</dt>
                    <dd>
                      <time dateTime={isoDate(product.updatedAt)}>{formatDate(product.updatedAt)}</time>
                    </dd>
                  </div>
                </div>
                {product.draft ? (
                  <div className="flex items-start gap-2.5">
                    <Icon name="user" className="mt-0.5 size-4 text-pink" />
                    <div>
                      <dt className="text-shade-60">Status</dt>
                      <dd>Draft, awaiting approval</dd>
                    </div>
                  </div>
                ) : author && (
                  <div className="flex items-start gap-2.5">
                    <Icon name="user" className="mt-0.5 size-4 text-pink" />
                    <div>
                      <dt className="text-shade-60">Approved by</dt>
                      <dd>
                        <Link rel="author" href={routes.author(author.slug)} className="underline decoration-pink underline-offset-4">
                          {author.name}
                        </Link>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
              <TagList tags={product.tags} className="mt-6" />
            </div>

            {/* The scorecard: the numbers behind the verdict at a glance. */}
            <div className="rounded-xl bg-cream p-6 shadow-l3">
              <div className="flex items-center gap-5">
                <ScoreRing product={product} size="lg" />
                <div>
                  <p className="text-body-strong">Satisfaction score</p>
                  <p className="mt-1 text-caption text-shade-60">
                    <span className="capitalize">{confidence(product)}</span> confidence ·{' '}
                    {counted.length.toLocaleString('en-IN')} reviews
                  </p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white p-4">
                  <dt className="flex items-center gap-1.5 text-micro text-shade-60">
                    <Icon name="shield" className="size-3.5" />
                    Weighted
                  </dt>
                  <dd className="mt-1 font-display text-heading-xl tabular-nums">{formatRating(weightedRating(product))}</dd>
                  <dd className="text-indigo">
                    <Stars rating={weightedRating(product)} className="size-3.5" />
                  </dd>
                </div>
                <div className="rounded-lg bg-white p-4">
                  <dt className="text-micro text-shade-60">{app ? 'App stores' : 'Marketplaces'}</dt>
                  <dd className="mt-1 font-display text-heading-xl tabular-nums">{formatRating(marketplaceAverage(product).rating)}</dd>
                  <dd className="text-shade-50">
                    <Stars rating={marketplaceAverage(product).rating} className="size-3.5" />
                  </dd>
                </div>
              </dl>
              <a
                href="#verdict"
                className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-pill bg-indigo px-6 text-body-md text-white transition-colors hover:bg-shade-70"
              >
                Why we say “{verdictLabel(product.verdict, app)}”
                <Icon name="arrow-right" className="size-4 rotate-90" />
              </a>
            </div>
          </header>

          <SectionTabs
            items={[
              { id: 'verdict', label: 'Verdict' },
              { id: 'pros-cons', label: 'Pros & cons' },
              { id: 'aspects', label: 'Performance' },
              { id: 'voice', label: 'Share of voice' },
              ...(alternatives.length ? [{ id: 'alternatives', label: 'Alternatives' }] : []),
              { id: 'faq', label: 'FAQ' },
              { id: 'reviews', label: `Reviews (${product.reviews.length.toLocaleString('en-IN')})` },
            ]}
          />

          <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0">
              <Section id="verdict" title={app ? `Should you use ${product.name}?` : `Should you buy the ${product.name}?`}>
                <div className="max-w-[70ch] space-y-4">
                  {product.verdictBody.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                <div className="mt-8">
                  <RatingPair product={product} />
                </div>
                <div className="mt-6">
                  <VerdictRationale product={product} />
                </div>
                <p className="mt-4 text-caption text-shade-60">
                  Verdicts come from fixed rules applied to these numbers, then a named editor reads and
                  approves the wording.{' '}
                  <Link href={routes.methodology()} className="text-ink underline decoration-pink underline-offset-4">
                    How we score
                  </Link>
                </p>
              </Section>

              <Section
                id="pros-cons"
                title="What do reviewers consistently praise and criticise?"
                lead={`Every point below is backed by at least ${RULES.minEvidencePerClaim} reviews — follow the link to read them. Percentages are counted, not estimated.`}
              >
                <ProsCons product={product} />
              </Section>

              <Section id="aspects" title={`How does it perform on what matters for ${inSentence(category.name)}?`}>
                <AspectTable
                  stats={stats}
                  caption={`Counted from ${counted.length.toLocaleString('en-IN')} reviews. “Problems reported by” is the share of all reviewers who describe a problem with that aspect — the figure the verdict uses.`}
                />
              </Section>

              <Section
                id="voice"
                title="How much are people talking about it?"
                lead={`Share of voice is this product's share of all ratings and mentions across the ${sov.peers.length} products we track in ${category.name}: each store's own rating count, plus the Reddit and YouTube discussions we collected.`}
              >
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
                  <div>
                    <p className="font-display text-display-md text-pink tabular-nums">{formatPct(sov.share)}</p>
                    <p className="text-caption text-shade-60">
                      share of voice in {category.name} · {formatPct(sov.positiveShare)} of its positive voice
                    </p>
                    <div className="mt-6">
                      <SovChart rows={sov.peers} current={product} />
                    </div>
                    {hasCategoryTable && (
                      <Link href={routes.compare(category.slug)} className="mt-6 inline-block text-caption underline decoration-pink underline-offset-4">
                        Compare all {inSentence(category.name)} side by side
                      </Link>
                    )}
                  </div>
                  <div className="space-y-6">
                    <SentimentBar split={productSentiment(product)} label="Overall sentiment, all counted reviews" />
                    {reviewsBySource(product).map((row) => (
                      <SentimentBar key={row.source.id} split={row.sentiment} label={`${row.source.name} · ${row.count} reviews`} />
                    ))}
                  </div>
                </div>
              </Section>

              {alternatives.length > 0 && (
                <Section
                  id="alternatives"
                  title="What else should you consider?"
                  lead={`The closest-scoring alternatives in ${category.name}, measured on exactly the same aspects.`}
                >
                  <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {alternatives.map((alt) => (
                      <li key={alt.slug}>
                        <ProductCard product={alt} />
                      </li>
                    ))}
                  </ul>
                  {pairs.length > 0 && (
                    <ul className="mt-8 space-y-2">
                      {pairs.map((c) => {
                        const other = getProduct(c.products.find((s) => s !== product.slug)!)!
                        return (
                          <li key={c.slug}>
                            <Link href={routes.compare(c.slug)} className="text-body-strong underline decoration-pink underline-offset-4">
                              {product.shortName} vs {other.shortName}: head-to-head
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </Section>
              )}

              <RelatedLinks related={product.related} />

              <Section id="faq" title={`Questions about ${app ? '' : 'the '}${product.shortName}`}>
                <Faq items={product.faq} />
              </Section>

              <Section
                id="reviews"
                title="What are reviewers saying?"
                lead="Every review we collected, most recent first. Hindi and Hinglish reviews are shown as written, with the translation we analysed."
              >
                <ReviewList
                  reviews={initialReviews}
                  total={product.reviews.length}
                  allUrl={`${routes.product(product.slug)}/reviews.json`}
                  sources={used.map((s) => ({ id: s.id, name: s.name }))}
                  aspects={stats.map((s) => ({ slug: s.aspect.slug, label: s.aspect.label }))}
                  suspiciousBelow={RULES.suspiciousBelow}
                />
              </Section>
            </div>

            <aside className="pb-10 lg:pt-16">
              <div className="space-y-6 lg:sticky lg:top-36">
                <PriceTable product={product} category={category} />
                <div className="rounded-lg border border-hairline bg-white p-6">
                  <h2 className="text-heading-md">Key facts</h2>
                  <dl className="mt-4 space-y-3 text-caption">
                    {product.specs.map((s) => (
                      <div key={s.label} className="flex justify-between gap-4 border-b border-hairline pb-3 last:border-0 last:pb-0">
                        <dt className="text-shade-60">{s.label}</dt>
                        <dd className="text-right">{s.value}</dd>
                      </div>
                    ))}
                    <div className="flex justify-between gap-4 pt-0">
                      <dt className="text-shade-60">Confidence</dt>
                      <dd className="text-right capitalize">{confidence(product)}</dd>
                    </div>
                  </dl>
                </div>
                {lists.length > 0 && (
                  <div className="rounded-lg border border-hairline bg-white p-6">
                    <h2 className="text-heading-md">Ranked in</h2>
                    <ul className="mt-3 space-y-1 text-caption">
                      {lists.map(({ list, rank }) => (
                        <li key={list.slug}>
                          <Link
                            href={routes.best(list.slug)}
                            className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-cream"
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-cream font-display text-body-strong text-pink tabular-nums">
                              {rank}
                            </span>
                            {list.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <footer className="flex flex-wrap gap-x-6 gap-y-2 border-t border-hairline py-8 text-caption text-shade-60">
            <Link href={routes.methodology()} className="underline underline-offset-4 hover:text-ink">
              How we score
            </Link>
            <Link href={routes.sources()} className="underline underline-offset-4 hover:text-ink">
              Where our reviews come from
            </Link>
            <span>No affiliate links on this page.</span>
          </footer>
        </article>
      </Container>
      <MobileBuyBar product={product} />
      {/* Room for the bar, so it never covers the end of the footer. */}
      <div aria-hidden className="h-20 lg:hidden" />
      <JsonLd data={graph(productReviewLd(product), breadcrumbLd(crumbs), faqLd(product.faq))} />
    </PageShell>
  )
}
