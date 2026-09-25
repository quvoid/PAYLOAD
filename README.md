# ReviewLens

ReviewLens collects every review of a product from across the internet (Amazon, Flipkart, brand stores, Reddit, YouTube), sets aside the ones that look manipulated, counts what people actually say, and gives a straight answer: **Buy**, **Buy with caveats**, **Skip**, or **Not enough data**. Every number is computed by code, and every verdict is approved by a named editor.

- New to the project? Start with [docs/README.md](docs/README.md), the plain-language overview.
- The full technical spec is [docs/PLAN.md](docs/PLAN.md).
- The visual design system is [DESIGN.md](DESIGN.md).

## Status — 25 September 2026

| Area | State |
|---|---|
| Public site | Built. Every page type from the plan, running on **fictional sample data** (`src/data`). Fully static. |
| Payload admin | Scaffolded (Payload 3.90, `Users` + `Media` only). ReviewLens collections not built yet. |
| Database | Neon Postgres via `@payloadcms/db-postgres`. Not connected yet — add the connection strings to `.env`. |
| Scrapers | Existing scraper code to be integrated. The Amazon scraper runs a headful browser, so it needs a long-running server, not Vercel functions. |
| Hosting | Local for now; Vercel later. |

## Stack

| | |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack) |
| CMS / admin | Payload 3.90, inside the same Next.js app at `/admin` |
| Database | Neon (serverless Postgres) |
| Styling | Tailwind CSS 4.3, with tokens from `DESIGN.md` |
| Fonts | Inter (variable) + Noto Sans Devanagari, via `next/font` |
| Package manager | pnpm 10 (pinned in `package.json` → `packageManager`) |

## Getting started

Requires Node 20.9+ and Corepack (bundled with Node).

```bash
corepack enable          # picks up the pinned pnpm 10 automatically
cp .env.example .env     # then fill in the values below
pnpm install
pnpm dev                 # http://localhost:3000
```

The public site runs **without a database**, since it reads the sample catalogue. `/admin` needs `DATABASE_URL`.

Payload 3.90 supports pnpm 9–11. pnpm 12 ignores the build-script allow-list in `package.json`, so let Corepack use the pinned version.

### Environment variables

| Variable | Used for |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (connection pooling on). The app uses it at runtime. |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string. For migrations and schema work. |
| `PAYLOAD_SECRET` | Signs Payload auth tokens. Generate with `openssl rand -hex 32`. |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemaps and JSON-LD. |

Point local development at a Neon **dev branch**, never the production branch.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm lint` | ESLint (Next 16 flat configs) |
| `pnpm exec tsc --noEmit` | Type-check |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` from the Payload config |
| `pnpm generate:importmap` | Regenerate the admin import map after adding admin components |
| `pnpm payload migrate:create` / `pnpm payload migrate` | Create / run database migrations |
| `pnpm test` | Vitest integration tests + Playwright e2e tests |

## Project structure

```
DESIGN.md                    Visual design system (tokens + components), Google design.md format
docs/                        Planning docs: overview, PLAN v4 spec, architecture + sitemap diagrams, robots.txt
src/
├── app/
│   ├── (frontend)/          Public site — every route is statically generated
│   │   ├── page.tsx                 Home (night track)
│   │   ├── category/[silo]/…        Top-level and sub-category hubs
│   │   ├── reviews/[product]/       Product review — the core page
│   │   ├── best/[slug]/             Ranked lists
│   │   ├── compare/[slug]/          Head-to-head pairs and whole-category tables
│   │   ├── brands/ topics/ authors/ Entity hubs
│   │   └── methodology/ sources/    Trust pages
│   ├── (payload)/           Payload admin + REST/GraphQL API (template)
│   ├── robots.ts            Mirrors docs/robots.txt
│   └── sitemap.ts           One sitemap per page type → /sitemap/[type].xml
├── components/              UI: site chrome, review components, comparison tables, review list
├── data/                    SAMPLE DATA — fictional catalogue + a seeded review generator
├── lib/
│   ├── catalog.ts           The read API every page uses (swap for Payload queries here)
│   ├── metrics.ts           Every number on the site is computed here
│   ├── rules.ts             Every threshold (the methodology page renders these values)
│   ├── seo.ts               Metadata, JSON-LD builders, sitemap list
│   └── routes.ts            Every URL shape, in one place
├── collections/             Payload collections (Users, Media so far)
└── payload.config.ts
```

## How the frontend works

**Pages only read through `src/lib/catalog.ts`.** Today it serves the sample catalogue in `src/data`. When the Payload collections exist, rewrite that file's function bodies as Payload Local API queries and the pages don't change. The types in `src/lib/types.ts` mirror the planned collections.

**Numbers come from code, never from prose.** `src/lib/metrics.ts` computes everything:

- **Marketplace average vs credibility-weighted rating.** The first is the platforms' own rating, weighted by their rating counts. The second is our average of collected ratings, weighted by credibility and source (brand stores are down-weighted).
- **Aspect scores.** An aspect's score is the share of its mentions that are positive, with neutral mentions counting as half. The composite score is the category-weighted average of aspect scores.
- **Share of voice (SOV).** A product's share of its category's discussion. It uses each marketplace's reported rating count plus the Reddit/YouTube items we collected. **Share of positive voice** weights that by the share of reviews that are positive.
- **Suspicious reviews.** Reviews below the credibility threshold are flagged, shown with a label, and excluded from every count.

**Verdicts follow the rules in `src/lib/rules.ts`.** In order:

1. Too few reviews → Not enough data.
2. A deal-breaker aspect is mostly negative → Skip.
3. Composite score under 6 → Skip.
4. Composite score of 7.5 or more with no notable con → Buy.
5. Anything else → Buy with caveats.

Each review page shows which rule fired, under "Why this verdict".

**Search and AI-assistant features built in** (docs/PLAN.md §5–§9):

- Answer-first paragraph, question-shaped H2s, and stable anchors (`#verdict`, `#aspect-digestion`, `#rv-123`).
- JSON-LD `@graph` on every page.
- An editorial `Review` rating only — never `aggregateRating` built from other sites' reviews.
- `noindex` on Not enough data products.
- Review filters run client-side, so they never create crawlable URLs.
- Split sitemaps.
- AI search crawlers deliberately allowed in robots.

**Two canvas tracks** (DESIGN.md): the home page uses the indigo night track, and every other page uses the light track. The palette is electric aqua, indigo, deep pink, powder blush and peach fuzz, with contrast rules in DESIGN.md → Colors. After editing DESIGN.md, run `npx @google/design.md lint DESIGN.md`.

## Next steps

1. Create the Neon project and fill `.env`. Then build the Payload collections from docs/PLAN.md §8: Product, Category, Brand, Aspect, Collection, Comparison, Author, Redirect.
2. Register the high-volume pipeline tables (Review, ReviewAspect, SourceRun, PriceSnapshot) with Payload's Postgres adapter so migrations know about them.
3. Integrate the existing scrapers, including a server for the headful Amazon browser, then replace `src/data` with real data.
4. Background jobs (Inngest), writing-skill prompts, product images, markdown mirrors and `llms.txt`.

`next dev` writes `AGENTS.md` and `CLAUDE.md` (pointers for AI coding agents to the bundled Next.js docs). Set `agentRules: false` in `next.config.ts` to stop it.
