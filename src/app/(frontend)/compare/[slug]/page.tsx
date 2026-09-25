import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CategoryTable, PairTable } from '@/components/compare'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard, SovChart } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import {
  allComparisons,
  categoryComparisons,
  getCategory,
  getComparison,
  getProduct,
  productsIn,
} from '@/lib/catalog'
import { shareOfVoice } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { breadcrumbLd, categoryCrumbs, graph, itemListLd, pageMetadata, productReviewLd } from '@/lib/seo'
import type { Category, PairComparison } from '@/lib/types'

// Two kinds of comparison share /compare/[slug]: editor-chosen head-to-head pairs, and a
// whole-category table generated once a category has enough products.

type Params = Promise<{ slug: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return [...allComparisons().map((c) => c.slug), ...categoryComparisons().map((c) => c.slug)].map((slug) => ({ slug }))
}

const resolve = (slug: string) => {
  const pair = getComparison(slug)
  if (pair) return { kind: 'pair' as const, pair }
  const category = categoryComparisons().find((c) => c.slug === slug)
  if (category) return { kind: 'category' as const, category }
  return undefined
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = resolve((await params).slug)
  if (!found) return {}
  if (found.kind === 'pair') {
    const [a, b] = found.pair.products.map((s) => getProduct(s)!)
    return pageMetadata({
      title: `${a.shortName} vs ${b.shortName}: which should you buy?`,
      description: found.pair.judgement[0].slice(0, 155),
      path: routes.compare(found.pair.slug),
    })
  }
  return pageMetadata({
    title: `Every ${found.category.name.toLowerCase()} compared: scores, sentiment, share of voice`,
    description: `All ${found.category.name.toLowerCase()} products we track, side by side on the same measures.`,
    path: routes.compare(found.category.slug),
  })
}

function PairPage({ pair }: { pair: PairComparison }) {
  const category = getCategory(pair.category)!
  const products = pair.products.map((s) => getProduct(s)!)
  const title = products.map((p) => p.shortName).join(' vs ')
  const crumbs = [...categoryCrumbs(category.slug), { name: title, path: routes.compare(pair.slug) }]
  return (
    <>
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <p className="text-eyebrow uppercase text-shade-60">Head-to-head · {category.name}</p>
          <h1 className="mt-3 font-display text-display-sm md:text-display-lg">{title}</h1>
          <Prose paragraphs={pair.judgement} className="mt-6 text-body-lg" />
        </header>

        <Section id="pick" title="Which one should you pick?">
          <ul className="grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <li key={p.slug} className="rounded-lg bg-peach p-8">
                <p className="text-heading-md">{pair.pickIf[p.slug]}</p>
                <Link href={routes.product(p.slug)} className="mt-4 inline-block text-caption underline decoration-pink underline-offset-4">
                  Read the {p.shortName} review
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="side-by-side" title="How do they compare, measure by measure?">
          <PairTable products={products} category={category} />
        </Section>

        <Section id="products" title="The two products">
          <ul className="grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>
      </Container>
      <JsonLd
        data={graph(
          itemListLd(products.map((p) => ({ name: p.name, path: routes.product(p.slug) })), false),
          ...products.map(productReviewLd),
          breadcrumbLd(crumbs),
        )}
      />
    </>
  )
}

function CategoryComparePage({ category }: { category: Category }) {
  const products = productsIn(category.slug)
  const title = `Every ${category.name.toLowerCase()} compared`
  const crumbs = [...categoryCrumbs(category.slug), { name: 'Compared', path: routes.compare(category.slug) }]
  return (
    <>
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <p className="text-eyebrow uppercase text-shade-60">Category comparison</p>
          <h1 className="mt-3 font-display text-display-sm md:text-display-lg">{title}</h1>
          <p className="mt-6 max-w-[62ch] text-body-lg">
            All {products.length} {category.name.toLowerCase()} products we track, side by side: scores, sentiment
            and share of voice, all computed from reviews on the same measures.
          </p>
        </header>

        <Section id="table" title="How does every product score?" lead="Scroll sideways for every measure. Best composite score first.">
          <CategoryTable products={products} category={category} />
        </Section>

        <Section
          id="voice"
          title="Who owns the conversation?"
          lead="Share of voice counts each marketplace's own rating total plus the Reddit and YouTube discussion we collected. Positive voice weights that by the share of reviews that are positive."
        >
          <div className="max-w-3xl">
            <SovChart rows={shareOfVoice(products[0]).peers} />
          </div>
        </Section>

        <p className="pb-14 text-caption text-shade-60">
          Looking for a guide rather than a table?{' '}
          <Link href={routes.category(category)} className="text-ink underline decoration-pink underline-offset-4">
            {category.name} buying guide
          </Link>
        </p>
      </Container>
      <JsonLd
        data={graph(itemListLd(products.map((p) => ({ name: p.name, path: routes.product(p.slug) }))), breadcrumbLd(crumbs))}
      />
    </>
  )
}

export default async function ComparePage({ params }: { params: Params }) {
  const found = resolve((await params).slug)
  if (!found) notFound()
  return (
    <PageShell track="light">
      {found.kind === 'pair' ? <PairPage pair={found.pair} /> : <CategoryComparePage category={found.category} />}
    </PageShell>
  )
}
