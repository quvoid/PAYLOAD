import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { allProducts, allSources } from '@/lib/catalog'
import { routes } from '@/lib/routes'
import { breadcrumbLd, fixedPageMetadata, graph } from '@/lib/seo'
import { ensureCatalog, pageTexts } from '@/lib/store'

export async function generateMetadata(): Promise<Metadata> {
  await ensureCatalog()
  return fixedPageMetadata('sources', routes.sources())
}

const kindLabel = {
  marketplace: 'Marketplace',
  'brand-store': 'Brand store',
  'app-store': 'App store',
  community: 'Community',
  video: 'Video',
}

export default async function SourcesPage() {
  await ensureCatalog()
  const text = pageTexts.sources
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: 'Sources', path: routes.sources() },
  ]
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <h1 className="font-display text-display-sm md:text-display-lg">{text.heading}</h1>
          <p className="answer mt-6 max-w-[62ch] text-body-lg">
            {text.intro.replaceAll('{sources}', String(allSources().length))}
          </p>
        </header>
        <Section id="sources" title="Which sources do we use?">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-hairline text-eyebrow uppercase text-shade-60">
                  <th scope="col" className="py-3 pr-4 font-normal">Source</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Type</th>
                  <th scope="col" className="py-3 pr-4 font-normal">How we collect</th>
                  <th scope="col" className="py-3 pr-4 font-normal">Weight</th>
                  <th scope="col" className="py-3 font-normal">Products</th>
                </tr>
              </thead>
              <tbody>
                {allSources().map((s) => (
                  <tr key={s.id} className="border-b border-hairline align-top">
                    <th scope="row" className="py-4 pr-4 text-body-strong">{s.name}</th>
                    <td className="py-4 pr-4 text-caption">{kindLabel[s.kind]}</td>
                    <td className="max-w-[40ch] py-4 pr-4 text-caption text-shade-60">{s.collection}</td>
                    <td className="py-4 pr-4 tabular-nums">{s.weight}×</td>
                    <td className="py-4 tabular-nums">
                      {allProducts().filter((p) => p.reviews.some((r) => r.source === s.id)).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </Container>
      <JsonLd data={graph({ '@type': 'AboutPage', name: text.heading, description: text.description }, breadcrumbLd(crumbs))} />
    </PageShell>
  )
}
