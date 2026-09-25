# ReviewLens

ReviewLens collects every review of a product from across the internet (Amazon, Flipkart, brand stores, Reddit, YouTube), sets aside the ones that look manipulated, counts what people actually say, and gives a straight answer: **Buy**, **Buy with caveats**, **Skip**, or **Not enough data**. Every number is computed by code, and every verdict is approved by a named editor.

- New to the project? Start with [docs/README.md](docs/README.md), the plain-language overview.
- The full technical spec is [docs/PLAN.md](docs/PLAN.md).
- The visual design system is [DESIGN.md](DESIGN.md).

## Status — 25 September 2026

| Area | State |
|---|---|
| Public site | Built. Every page type from the plan, running on **fictional sample data** (`src/data`). Fully static. |
| Payload admin | Running at `/admin` (Payload 3.90). Collections so far: `Users`, `Media`, `Review requests`. Catalogue collections not built yet. |
| Database | Neon Postgres via `@payloadcms/db-postgres`. Project `spring-meadow-84090481` (Singapore). Local dev uses the `dev` branch; `production` is kept clean for migrations. |
| Scrapers | Existing scraper code to be integrated. The Amazon scraper runs a headful browser, so it needs a long-running server, not Vercel functions. |
| Hosting | Vercel (free Hobby plan) with the Neon `production` branch. See [Deploying to Vercel](#deploying-to-vercel). |

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
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store for uploaded images. Vercel sets it when you connect a Blob store. Leave it unset locally: images are then saved to `/media`. |

Local development points at the Neon **`dev` branch**, never `production`. Under `pnpm dev` Payload syncs the schema automatically ("push"); nothing else does, not even `pnpm seed`. Production only ever changes through migrations.

The folder is linked to Neon with the `neon` CLI (`.neon` context file, `neon.ts` policy). Useful commands:

```bash
neon env pull                                   # refresh DATABASE_URL* in .env for the linked branch
neon link --project-id spring-meadow-84090481 --branch dev -y   # switch the linked branch
neon branches create --name <name>              # a throwaway branch to test a migration
```

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
| `pnpm seed` | Load the catalogue (`src/data`, `src/data/real`) into the database in `DATABASE_URL`. Safe to re-run. |
| `pnpm build:vercel` | Vercel's build: run pending migrations (over `DATABASE_URL_UNPOOLED`), then build |
| `pnpm test` | Vitest integration tests + Playwright e2e tests |

## Deploying to Vercel

`vercel.json` sets the build command, puts the server in Singapore (`sin1`, next to the Neon database) and builds **production only**: pushes to other branches are skipped, because a preview would need a database of its own.

### First deploy

1. **Neon:** open the `production` branch → **Connect**. Copy the pooled connection string (pooling on) and the direct one (pooling off).
2. **Vercel:** Add New → Project → import this repository. Leave the build settings alone; `vercel.json` sets them.
3. **Storage** tab → create a **Blob** store and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.
4. **Settings → Environment Variables**, for **Production** only:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | the pooled `production` string |
   | `DATABASE_URL_UNPOOLED` | the direct `production` string |
   | `PAYLOAD_SECRET` | a new one (`openssl rand -hex 32`), not your local one |
   | `NEXT_PUBLIC_SITE_URL` | the site's address, e.g. `https://reviewlens.vercel.app` |

5. **Deploy.** The build creates the tables on `production`, then builds an empty site.
6. Open `https://<your-site>/admin` and create your account. The first account is always an admin.
7. From your machine, load the catalogue into `production` (the direct string, in quotes):

   ```bash
   pnpm exec cross-env DATABASE_URL="<production direct string>" pnpm seed
   ```

8. Back in the admin, open **Settings → Site settings** and click **Save**. Every save refreshes the site's pages; this first one replaces the empty pages built in step 5.

Team members added in your local admin live in the `dev` database. Add them again in the live admin.

### Changing the schema

1. Change the collections and work against `dev` with `pnpm dev` as usual.
2. Before merging, run `pnpm payload migrate:create <what-changed>` and commit the new files in `src/migrations`.
3. Merge to `main`. The deploy runs the migration on `production` before building.

**Never run `pnpm dev` with `production` connection strings.** It syncs the schema directly and marks the database as dev-managed; the next deploy then waits forever at "It looks like you've run Payload in dev mode". If that happens, check `production` still matches the migrations, delete the row named `dev` from the `payload_migrations` table in Neon's SQL editor, and redeploy.

### Free plan limits

The Hobby plan is for personal, non-commercial use and has no team seats on Vercel (editors only need a Payload account, not a Vercel one). Move to Pro before turning on affiliate links. The scrapers keep running on your machine.

## Project structure

```
DESIGN.md                    Visual design system (tokens + components), Google design.md format
docs/                        Planning docs: overview, PLAN v4 spec, architecture + sitemap diagrams, robots.txt
src/
├── app/
│   ├── (frontend)/          Public site — every route is statically generated
│   │   ├── page.tsx                 Home (night track)
│   │   ├── [silo]/[sub]/            Category hubs at the root: /apps, /apps/payment-apps
│   │   ├── categories/              All categories (target of the header's Categories menu)
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
- **Problem rates and satisfaction.** For each aspect: how many of all reviewers report a problem with it. For the product: how positive all reviews are overall.
- **Share of voice (SOV).** A product's share of its category's discussion. It uses each marketplace's reported rating count plus the Reddit/YouTube items we collected. **Share of positive voice** weights that by the share of reviews that are positive.
- **Suspicious reviews.** Reviews below the credibility threshold are flagged, shown with a label, and excluded from every count.

**Verdicts follow the rules in `src/lib/rules.ts`.** Each aspect has a *problem rate*: the share of **all** counted reviewers who report a problem with it. It is not the share of those who mention it, because specific reviews are mostly complaints. The satisfaction score (0–10) is how positive all reviews are. In order:

1. Too few reviews → Not enough data.
2. A deal-breaker aspect with a problem rate of 20% or more → Skip.
3. Satisfaction under 6 → Skip.
4. Satisfaction of 7.5 or more and no aspect at 10% problem rate or more → Buy ("Use it" for apps).
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

**Apps are a category like any other.** The `Apps` section (Food Delivery Apps, UPI & Payment Apps) uses Google Play and the App Store as sources. Categories with `appCategory` set get app wording: "Use it" instead of "Buy", "Free" and "Where to get it", store rating counts instead of a price-per-unit figure, and `SoftwareApplication` structured data instead of `Product`. Verdict rules, share of voice and the publish logic are the same as for physical products.

**Search is catalogue-only.** `/search` looks through published products, brands and categories (`searchCatalogue` in `catalog.ts`) and is never indexed. Nothing is scraped when a reader searches. If their product isn't there, they can **request a review**. The server action in `src/app/(frontend)/search/actions.ts` saves it to the `review-requests` collection, merging repeat requests for the same product and counting them. The admin list (Editorial → Review requests) is sorted by demand. Public REST/GraphQL can't read or create requests.

**Two canvas tracks** (DESIGN.md): the home page uses the indigo night track, and every other page uses the light track. The palette is electric aqua, indigo, deep pink, powder blush and peach fuzz, with contrast rules in DESIGN.md → Colors. After editing DESIGN.md, run `npx @google/design.md lint DESIGN.md`.

## Real data pipeline (`pipeline/`)

Five real products (MuscleBlaze Biozyme, Minimalist SPF 50, boAt Airdopes 141 Gen 2, Zomato, PhonePe) are collected with the existing Python scrapers and shown as **drafts**. They are not approved, are hidden from search engines, and are left out of the sitemaps.

```bash
PY=/home/omkar/Desktop/agent-reach/.venv/bin/python   # has selenium, google-play-scraper, transformers
$PY pipeline/collect.py discover                      # find the Flipkart listings (title, price, rating)
$PY pipeline/collect.py collect --sources flipkart,apps,reddit [--only <slug>]
$PY pipeline/analyse.py [--only <slug>]               # → src/data/real/<slug>.json
```

- **Sources:** Flipkart (the Selenium scraper in `agent-reach`), Google Play and the App Store (`appstoreplay.py/scraper.py`), and Reddit (Reddit-wide relevance search). Up to 1,000 newest reviews per source, from the last two years.
- **Analysis:** every review and every sentence mentioning a topic gets a sentiment label from `cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual`, run locally, which handles Hindi and Hinglish. Topics are found by keyword rules per category. For payments, orders, delivery and crashes, a negative sentence only counts as a *problem* if it describes one. Deal alerts are dropped from Reddit.
- **Raw scrapes** stay in `pipeline/raw/` (git-ignored), with a sentiment cache, so re-analysing is fast and doesn't re-scrape.
- **Verdicts** are never stored. `src/lib/catalog.ts` runs every draft through the same rules as every other product. The draft wording lives in `src/data/real/editorial.ts` and contains no numbers.

## Next steps

1. Create the Neon project and fill `.env`. Then build the Payload collections from docs/PLAN.md §8: Product, Category, Brand, Aspect, Collection, Comparison, Author, Redirect.
2. Register the high-volume pipeline tables (Review, ReviewAspect, SourceRun, PriceSnapshot) with Payload's Postgres adapter so migrations know about them.
3. Integrate the existing scrapers, including a server for the headful Amazon browser, then replace `src/data` with real data.
4. Background jobs (Inngest), writing-skill prompts, product images, markdown mirrors and `llms.txt`.

`next dev` writes `AGENTS.md` and `CLAUDE.md` (pointers for AI coding agents to the bundled Next.js docs). Set `agentRules: false` in `next.config.ts` to stop it.
