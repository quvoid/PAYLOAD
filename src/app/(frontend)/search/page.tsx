import type { Metadata } from 'next'
import Link from 'next/link'

import { RequestForm } from '@/components/RequestForm'
import { ProductCard } from '@/components/review'
import { SearchForm } from '@/components/SearchForm'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { searchCatalogue } from '@/lib/catalog'
import { QUERY_MAX } from '@/lib/requests'
import { routes } from '@/lib/routes'
import { SITE } from '@/lib/seo'
import { ensureCatalog } from '@/lib/store'

// Internal search results are never indexed (docs/PLAN.md §7); robots.ts also disallows /search.
export const metadata: Metadata = {
  title: { absolute: `Search | ${SITE.name}` },
  robots: { index: false, follow: true },
}

type SearchParams = Promise<{ q?: string | string[] }>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  await ensureCatalog()
  const raw = (await searchParams).q
  const query = (Array.isArray(raw) ? raw[0] : (raw ?? '')).trim().slice(0, QUERY_MAX)
  const results = searchCatalogue(query)
  const found = results.products.length > 0

  return (
    <PageShell track="light">
      <Container className="pt-10">
        <h1 className="font-display text-display-sm md:text-display-md">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search the catalogue'}
        </h1>
        <SearchForm size="lg" defaultValue={query} className="mt-6 max-w-2xl" />

        {query && (
          <p className="mt-4 text-caption text-shade-60" aria-live="polite">
            {found
              ? `${results.products.length} product${results.products.length === 1 ? '' : 's'}${results.exact ? '' : ' partly matching'}`
              : 'No products match yet.'}
          </p>
        )}

        {(results.categories.length > 0 || results.brands.length > 0) && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {results.categories.map((c) => (
              <li key={c.slug}>
                <Link href={routes.category(c)} className="inline-flex min-h-11 items-center rounded-pill bg-shade-30 px-4 text-caption">
                  Category · {c.name}
                </Link>
              </li>
            ))}
            {results.brands.map((b) => (
              <li key={b.slug}>
                <Link href={routes.brand(b.slug)} className="inline-flex min-h-11 items-center rounded-pill bg-shade-30 px-4 text-caption">
                  Brand · {b.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {found && (
          <Section id="results" title={results.exact ? 'Products we’ve reviewed' : 'Closest matches'}>
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.products.map((p) => (
                <li key={p.slug}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </Container>

      {query && (
        <section aria-labelledby="h-request" className="mt-10 bg-peach">
          <Container className="py-12 md:py-16">
            <span aria-hidden className="mb-5 block h-1 w-10 rounded-pill bg-pink" />
            <h2 id="h-request" className="font-display text-heading-xl md:text-display-sm">
              {found ? 'Not the product you meant?' : <>We haven&rsquo;t reviewed &ldquo;{query}&rdquo; yet</>}
            </h2>
            <p className="mt-3 max-w-[62ch]">
              We only publish reviews an editor has checked, so we don&rsquo;t generate them on the spot. Ask for it
              and we&rsquo;ll add it to our queue — the most-requested products get reviewed first.
            </p>
            <div className="mt-8 max-w-3xl">
              <RequestForm query={query} />
            </div>
          </Container>
        </section>
      )}
      <div className="pb-6" />
    </PageShell>
  )
}
