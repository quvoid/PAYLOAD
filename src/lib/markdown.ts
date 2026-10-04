import {
  allBestOf,
  allComparisons,
  allProducts,
  allSources,
  allTopics,
  getAuthor,
  getBrand,
  getCategory,
  getProduct,
  isApp,
  listedChildren,
  listedSilos,
} from './catalog'
import { formatDate, formatPct, formatPrice, formatRate, formatRating, formatScore } from './format'
import {
  aspectStats,
  claimEvidence,
  claimQuotes,
  compositeScore,
  confidence,
  countedReviews,
  lowestOffer,
  marketplaceAverage,
  sourceById,
  sourcesUsed,
  suspiciousCount,
  weightedRating,
} from './metrics'
import { routes } from './routes'
import { absoluteUrl, SITE } from './seo'
import { settings } from './store'
import type { Product } from './types'
import { verdictLabel } from './verdict'

// Plain-text versions of the site for answer engines and AI tools (docs/PLAN.md §9): /llms.txt
// indexes the site, and /reviews/<product>.md mirrors each review. Same facts as the HTML, each
// sentence self-contained and attributed, so it survives being quoted on its own.

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n+/g, ' ')

/** Products a reader can see: published, and with enough data to have a verdict worth citing. */
const citable = () => allProducts().filter((p) => !p.draft && p.verdict !== 'thin-data')

export const markdownPath = (slug: string) => `${routes.product(slug)}.md`

/** One review as Markdown, mirroring /reviews/<slug>. */
export function productMarkdown(p: Product): string {
  const category = getCategory(p.category)!
  const brand = getBrand(p.brand)!
  const author = getAuthor(p.author)
  const app = isApp(p)
  const counted = countedReviews(p)
  const used = sourcesUsed(p)
  const quotes = claimQuotes(p)
  const market = marketplaceAverage(p)
  const lowest = lowestOffer(p)
  const thin = p.verdict === 'thin-data'
  const lines: string[] = [
    `# ${p.name} review`,
    '',
    `> ${p.answer}`,
    '',
    `- **Verdict:** ${verdictLabel(p.verdict, app)}`,
    ...(thin ? [] : [`- **Satisfaction score:** ${formatScore(compositeScore(p))} out of 10 (${confidence(p)} confidence)`]),
    `- **Based on:** ${counted.length.toLocaleString('en-IN')} reviews from ${used.map((s) => s.name).join(', ')}; ${suspiciousCount(p)} more were set aside as likely manipulated`,
    `- **Credibility-weighted rating:** ${formatRating(weightedRating(p))} out of 5 (store average ${formatRating(market.rating)} across ${market.total.toLocaleString('en-IN')} ratings)`,
    `- **Category:** ${category.name} · **Brand:** ${brand.name} · **Variant:** ${p.variant}`,
    ...(lowest && lowest.price > 0 ? [`- **Lowest price:** ${formatPrice(lowest.price)} at ${sourceById(lowest.source).name} (checked ${formatDate(lowest.checkedAt)})`] : []),
    `- **Updated:** ${formatDate(p.updatedAt)}${author ? ` · **Approved by:** ${author.name}, ${author.role}` : ''}`,
    `- **Full page:** ${absoluteUrl(routes.product(p.slug))}`,
    '',
    `## ${app ? `Should you use ${p.name}?` : `Should you buy the ${p.name}?`}`,
    '',
    ...p.verdictBody.flatMap((para) => [para, '']),
  ]

  const claims = p.claims.filter((c) => quotes.has(c))
  for (const [title, sentiment] of [
    ['What reviewers praise', 'positive'],
    ['What reviewers criticise', 'negative'],
  ] as const) {
    const list = claims.filter((c) => c.sentiment === sentiment)
    if (!list.length) continue
    lines.push(`## ${title}`, '')
    for (const c of list) {
      const e = claimEvidence(p, c)
      const q = quotes.get(c)!
      lines.push(
        `- **${c.text}** — mentioned by ${formatPct(e.share)} of reviewers (${e.count} reviews). “${esc(q.body)}” — ${q.author}, ${sourceById(q.source).name}`,
      )
    }
    lines.push('')
  }

  const stats = aspectStats(p).filter((s) => s.scored)
  if (stats.length) {
    lines.push(
      `## How it performs on what matters for ${category.name}`,
      '',
      '| Measure | Mentioned by | Reviewers reporting a problem | Positive when mentioned |',
      '|---|---|---|---|',
      ...stats.map(
        (s) => `| ${s.aspect.label}${s.dealBreaker ? ' (deal-breaker)' : ''} | ${formatPct(s.mentionShare)} | ${formatRate(s.problemRate)} | ${formatPct(s.positiveShare)} |`,
      ),
      '',
    )
  }

  if (p.offers.some((o) => o.price > 0)) {
    lines.push('## Where to buy', '', ...p.offers.map((o) => `- ${sourceById(o.source).name}: ${o.inStock ? formatPrice(o.price) : 'out of stock'}`), '')
  }

  if (p.faq.length) {
    lines.push('## Questions', '', ...p.faq.flatMap((f) => [`### ${f.q}`, '', f.a, '']))
  }

  lines.push(
    '---',
    '',
    `Every figure above is counted from reviews by code; the verdict comes from fixed rules and a named editor approves the wording. Method: ${absoluteUrl(routes.methodology())}. ${SITE.name} earns no affiliate commission.`,
    '',
  )
  return lines.join('\n')
}

/** /llms.txt — what the site is and where everything lives (llmstxt.org format). */
export function llmsTxt(): string {
  const products = citable()
  const reviews = products.reduce((n, p) => n + countedReviews(p).length, 0)
  const sourceNames = allSources().map((s) => s.name)
  const sourceList = `${sourceNames.slice(0, -1).join(', ')} and ${sourceNames.at(-1)}`
  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${settings.metaDescription || SITE.description}`,
    '',
    `${SITE.name} reads every review of a product it can find (${sourceList}), sets aside the ones that look manipulated, counts what reviewers actually say and gives one verdict: Buy, Buy with caveats, Skip, or Not enough data. ${products.length} products are reviewed from ${reviews.toLocaleString('en-IN')} counted reviews. Every percentage is computed by code; a named editor approves every verdict. Product reviews are also available as Markdown at the addresses below.`,
    '',
    '## How we score',
    '',
    `- [Methodology](${absoluteUrl(routes.methodology())}): the rules that turn counted reviews into a verdict`,
    `- [Sources](${absoluteUrl(routes.sources())}): where reviews come from and how much each counts`,
    '',
    '## Categories',
    '',
    ...listedSilos().flatMap((s) => [
      `- [${s.name}](${absoluteUrl(routes.category(s))}): ${s.tagline}`,
      ...listedChildren(s.slug).map((c) => `  - [${c.name}](${absoluteUrl(routes.category(c))}): ${c.tagline}`),
    ]),
    '',
    '## Product reviews',
    '',
    ...products.map(
      (p) =>
        `- [${p.name}](${absoluteUrl(markdownPath(p.slug))}): ${verdictLabel(p.verdict, isApp(p))}, ${formatScore(compositeScore(p))}/10 from ${countedReviews(p).length.toLocaleString('en-IN')} reviews (${getCategory(p.category)!.name})`,
    ),
    '',
    '## Ranked lists',
    '',
    ...allBestOf().map((b) => `- [${b.title}](${absoluteUrl(routes.best(b.slug))})`),
    '',
    '## Head-to-head comparisons',
    '',
    ...allComparisons().flatMap((c) => {
      const [a, b] = c.products.map((s) => getProduct(s))
      return a && b ? [`- [${a.name} vs ${b.name}](${absoluteUrl(routes.compare(c.slug))})`] : []
    }),
    '',
    '## Guides',
    '',
    ...allTopics().map((t) => `- [${t.title}](${absoluteUrl(routes.topic(t.slug))})`),
    '',
    '## Optional',
    '',
    `- [Sitemap](${absoluteUrl('/sitemap.xml')})`,
    '',
  ]
  return lines.join('\n')
}
