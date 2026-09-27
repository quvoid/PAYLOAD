import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard } from '@/components/review'
import { RichText } from '@/components/RichText'
import { SearchForm } from '@/components/SearchForm'
import { TagList } from '@/components/TagList'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import {
  bestOfFor,
  comparisonsIn,
  allPages,
  getCategory,
  getPage,
  getPageForPreview,
  getProduct,
  listedChildren,
  productsIn,
  silos,
  topicsIn,
} from '@/lib/catalog'
import { formatDate, inSentence, isoDate } from '@/lib/format'
import { routes } from '@/lib/routes'
import { breadcrumbLd, categoryCrumbs, graph, itemListLd, pageMetadata } from '@/lib/seo'
import { notFoundOrRedirect } from '@/lib/not-found'
import { ensureCatalog } from '@/lib/store'
import type { Category, Page } from '@/lib/types'

type Params = Promise<{ silo: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  // Sections (/apps) and the editors' own pages (/about) share the root.
  return [...silos().map((s) => ({ silo: s.slug })), ...allPages().map((p) => ({ silo: p.slug }))]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const slug = (await params).silo
  const silo = getCategory(slug)
  if (!silo || silo.parent) {
    const page = (await draftMode()).isEnabled ? getPageForPreview(slug) : getPage(slug)
    if (!page) return {}
    return pageMetadata({
      title: page.title,
      description: page.intro,
      path: routes.page(page.slug),
      seo: page.seo,
      image: page.heroImage,
      noindex: page.draft,
    })
  }
  return pageMetadata({
    title: `${silo.name} reviews`,
    description: silo.tagline,
    path: routes.category(silo),
    seo: silo.seo,
    noindex: productsIn(silo.slug).length === 0,
  })
}

export default async function RootSegmentPage({ params }: { params: Params }) {
  await ensureCatalog()
  const slug = (await params).silo
  const silo = getCategory(slug)
  if (silo && !silo.parent) return <SiloView silo={silo} />
  const page = (await draftMode()).isEnabled ? getPageForPreview(slug) : getPage(slug)
  if (!page) notFoundOrRedirect(`/${slug}`)
  return <PageView page={page} />
}

/** An editor's own page (About, Privacy…), written in the admin's rich text editor. */
function PageView({ page }: { page: Page }) {
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: page.title, path: routes.page(page.slug) },
  ]
  return (
    <PageShell track="light">
      <Container className="pb-24">
        <Breadcrumbs crumbs={crumbs} />
        <article>
          <header className="border-b border-hairline pb-10">
            <h1 className="max-w-[24ch] font-display text-display-sm md:text-display-lg">{page.title}</h1>
            {page.intro && <p className="mt-4 max-w-[60ch] text-body-lg text-shade-60">{page.intro}</p>}
            <p className="mt-6 text-caption text-shade-60">
              Updated <time dateTime={isoDate(page.updatedAt)}>{formatDate(page.updatedAt)}</time>
            </p>
          </header>
          {page.heroImage && (
            <figure className="mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- editor uploads, sized by the admin */}
              <img
                src={page.heroImage.url}
                alt={page.heroImage.alt}
                width={page.heroImage.width}
                height={page.heroImage.height}
                className="h-auto w-full rounded-lg"
              />
              {page.heroImage.caption && <figcaption className="mt-2 text-caption text-shade-60">{page.heroImage.caption}</figcaption>}
            </figure>
          )}
          <RichText data={page.content} className="mt-10" />
          <TagList tags={page.tags} className="mt-12" />
        </article>
      </Container>
      <JsonLd
        data={graph(
          {
            '@type': 'WebPage',
            name: page.title,
            ...(page.intro && { description: page.intro }),
            datePublished: page.publishedAt,
            dateModified: page.updatedAt,
          },
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}

function SiloView({ silo }: { silo: Category }) {
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
