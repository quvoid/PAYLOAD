import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, Faq, ProductCard, SovChart } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, PillLink, Prose, Section, Stat } from '@/components/ui'
import {
  bestOfFor,
  categoryComparisons,
  comparisonsIn,
  getAspect,
  getCategory,
  getProduct,
  leafCategories,
  productsIn,
} from '@/lib/catalog'
import { formatCount, formatDate, isoDate } from '@/lib/format'
import { countedReviews, shareOfVoice } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { breadcrumbLd, categoryCrumbs, faqLd, graph, itemListLd, pageMetadata } from '@/lib/seo'

type Params = Promise<{ silo: string; sub: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return leafCategories().map((c) => ({ silo: c.parent!, sub: c.slug }))
}

const load = async (params: Params) => {
  const { silo, sub } = await params
  const category = getCategory(sub)
  return category?.parent === silo ? category : undefined
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await load(params)
  if (!category) return {}
  return pageMetadata({
    title: `${category.name} reviews and buying guide`,
    description: category.tagline,
    path: routes.category(category),
  })
}

export default async function CategoryPage({ params }: { params: Params }) {
  const category = await load(params)
  if (!category) notFound()

  const products = productsIn(category.slug)
  const crumbs = categoryCrumbs(category.slug)
  const reviews = products.reduce((n, p) => n + countedReviews(p).length, 0)
  const lastUpdated = products.map((p) => p.updatedAt).sort().at(-1)!
  const lists = bestOfFor(category.slug)
  const pairs = comparisonsIn(category.slug)
  const hasTable = categoryComparisons().includes(category)

  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="grid gap-10 border-b border-hairline pb-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <h1 className="font-display text-display-sm md:text-display-lg">{category.name}</h1>
            <p className="mt-4 max-w-[60ch] text-body-lg">{category.tagline}</p>
          </div>
          <dl className="grid grid-cols-2 gap-6 self-end sm:grid-cols-3 sm:gap-8">
            <Stat value={products.length} label="Products" />
            <Stat value={formatCount(reviews)} label="Reviews counted" />
            <Stat
              value={<time dateTime={isoDate(lastUpdated)} className="text-heading-lg">{formatDate(lastUpdated)}</time>}
              label="Last updated"
            />
          </dl>
        </header>

        <Section id="guide" title={`What should you look for in ${category.name.toLowerCase()}?`}>
          <Prose paragraphs={category.intro} />
          <ul className="mt-8 flex flex-wrap gap-2">
            {category.aspects.map((a) => {
              const aspect = getAspect(a.aspect)!
              return (
                <li key={a.aspect} className="rounded-pill bg-shade-30 px-4 py-2 text-caption">
                  {aspect.topic ? (
                    <Link href={routes.topic(aspect.topic)} className="underline underline-offset-4">
                      {aspect.label}
                    </Link>
                  ) : (
                    aspect.label
                  )}
                  {a.dealBreaker && <span className="text-shade-60"> · deal-breaker</span>}
                </li>
              )
            })}
          </ul>
        </Section>

        <Section id="products" title={`Every ${category.name.toLowerCase()} we've reviewed`} lead="Best composite score first.">
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>

        {products.length > 1 && (
          <Section
            id="voice"
            title={`Which ${category.name.toLowerCase()} gets talked about most?`}
            lead="Share of voice: each product's share of all marketplace ratings and Reddit and YouTube discussion in this category."
          >
            <div className="max-w-3xl">
              <SovChart rows={shareOfVoice(products[0]).peers} />
            </div>
            {hasTable && (
              <PillLink href={routes.compare(category.slug)} variant="outline-light" className="mt-8">
                Compare every {category.name.toLowerCase()} side by side
              </PillLink>
            )}
          </Section>
        )}

        {(lists.length > 0 || pairs.length > 0) && (
          <Section id="lists" title="Ranked lists and head-to-heads">
            <ul className="grid gap-4 md:grid-cols-3">
              {lists.map((b) => (
                <li key={b.slug}>
                  <Link href={routes.best(b.slug)} className="block h-full rounded-lg bg-blush p-6">
                    <span className="text-eyebrow uppercase">Ranked list</span>
                    <span className="mt-2 block text-heading-md">{b.title}</span>
                  </Link>
                </li>
              ))}
              {pairs.map((c) => (
                <li key={c.slug}>
                  <Link href={routes.compare(c.slug)} className="block h-full rounded-lg border border-hairline p-6 hover:border-indigo">
                    <span className="text-eyebrow uppercase text-shade-60">Head-to-head</span>
                    <span className="mt-2 block text-heading-md">
                      {c.products.map((s) => getProduct(s)!.shortName).join(' vs ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {category.faq.length > 0 && (
          <Section id="faq" title={`Questions about ${category.name.toLowerCase()}`}>
            <Faq items={category.faq} />
          </Section>
        )}
      </Container>
      <JsonLd
        data={graph(
          { '@type': 'CollectionPage', name: category.name, description: category.tagline },
          itemListLd(products.map((p) => ({ name: p.name, path: routes.product(p.slug) }))),
          breadcrumbLd(crumbs),
          ...(category.faq.length ? [faqLd(category.faq)] : []),
        )}
      />
    </PageShell>
  )
}
