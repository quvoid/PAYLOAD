import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, Faq, ProductCard } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import { allBestOf, getAspect, getBestOf, getBestOfForPreview, getCategory, rankBestOf } from '@/lib/catalog'
import { formatINR, formatRate, formatScore, inSentence } from '@/lib/format'
import { aspectStat, compositeScore, lowestOffer } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { breadcrumbLd, categoryCrumbs, faqLd, graph, itemListLd, pageMetadata } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return allBestOf().map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const list = getBestOf((await params).slug)
  if (!list) return {}
  return pageMetadata({ title: list.title, description: list.intro[0].slice(0, 155), path: routes.best(list.slug) })
}

export default async function BestOfPage({ params }: { params: Params }) {
  await ensureCatalog()
  const { isEnabled: previewing } = await draftMode()
  const slug = (await params).slug
  const list = previewing ? getBestOfForPreview(slug) : getBestOf(slug)
  if (!list) notFound()

  const ranked = rankBestOf(list)
  const category = getCategory(list.category)!
  const aspect = list.rule.aspect ? getAspect(list.rule.aspect) : undefined
  const crumbs = [...categoryCrumbs(category.slug), { name: list.title, path: routes.best(list.slug) }]

  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <p className="text-eyebrow uppercase text-shade-60">Ranked list · {category.name}</p>
          <h1 className="mt-3 font-display text-display-sm md:text-display-lg">{list.title}</h1>
          <Prose paragraphs={list.intro} className="mt-6" />
          <p className="mt-6 inline-flex rounded-pill bg-shade-30 px-4 py-2 text-caption">
            Ranked by {aspect ? `fewest ${inSentence(aspect.label)} problems` : 'satisfaction score'}
            {list.rule.maxPrice ? ` · lowest price under ${formatINR(list.rule.maxPrice)}` : ''} · recalculated
            whenever reviews or prices change
          </p>
        </header>

        <Section id="ranking" title={`Which is the ${list.title.replace(/^Best /, 'best ')}?`}>
          {ranked.length === 0 ? (
            <p className="text-shade-60">No product currently qualifies for this list.</p>
          ) : (
            <ol className="space-y-6">
              {ranked.map((p, i) => {
                const stat = aspect ? aspectStat(p, aspect.slug) : undefined
                return (
                  <li key={p.slug} id={`rank-${i + 1}`} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
                    <ProductCard product={p} rank={i + 1} />
                    <p className="text-caption text-shade-60 tabular-nums">
                      {stat && stat.scored
                        ? `${aspect!.label}: problems reported by ${formatRate(stat.problemRate)} of reviewers.`
                        : `Satisfaction score ${formatScore(compositeScore(p))} / 10.`}{' '}
                      {lowestOffer(p)!.price === 0 ? 'Free to download.' : `Lowest price ${formatINR(lowestOffer(p)!.price)}.`}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
          <p className="mt-8 text-caption text-shade-60">
            Products marked Skip or Not enough data are never ranked.{' '}
            <Link href={routes.methodology()} className="text-ink underline decoration-pink underline-offset-4">
              How we score
            </Link>
          </p>
        </Section>

        <Section id="faq" title="Questions about this list">
          <Faq items={list.faq} />
        </Section>
      </Container>
      <JsonLd
        data={graph(
          itemListLd(ranked.map((p) => ({ name: p.name, path: routes.product(p.slug) }))),
          breadcrumbLd(crumbs),
          faqLd(list.faq),
        )}
      />
    </PageShell>
  )
}
