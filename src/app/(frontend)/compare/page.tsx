import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { siloIcon } from '@/components/Icon'
import { CategoryTile, Container, Section } from '@/components/ui'
import { allComparisons, categoryComparisons, getCategory, getProduct, productsIn } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { breadcrumbLd, fixedPageMetadata, graph } from '@/lib/seo'
import { ensureCatalog, pageTexts } from '@/lib/store'

export async function generateMetadata(): Promise<Metadata> {
  await ensureCatalog()
  return fixedPageMetadata('compare', routes.compareIndex())
}

export default async function CompareIndexPage() {
  await ensureCatalog()
  const text = pageTexts.compare
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Compare', path: routes.compareIndex() }]} />
        <h1 className="font-display text-display-sm md:text-display-lg">{text.heading}</h1>
        <p className="mt-4 max-w-[60ch] text-body-lg">
          {text.intro}
        </p>

        <Section id="categories" title="Which category do you want to compare?">
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryComparisons().map((c) => (
              <li key={c.slug}>
                <CategoryTile
                  href={routes.compare(c.slug)}
                  title={`${c.name} compared`}
                  meta={`${productsIn(c.slug).length} products side by side`}
                  icon={siloIcon(c.parent ?? c.slug)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="pairs" title="Head-to-heads">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allComparisons().map((c) => (
              <li key={c.slug}>
                <Link href={routes.compare(c.slug)} className="block h-full rounded-lg border border-hairline bg-white p-6 transition-colors hover:border-indigo hover:bg-cream">
                  <span className="text-eyebrow uppercase text-shade-60">{getCategory(c.category)!.name}</span>
                  <span className="mt-2 block text-heading-md">
                    {c.products.map((s) => getProduct(s)!.shortName).join(' vs ')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
      <JsonLd data={graph({ '@type': 'CollectionPage', name: text.heading, description: text.intro }, breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Compare', path: routes.compareIndex() }]))} />
    </PageShell>
  )
}
