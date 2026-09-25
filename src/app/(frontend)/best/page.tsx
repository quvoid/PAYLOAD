import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { allBestOf, getCategory, rankBestOf } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { pageMetadata } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

export const metadata: Metadata = pageMetadata({
  title: 'Ranked lists — best products by what matters',
  description: 'Every ranked list on ReviewLens, each ordered by scores computed from real reviews.',
  path: routes.bestIndex(),
})

export default async function BestIndexPage() {
  await ensureCatalog()
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Ranked lists', path: routes.bestIndex() }]} />
        <h1 className="font-display text-display-sm md:text-display-lg">Ranked lists</h1>
        <p className="mt-4 max-w-[60ch] text-body-lg">
          Each list ranks products by a score we compute from reviews, and re-ranks itself whenever reviews or
          prices change.
        </p>
        <Section id="lists" title="Which list do you need?">
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
    </PageShell>
  )
}
