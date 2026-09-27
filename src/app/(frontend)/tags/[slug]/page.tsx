import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { allTags, getTag, TAG_INDEX_MIN, taggedCount, taggedWith } from '@/lib/catalog'
import { notFoundOrRedirect } from '@/lib/not-found'
import { routes } from '@/lib/routes'
import { breadcrumbLd, graph, itemListLd, pageMetadata } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return allTags().map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const tag = getTag((await params).slug)
  if (!tag) return {}
  return pageMetadata({
    title: tag.name,
    description: tag.description || `Everything on ReviewLens tagged “${tag.name}”.`,
    path: routes.tag(tag.slug),
    seo: tag.seo,
    noindex: taggedCount(tag.slug) < TAG_INDEX_MIN,
  })
}

export default async function TagPage({ params }: { params: Params }) {
  await ensureCatalog()
  const slug = (await params).slug
  const tag = getTag(slug)
  if (!tag) notFoundOrRedirect(`/tags/${slug}`)

  const { products, lists, guides, pages } = taggedWith(tag.slug)
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: tag.name, path: routes.tag(tag.slug) },
  ]
  const links = [
    { title: 'Ranked lists', items: lists.map((b) => ({ href: routes.best(b.slug), label: b.title })) },
    { title: 'Guides', items: guides.map((t) => ({ href: routes.topic(t.slug), label: t.title })) },
    { title: 'Pages', items: pages.map((p) => ({ href: routes.page(p.slug), label: p.title })) },
  ].filter((g) => g.items.length)

  return (
    <PageShell track="light">
      <Container className="pb-24">
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <p className="text-eyebrow uppercase text-shade-60">Tag</p>
          <h1 className="mt-3 font-display text-display-sm md:text-display-lg">{tag.name}</h1>
          {tag.description && <p className="mt-4 max-w-[60ch] text-body-lg">{tag.description}</p>}
        </header>

        {products.length === 0 && links.length === 0 && (
          <p className="mt-10 text-shade-60">Nothing has this tag yet.</p>
        )}

        {products.length > 0 && (
          <Section id="products" title="Products">
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {links.length > 0 && (
          <Section id="more" title="More on this">
            <div className="grid gap-10 md:grid-cols-3">
              {links.map((g) => (
                <div key={g.title}>
                  <h3 className="text-heading-md">{g.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {g.items.map((l) => (
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
          { '@type': 'CollectionPage', name: tag.name, ...(tag.description && { description: tag.description }) },
          itemListLd(products.map((p) => ({ name: p.name, path: routes.product(p.slug) }))),
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
