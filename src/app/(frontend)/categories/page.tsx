import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { productsIn, listedChildren, listedSilos } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { breadcrumbLd, fixedPageMetadata, graph, itemListLd } from '@/lib/seo'
import { ensureCatalog, pageTexts } from '@/lib/store'

export async function generateMetadata(): Promise<Metadata> {
  await ensureCatalog()
  return fixedPageMetadata('categories', routes.categories())
}

export default async function CategoriesPage() {
  await ensureCatalog()
  const text = pageTexts.categories
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: 'Categories', path: routes.categories() },
  ]
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="font-display text-display-sm md:text-display-lg">{text.heading}</h1>
        <p className="mt-4 max-w-[60ch] text-body-lg">
          {text.intro}
        </p>

        <Section id="sections" title="What are you shopping for?">
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listedSilos().map((silo) => (
              <li key={silo.slug} className="rounded-lg bg-white p-8 shadow-l3">
                <h3 className="font-display text-heading-xl">
                  <Link href={routes.category(silo)} className="underline-offset-4 hover:underline">
                    {silo.name}
                  </Link>
                </h3>
                <p className="mt-2 text-caption text-shade-60">{silo.tagline}</p>
                <ul className="mt-6 divide-y divide-hairline border-t border-hairline">
                  {listedChildren(silo.slug).map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={routes.category(c)}
                        className="flex min-h-11 items-center justify-between gap-4 py-2 hover:text-shade-60"
                      >
                        <span>{c.name}</span>
                        <span className="text-caption text-shade-60 tabular-nums">
                          {productsIn(c.slug).length} reviewed
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
      <JsonLd
        data={graph(
          { '@type': 'CollectionPage', name: 'All categories' },
          itemListLd(listedSilos().map((s) => ({ name: s.name, path: routes.category(s) })), false),
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
