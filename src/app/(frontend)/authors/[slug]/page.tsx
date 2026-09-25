import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import { allAuthors, getAuthor, productsByAuthor } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { absoluteUrl, breadcrumbLd, graph, pageMetadata, SITE } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return allAuthors().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const author = getAuthor((await params).slug)
  if (!author) return {}
  return pageMetadata({ title: `${author.name}, ${author.role}`, description: author.bio[0].slice(0, 155), path: routes.author(author.slug) })
}

export default async function AuthorPage({ params }: { params: Params }) {
  await ensureCatalog()
  const author = getAuthor((await params).slug)
  if (!author) notFound()
  const products = productsByAuthor(author.slug)
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: author.name, path: routes.author(author.slug) },
  ]
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <p className="text-eyebrow uppercase text-shade-60">{author.role}</p>
          <h1 className="mt-3 font-display text-display-sm md:text-display-lg">{author.name}</h1>
          <Prose paragraphs={author.bio} className="mt-6" />
          {author.credentials && <p className="mt-4 text-caption text-shade-60">{author.credentials}</p>}
        </header>
        <Section id="verdicts" title={`Which verdicts has ${author.name.split(' ')[0]} approved?`}>
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
          {
            '@type': 'Person',
            name: author.name,
            jobTitle: author.role,
            url: absoluteUrl(routes.author(author.slug)),
            worksFor: { '@id': `${SITE.url}/#organization` },
          },
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
