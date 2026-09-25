import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { allComparisons, categoryComparisons, getCategory, getProduct, productsIn } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Compare products side by side',
  description: 'Head-to-head comparisons and whole-category tables, every measure computed from reviews.',
  path: routes.compareIndex(),
})

export default function CompareIndexPage() {
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={[{ name: 'Home', path: '/' }, { name: 'Compare', path: routes.compareIndex() }]} />
        <h1 className="font-display text-display-sm md:text-display-lg">Compare</h1>
        <p className="mt-4 max-w-[60ch] text-body-lg">
          Scores, sentiment and share of voice side by side — for a whole category, or two products head to head.
        </p>

        <Section id="categories" title="Which category do you want to compare?">
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryComparisons().map((c) => (
              <li key={c.slug} className="relative rounded-lg bg-peach p-8">
                <h3 className="font-display text-heading-xl">
                  <Link href={routes.compare(c.slug)} className="after:absolute after:inset-0 after:rounded-lg">
                    Every {c.name.toLowerCase()} compared
                  </Link>
                </h3>
                <p className="mt-3 text-caption">{productsIn(c.slug).length} products</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="pairs" title="Head-to-heads">
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allComparisons().map((c) => (
              <li key={c.slug}>
                <Link href={routes.compare(c.slug)} className="block h-full rounded-lg border border-hairline p-6 hover:border-indigo">
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
    </PageShell>
  )
}
