import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section } from '@/components/ui'
import { allAuthors, getAuthor, productsByAuthor } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { absoluteUrl, breadcrumbLd, graph, pageMetadata, personId, SITE } from '@/lib/seo'
import { notFoundOrRedirect } from '@/lib/not-found'
import { authorIndexable } from '@/lib/sitemaps'
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
  return pageMetadata({
    title: `${author.name}, ${author.role}`,
    description: (author.bio[0] ?? `${author.name}, ${author.role} at ReviewLens.`).slice(0, 155),
    path: routes.author(author.slug),
    noindex: !authorIndexable(author.slug),
  })
}

export default async function AuthorPage({ params }: { params: Params }) {
  await ensureCatalog()
  const slug = (await params).slug
  const author = getAuthor(slug)
  if (!author) notFoundOrRedirect(`/authors/${slug}`)
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
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            '@id': personId(author.slug),
            name: author.name,
            ...(author.bio[0] && { description: author.bio[0] }),
            ...(author.credentials && { hasCredential: { '@type': 'EducationalOccupationalCredential', name: author.credentials } }),
            ...(author.sameAs?.length && { sameAs: author.sameAs }),
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
