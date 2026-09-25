import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs } from '@/components/review'
import { PageShell } from '@/components/SiteChrome'
import { Container, Section } from '@/components/ui'
import { getAspect, leafCategories } from '@/lib/catalog'
import { formatPct } from '@/lib/format'
import { routes } from '@/lib/routes'
import { RULES } from '@/lib/rules'
import { pageMetadata } from '@/lib/seo'
import { verdictMeta } from '@/lib/verdict'
import { ensureCatalog } from '@/lib/store'

// Every threshold on this page is read from src/lib/rules.ts and the category data — the same
// values the scoring code uses — so the published method can't drift from the real one.

export const metadata: Metadata = pageMetadata({
  title: 'How we score products',
  description: 'How ReviewLens collects reviews, discounts manipulation, computes every number and reaches a verdict.',
  path: routes.methodology(),
})

export default async function MethodologyPage() {
  await ensureCatalog()
  const crumbs = [
    { name: 'Home', path: routes.home() },
    { name: 'How we score', path: routes.methodology() },
  ]
  return (
    <PageShell track="light">
      <Container>
        <Breadcrumbs crumbs={crumbs} />
        <header className="border-b border-hairline pb-10">
          <h1 className="font-display text-display-sm md:text-display-lg">How we score</h1>
          <p className="answer mt-6 max-w-[62ch] text-body-lg">
            Code counts; people judge. Every number on ReviewLens is computed from reviews by fixed rules. A model
            writes the wording of pros, cons and verdicts, but never a number, and a named editor approves every page.
          </p>
        </header>

        <div className="max-w-[80ch]">
          <Section id="collect" title="Where do the reviews come from?">
            <p>
              We collect reviews for one exact product from marketplaces, the brand&apos;s own store, Google Play and the
              App Store, Reddit and YouTube.
              Reviews in Hindi or Hinglish are translated for analysis and shown as written.{' '}
              <Link href={routes.sources()} className="underline decoration-pink underline-offset-4">
                Every source we use
              </Link>
              .
            </p>
          </Section>

          <Section id="manipulation" title="How do we handle fake reviews?">
            <p>
              Every review gets a credibility score from signals such as verified purchase, length and specificity,
              and whether it belongs to a burst of generic 5★ reviews posted within a few days. Reviews scoring below{' '}
              {RULES.suspiciousBelow} are flagged, shown with a label, and excluded from every count. Brand-store
              reviews are down-weighted because the seller controls them.
            </p>
            <p className="mt-4">
              We then publish two averages side by side: the marketplace average as the platforms report it, and our
              credibility-weighted average. The gap between them is the point.
            </p>
          </Section>

          <Section id="aspects" title="What do we measure?">
            <p>
              Each category has its own aspects. For every aspect we count how many of <em>all</em> reviewers report a
              problem with it — its problem rate. We divide by everyone, not only the people who mention the aspect,
              because specific reviews are mostly complaints: satisfied reviewers tend to write &ldquo;great app&rdquo;
              and name nothing, so judging an aspect by its mentions alone makes every popular product look bad. An
              aspect needs at least {RULES.minMentionsPerAspect} mentions before we judge it at all.
            </p>
            <p className="mt-4">
              The satisfaction score out of 10 is how positive all counted reviews are overall, with neutral reviews
              counted as half. Aspects marked as deal-breakers below can override it.
            </p>
            <div className="mt-8 space-y-8">
              {leafCategories().map((c) => (
                <div key={c.slug} className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-caption">
                    <caption className="mb-3 text-left text-heading-md">{c.name}</caption>
                    <thead>
                      <tr className="border-b border-hairline text-eyebrow uppercase text-shade-60">
                        <th scope="col" className="py-2 font-normal">Aspect</th>
                        <th scope="col" className="py-2 font-normal">Deal-breaker</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.aspects.map((a) => (
                        <tr key={a.aspect} className="border-b border-hairline">
                          <th scope="row" className="py-2 font-normal">{getAspect(a.aspect)!.label}</th>
                          <td className="py-2">{a.dealBreaker ? 'Yes' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </Section>

          <Section id="verdict" title="How is the verdict decided?">
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                Fewer than {RULES.confidence.medium} counted reviews: <strong>{verdictMeta['thin-data'].label}</strong>.
                We say so rather than guess.
              </li>
              <li>
                A deal-breaker aspect with a problem rate of {formatPct(RULES.dealBreakerProblemRate)} or more — one in
                five reviewers reporting a problem: <strong>{verdictMeta.skip.label}</strong>, however good the rest is.
              </li>
              <li>
                Satisfaction score below {RULES.verdict.caveats}: <strong>{verdictMeta.skip.label}</strong>.
              </li>
              <li>
                Satisfaction score of {RULES.verdict.buy} or more with no notable con:{' '}
                <strong>{verdictMeta.buy.label}</strong>.
              </li>
              <li>
                Anything else: <strong>{verdictMeta['buy-with-caveats'].label}</strong>. A notable con is any aspect
                with a problem rate of {formatPct(RULES.notableConProblemRate)} or more.
              </li>
            </ol>
            <p className="mt-4">
              Apps get the same verdicts in app wording: &ldquo;Use it&rdquo; and &ldquo;Use it, with caveats&rdquo;
              instead of &ldquo;Buy&rdquo;.
            </p>
            <p className="mt-4">
              A pro or con is only published when at least {RULES.minEvidencePerClaim} real reviews back it, and each one
              links to them. Products with fewer than {RULES.confidence.medium} counted reviews are kept out of search
              engines.
            </p>
          </Section>

          <Section id="voice" title="What does share of voice mean?">
            <p>
              Share of voice is a product&apos;s share of all the discussion in its category. For marketplaces we use the
              rating count each platform reports; for Reddit and YouTube we count the threads and videos we collected.
              Share of positive voice weights each product&apos;s voice by the share of its reviews that are positive.
            </p>
          </Section>

          <Section id="freshness" title="How fresh is the data?">
            <ul className="space-y-2">
              {leafCategories().map((c) => (
                <li key={c.slug}>
                  {c.name}: reviews refreshed every {c.refreshDays} days; prices checked more often.
                </li>
              ))}
            </ul>
            <p className="mt-4">
              The “updated” date on a page only moves when its verdict, pros and cons, scores or review count actually
              change.
            </p>
          </Section>
        </div>
      </Container>
    </PageShell>
  )
}
