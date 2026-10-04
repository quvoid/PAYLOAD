import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { allBestOf, getCategory, rankBestOf } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { breadcrumbLd, fixedPageMetadata, graph, itemListLd } from '@/lib/seo'
import { ensureCatalog, pageTexts } from '@/lib/store'

export async function generateMetadata(): Promise<Metadata> {
  await ensureCatalog()
  return fixedPageMetadata('best', routes.bestIndex())
}

export default async function BestIndexPage() {
  await ensureCatalog()
  const text = pageTexts.best
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Ranked lists', path: routes.bestIndex() }]} />
        <h1 className="font-display text-display-sm md:text-display-lg">{text.heading}</h1>
        <p className="mt-4 max-w-[60ch] text-body-lg">
          {text.intro}
        </p>
        <Section id="lists" title="Which list do you need?">
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {allBestOf().map((b) => (
              <li key={b.slug} className="relative rounded-lg bg-white p-6 shadow-l3">
                <p className="text-eyebrow uppercase text-shade-60">{getCategory(b.category)!.name}</p>
                <h3 className="mt-2 text-heading-md">
                  <Link href={routes.best(b.slug)} className="after:absolute after:inset-0">
                    {b.title}
                  </Link>
                </h3>
                <p className="mt-3 text-caption text-shade-60">{rankBestOf(b).length} products ranked</p>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
      <JsonLd data={graph({ '@type': 'CollectionPage', name: text.heading, description: text.intro }, itemListLd(allBestOf().map((b) => ({ name: b.title, path: routes.best(b.slug) })), false), breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Ranked lists', path: routes.bestIndex() }]))} />
    </PageShell>
  )
}
