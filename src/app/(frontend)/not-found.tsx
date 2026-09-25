import { PageShell } from '@/components/SiteChrome'
import { Container, PillLink } from '@/components/ui'
import { routes } from '@/lib/routes'
import { ensureCatalog } from '@/lib/store'

export default async function NotFound() {
  await ensureCatalog()
  return (
    <PageShell track="light">
      <Container className="py-24">
        <p className="text-eyebrow uppercase text-shade-60">404</p>
        <h1 className="mt-3 font-display text-display-sm md:text-display-lg">We haven&apos;t reviewed that.</h1>
        <p className="mt-4 max-w-[52ch] text-body-lg">
          The page you&apos;re looking for doesn&apos;t exist, or the product isn&apos;t in our catalogue yet.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <PillLink href={routes.home()}>Go home</PillLink>
          <PillLink href={routes.bestIndex()} variant="outline-light">
            See ranked lists
          </PillLink>
        </div>
      </Container>
    </PageShell>
  )
}
