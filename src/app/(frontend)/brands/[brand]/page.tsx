import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs, ProductCard } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Prose, Section, Stat } from '@/components/ui'
import { allBrands, getBrand, productsByBrand } from '@/lib/catalog'
import { formatCount, formatRating } from '@/lib/format'
import { countedReviews, weightedRating } from '@/lib/metrics'
import { routes } from '@/lib/routes'
import { absoluteUrl, brandId, breadcrumbLd, describe, graph, itemListLd, ogImage, pageMetadata } from '@/lib/seo'
import { notFoundOrRedirect } from '@/lib/not-found'
import { brandIndexable } from '@/lib/sitemaps'
import { brandTemplated } from '@/lib/seo-templates'
import { ensureCatalog } from '@/lib/store'

type Params = Promise<{ brand: string }>

export async function generateStaticParams() {
  await ensureCatalog()
  return allBrands().map((b) => ({ brand: b.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await ensureCatalog()
  const brand = getBrand((await params).brand)
  if (!brand) return {}
  return pageMetadata({
    title: `${brand.name} reviews: every product rated`,
    description: describe(
      `Every ${brand.name} product we track, with verdicts computed from real reviews.`,
      brand.about[0],
    ),
    path: routes.brand(brand.slug),
    seo: brand.seo,
    templated: brandTemplated(brand),
    image: ogImage('brand', brand.slug, brand.name),
    // A brand with nothing published yet is a thin page.
    noindex: !brandIndexable(brand.slug),
  })
}

export default async function BrandPage({ params }: { params: Params }) {
  await ensureCatalog()
  const slug = (await params).brand
  const brand = getBrand(slug)
  if (!brand) notFoundOrRedirect(`/brands/${slug}`)

  const products = productsByBrand(brand.slug)
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: brand.name, path: routes.brand(brand.slug) },
  ]
  const reviews = products.reduce((n, p) => n + countedReviews(p).length, 0)
  const avg = products.reduce((n, p) => n + weightedRating(p), 0) / (products.length || 1)

  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="grid gap-10 border-b border-hairline pb-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="text-eyebrow uppercase text-shade-60">Brand</p>
            <h1 className="mt-3 font-display text-display-sm md:text-display-lg">{brand.name}</h1>
            <Prose paragraphs={brand.about} className="mt-6" />
          </div>
          <dl className="grid grid-cols-3 gap-8 self-end">
            <Stat value={products.length} label="Products" />
            <Stat value={formatCount(reviews)} label="Reviews counted" />
            <Stat value={`${formatRating(avg)}★`} label="Avg. weighted" />
          </dl>
        </header>
        <Section id="products" title={`Which ${brand.name} products are worth buying?`}>
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
            '@type': 'Brand',
            '@id': brandId(brand.slug),
            name: brand.name,
            url: absoluteUrl(routes.brand(brand.slug)),
            ...(brand.about[0] && { description: brand.about[0] }),
            ...(brand.sameAs.length > 0 && { sameAs: brand.sameAs }),
          },
          itemListLd(products.map((p) => ({ name: p.name, path: routes.product(p.slug) })), false),
          breadcrumbLd(crumbs),
        )}
      />
    </PageShell>
  )
}
