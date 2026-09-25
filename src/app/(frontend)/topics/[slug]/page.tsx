import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, Faq, Meter, VerdictBadge } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import { allTopics, getAspect, getCategory, getTopic, getTopicForPreview, isApp, productsIn } from '@/lib/catalog'
import { formatPct, formatRate, inSentence } from '@/lib/format'
import { aspectStat, countedReviews } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { RULES } from '@/lib/rules'
import { breadcrumbLd, faqLd, graph, itemListLd, pageMetadata, SITE } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return allTopics().map((t) => ({ slug: t.slug }))
}

/** Products in the section with enough mentions of the aspect to judge. Fewest problems first. */
const ranked = (silo: string, aspect: string) =>
  productsIn(silo)
    .map((p) => ({ product: p, stat: aspectStat(p, aspect) }))
    .filter((r) => r.stat?.scored)
    .sort((a, b) => a.stat!.problemRate - b.stat!.problemRate)

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const topic = getTopic((await params).slug)
  if (!topic) return {}
  return pageMetadata({
    title: topic.title,
    description: topic.explainer[0].slice(0, 155),
    path: routes.topic(topic.slug),
    // Nothing to rank yet: nothing worth indexing.
    noindex: ranked(topic.silo, topic.aspect).length === 0,
  })
}

export default async function TopicPage({ params }: { params: Params }) {
  await ensureCatalog()
  const { isEnabled: previewing } = await draftMode()
  const slug = (await params).slug
  const topic = previewing ? getTopicForPreview(slug) : getTopic(slug)
  if (!topic) notFound()

  const aspect = getAspect(topic.aspect)!
  const silo = getCategory(topic.silo)!
  const rows = ranked(silo.slug, aspect.slug)
  const reviewers = rows.reduce((n, r) => n + countedReviews(r.product).length, 0)
  const negative = rows.reduce((n, r) => n + r.stat!.negative, 0)
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: silo.name, path: routes.category(silo) },
    { name: topic.title, path: routes.topic(topic.slug) },
  ]

  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <article>
          <header className="border-b border-hairline pb-10">
            <p className="text-eyebrow uppercase text-shade-60">Guide · {aspect.label}</p>
            <h1 className="mt-3 max-w-[22ch] font-display text-display-sm md:text-display-lg">{topic.title}</h1>
            {/* The answer, computed: this sentence is built from counts, not written. */}
            {rows.length > 0 ? (
              <p className="answer mt-6 max-w-[62ch] text-body-lg">
                Across the {rows.length} products we track in {silo.name}, {formatPct(negative / (reviewers || 1))} of{' '}
                {reviewers.toLocaleString('en-IN')} reviewers report a problem with {inSentence(aspect.label)} — and it
                varies by product, from {formatRate(rows[0].stat!.problemRate)} to {formatRate(rows.at(-1)!.stat!.problemRate)}.
              </p>
            ) : (
              <p className="answer mt-6 max-w-[62ch] text-body-lg">
                We don&apos;t have enough reviews yet to compare products in {silo.name} on {inSentence(aspect.label)}.
              </p>
            )}
          </header>

          <Section id="explainer" title={`What causes ${inSentence(aspect.label)} problems?`}>
            <Prose paragraphs={topic.explainer} />
          </Section>

          {rows.length > 0 && (
            <Section
              id="ranking"
              title={`Which products do best on ${inSentence(aspect.label)}?`}
              lead="Ranked by problem rate: the share of all reviewers who report a problem with it. Fewest first."
            >
              <ol className="divide-y divide-hairline border-y border-hairline">
                {rows.map(({ product, stat }, i) => (
                  <li key={product.slug} className="grid items-center gap-4 py-5 md:grid-cols-[2rem_minmax(0,1fr)_minmax(0,16rem)_auto]">
                    <span className="font-display text-heading-xl text-pink tabular-nums">{i + 1}</span>
                    <div>
                      <Link href={`${routes.product(product.slug)}#aspect-${aspect.slug}`} className="text-body-strong underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                        {product.name}
                      </Link>
                      <p className="text-caption text-shade-60 tabular-nums">
                        {stat!.negative} of {countedReviews(product).length.toLocaleString('en-IN')} reviewers report a
                        problem
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-body-strong tabular-nums">{formatRate(stat!.problemRate)}</span>
                      <Meter value={stat!.problemRate / 0.4} tone={stat!.problemRate >= RULES.notableConProblemRate ? 'pink' : 'indigo'} />
                    </div>
                    <VerdictBadge verdict={product.verdict} app={isApp(product)} />
                  </li>
                ))}
              </ol>
            </Section>
          )}

          <Section id="faq" title={`Common questions about ${inSentence(aspect.label)}`}>
            <Faq items={topic.faq} />
          </Section>
        </article>
      </Container>
      <JsonLd
        data={graph(
          { '@type': 'Article', headline: topic.title, publisher: { '@id': `${SITE.url}/#organization` } },
          faqLd(topic.faq),
          ...(rows.length ? [itemListLd(rows.map((r) => ({ name: r.product.name, path: routes.product(r.product.slug) })))] : []),
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
