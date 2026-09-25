import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, Faq, Meter, VerdictBadge } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import { allTopics, getAspect, getCategory, getTopic, productsIn } from '@/lib/catalog'
import { formatPct, formatScore } from '@/lib/format'
import { aspectStat } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { breadcrumbLd, faqLd, graph, itemListLd, pageMetadata, SITE } from '@/lib/seo'

type Params = Promise<{ slug: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return allTopics().map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const topic = getTopic((await params).slug)
  if (!topic) return {}
  return pageMetadata({ title: topic.title, description: topic.explainer[0].slice(0, 155), path: routes.topic(topic.slug) })
}

export default async function TopicPage({ params }: { params: Params }) {
  const topic = getTopic((await params).slug)
  if (!topic) notFound()

  const aspect = getAspect(topic.aspect)!
  const silo = getCategory(topic.silo)!
  const rows = productsIn(silo.slug)
    .map((p) => ({ product: p, stat: aspectStat(p, aspect.slug) }))
    .filter((r) => r.stat && r.stat.score !== null)
    .sort((a, b) => b.stat!.score! - a.stat!.score!)
  const mentions = rows.reduce((n, r) => n + r.stat!.mentions, 0)
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
            <p className="answer mt-6 max-w-[62ch] text-body-lg">
              Across the {rows.length} {silo.name.toLowerCase()} products we track, {formatPct(negative / (mentions || 1))} of
              the {mentions} reviews that mention {aspect.label.toLowerCase()} report a problem — and it varies a lot by
              product, from {formatPct(rows[0].stat!.negativeShare)} to {formatPct(rows.at(-1)!.stat!.negativeShare)}.
            </p>
          </header>

          <Section id="explainer" title={`What causes ${aspect.label.toLowerCase()} problems?`}>
            <Prose paragraphs={topic.explainer} />
          </Section>

          <Section
            id="ranking"
            title={`Which products do best on ${aspect.label.toLowerCase()}?`}
            lead="Ranked by aspect score: the share of mentions that are positive, with neutral counted as half."
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
                      {formatPct(stat!.negativeShare)} of {stat!.mentions} mentions report a problem
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-body-strong tabular-nums">{formatScore(stat!.score!)}</span>
                    <Meter value={stat!.score! / 10} tone={i === 0 ? 'pink' : 'indigo'} />
                  </div>
                  <VerdictBadge verdict={product.verdict} />
                </li>
              ))}
            </ol>
          </Section>

          <Section id="faq" title={`Common questions about ${aspect.label.toLowerCase()}`}>
            <Faq items={topic.faq} />
          </Section>
        </article>
      </Container>
      <JsonLd
        data={graph(
          { '@type': 'Article', headline: topic.title, publisher: { '@id': `${SITE.url}/#organization` } },
          faqLd(topic.faq),
          itemListLd(rows.map((r) => ({ name: r.product.name, path: routes.product(r.product.slug) }))),
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
