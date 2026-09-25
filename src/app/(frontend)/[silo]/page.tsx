import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard } from '@/components/review'
import { SearchForm } from '@/components/SearchForm'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import {
  bestOfFor,
  comparisonsIn,
  getCategory,
  getProduct,
  listedChildren,
  productsIn,
  silos,
  topicsIn,
} from '@/lib/catalog'
import { inSentence } from '@/lib/format'
import { routes } from '@/lib/routes'
import { breadcrumbLd, categoryCrumbs, graph, itemListLd, pageMetadata } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ silo: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return silos().map((s) => ({ silo: s.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const silo = getCategory((await params).silo)
  if (!silo || silo.parent) return {}
  return pageMetadata({
    title: `${silo.name} reviews`,
    description: silo.tagline,
    path: routes.category(silo),
    noindex: productsIn(silo.slug).length === 0,
  })
}

export default async function SiloPage({ params }: { params: Params }) {
  await ensureCatalog()
  const silo = getCategory((await params).silo)
  if (!silo || silo.parent) notFound()

  const children = listedChildren(silo.slug)
  if (children.length === 0) {
    return (
      <PageShell track="light">
        <Container className="pb-24">
          <Breadcrumbs crumbs={categoryCrumbs(silo.slug)} />
          <h1 className="font-display text-display-sm md:text-display-lg">{silo.name}</h1>
          <p className="mt-4 max-w-[60ch] text-body-lg">{silo.tagline}</p>
          <p className="mt-8 max-w-[60ch] text-shade-60">
            We haven&apos;t published any reviews in this section yet. Search for a product to request one.
          </p>
          <SearchForm size="lg" className="mt-6 max-w-2xl" />
        </Container>
      </PageShell>
    )
  }
  const top = productsIn(silo.slug).slice(0, 12)
  const crumbs = categoryCrumbs(silo.slug)
  const lists = bestOfFor(silo.slug)
  const pairs = comparisonsIn(silo.slug)
  const topics = topicsIn(silo.slug)

  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <h1 className="font-display text-display-sm md:text-display-lg">{silo.name}</h1>
          <p className="mt-4 max-w-[60ch] text-body-lg">{silo.tagline}</p>
          <Prose paragraphs={silo.intro} className="mt-6 text-shade-60" />
        </header>

        <Section id="categories" title={`Which kind of ${inSentence(silo.name.split(' & ')[0])} do you need?`}>
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {children.map((c) => (
              <li key={c.slug} className="relative rounded-lg bg-peach p-8">
                <h3 className="font-display text-heading-xl">
                  <Link href={routes.category(c)} className="after:absolute after:inset-0 after:rounded-lg">
                    {c.name}
                  </Link>
                </h3>
                <p className="mt-2">{c.tagline}</p>
                <p className="mt-6 text-caption">{productsIn(c.slug).length} products reviewed</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="top" title={`The best-scoring ${inSentence(silo.name)}`}>
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {top.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>

        {(lists.length > 0 || pairs.length > 0 || topics.length > 0) && (
          <Section id="guides" title="Lists, comparisons and guides">
            <div className="grid gap-10 md:grid-cols-3">
              {[
                { title: 'Ranked lists', links: lists.map((b) => ({ href: routes.best(b.slug), label: b.title })) },
                {
                  title: 'Head-to-head',
                  links: pairs.map((c) => ({
                    href: routes.compare(c.slug),
                    label: c.products.map((s) => getProduct(s)!.shortName).join(' vs '),
                  })),
                },
                { title: 'Guides', links: topics.map((t) => ({ href: routes.topic(t.slug), label: t.title })) },
              ]
                .filter((g) => g.links.length)
                .map((g) => (
                  <div key={g.title}>
                    <h3 className="text-heading-md">{g.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="underline decoration-shade-40 underline-offset-4 hover:decoration-pink">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </Section>
        )}
      </Container>
      <JsonLd
        data={graph(
          { '@type': 'CollectionPage', name: silo.name, description: silo.tagline },
          itemListLd(top.map((p) => ({ name: p.name, path: routes.product(p.slug) }))),
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
