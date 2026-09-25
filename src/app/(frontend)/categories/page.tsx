import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { productsIn, listedChildren, listedSilos } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { breadcrumbLd, graph, itemListLd, pageMetadata } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

export const metadata: Metadata = pageMetadata({
  title: 'All categories',
  description: 'Every category ReviewLens reviews, from protein powder to UPI apps.',
  path: routes.categories(),
})

export default async function CategoriesPage() {
  await ensureCatalog()
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: 'Categories', path: routes.categories() },
  ]
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="font-display text-display-sm md:text-display-lg">All categories</h1>
        <p className="mt-4 max-w-[60ch] text-body-lg">
          Every category we review. Each one is scored on the measures that matter for it, so products are always
          compared like with like.
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
