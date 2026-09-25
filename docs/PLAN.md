# ReviewLens — Curated Review Aggregator, SEO/AEO-First

**v4** — the information architecture is now the primary design constraint. Products are curated in a CMS, an editor triggers a data fetch, reviews the drafted verdict, and publishes into a **siloed, entity-linked, semantically marked-up static site** built to be both ranked by search engines and cited by answer engines.

The central design principle: **structure is data, enforced by the CMS — never a checklist an editor is asked to remember.**

---

## 1. The goal, stated precisely

Two audiences, one structure:

- **Search engines** need clear topical silos, crawlable hub-and-spoke linking, unique content per indexable URL, and valid structured data.
- **Answer engines** (Google AI Overviews, ChatGPT, Perplexity, Claude) need extractable atomic facts, answer-first prose, question-shaped headings, stable citable anchors, explicit attribution, and honest freshness signals.

The good news: they want mostly the same thing, and this product is unusually well-suited to both. Computed statistics with named sources — *"23% of 1,050 reviews mention bloating (Amazon.in 847, Flipkart 203), concentrated in the unflavoured variant"* — are exactly the kind of sentence an answer engine quotes and links. That sentence format is an AEO asset; the pipeline already produces it (see §11).

The bad news: **thin programmatic pages are the failure mode that kills sites like this.** Every rule below exists to stop the CMS from being able to publish one.

---

## 2. Information architecture: silos and URLs

### Route map

```
/                                        Home — silo directory
/category/[silo]/                        Silo hub          /category/protein-supplements/
/category/[silo]/[sub]/                  Sub-hub           /category/protein-supplements/whey/
/reviews/[product]                       Product review    /reviews/muscleblaze-biozyme-performance-whey
/best/[query]                            Ranked list       /best/whey-protein-under-2000
/compare/[a]-vs-[b]                      Comparison        /compare/muscleblaze-biozyme-vs-on-gold-standard
/brands/[brand]                          Brand entity hub  /brands/muscleblaze
/topics/[aspect]                         Aspect hub        /topics/protein-powder-bloating
/methodology                             How we score — E-E-A-T anchor
/about · /editorial-policy · /sources    Trust pages
```

### Flat product URLs, silo carried by breadcrumbs and links

Nesting products inside their category (`/category/protein-supplements/whey/muscleblaze-biozyme`) makes the silo visible in the URL, but it costs you: every recategorisation becomes a redirect, URLs get deep, and a product that legitimately belongs to two categories has no clean home.

**Recommendation: flat `/reviews/[product]`, with the silo expressed through breadcrumbs, `BreadcrumbList` schema, and hub-and-spoke internal linking.** Internal linking is a considerably stronger topical signal than URL path segments, and it's the one you can change without a redirect. The `/reviews/` prefix also puts search intent in the path, which matches the actual query shape ("muscleblaze biozyme review").

If the taxonomy is genuinely stable and you prefer URL nesting, it's defensible — but then the `Redirect` collection (§8) stops being a nice-to-have and becomes load-bearing.

### Silo rules the CMS enforces

1. Every product has **exactly one primary category**. Secondary categories are allowed but do not generate breadcrumbs and do not count as a silo home.
2. A category cannot be assigned to a product **unless its hub page is published** with unique intro copy. No orphan silos.
3. Silo depth is capped at **3** (`silo → sub → product`). Deeper taxonomies get flattened, because click depth beyond 3 measurably suppresses crawl frequency.
4. Every indexable page is **≤3 clicks from home**. The CMS computes and displays click depth; the publish gate blocks anything deeper.
5. **Cross-silo linking is restricted to entity hubs** (brand, topic) and comparisons. Products in unrelated silos don't link to each other — that's what dissolves a silo into a soup.

### Page types are entity types

| Page type | Primary entity | Schema.org | Unique content requirement |
|---|---|---|---|
| Product review | `Product` | `Product` + `Review` + `BreadcrumbList` + `FAQPage` | Verdict, pros/cons, aspect analysis — unique by construction |
| Silo / sub hub | `Category` | `CollectionPage` + `ItemList` + `BreadcrumbList` | ≥300 words of genuine buying-guide intro |
| Ranked list | curated set | `ItemList` (ordered) + `FAQPage` | ≥250 words of selection rationale |
| Comparison | 2 `Product`s | `ItemList` + `BreadcrumbList` | ≥200 words of head-to-head judgement |
| Brand hub | `Brand` | `Brand` + `ItemList` | ≥200 words: who they are, what they're known for |
| Topic / aspect hub | `Thing` (aspect) | `Article` + `FAQPage` + `ItemList` | ≥400 words explaining the aspect |

**`/best/[query]` pages are the highest-leverage page type you have.** They match "best X" queries directly, they're the ordered-`ItemList` format answer engines reach for, and they're nearly free — the data already exists in your scored catalogue. Treat them as a first-class collection, not a report.

---

## 3. Entity model and relations

The site should read as a small knowledge graph, not a pile of pages. That means the entities are real CMS collections with typed relations — not strings in a text field.

```
                        ┌──────────┐
                        │  Brand   │
                        └────┬─────┘
                             │ manufactures
                             ▼
   ┌──────────┐  contains  ┌──────────┐  hasAspect  ┌──────────┐
   │ Category │───────────▶│ Product  │────────────▶│  Aspect  │
   └────┬─────┘            └────┬─────┘             └──────────┘
        │ parent/child           │ competesWith           ▲
        ▼                        ▼                        │ discusses
   ┌──────────┐  ranks     ┌──────────┐              ┌────┴─────┐
   │ Category │◀───────────│Collection│              │  Topic   │
   └──────────┘            │ (best-of)│              │   hub    │
                           └──────────┘              └──────────┘
```

**Collections and their typed edges:**

| Entity | Key relations | Why it's an entity, not a field |
|---|---|---|
| `Brand` | `manufactures → Product[]`, `sameAs` (Wikidata, official site) | Gives you a brand hub page, consistent naming sitewide, and an external identity anchor |
| `Category` | `parent`, `children`, `contains → Product[]`, `pack` | Silo root; owns the buying-guide content and the `CategoryPack` |
| `Product` | `brand`, `primaryCategory`, `aspects[]`, `competesWith[]`, `variants[]` | The core entity |
| `Aspect` | `appliesTo → Category[]`, `discussedBy → Product[]` | Turns "bloating" from a tag into a topic hub with real explanatory content |
| `Collection` | `ranks → Product[]` (ordered), `inSilo → Category` | Best-of pages as data, regenerable when scores change |
| `Comparison` | `products[2..4]`, `inSilo` | Comparison pages as data |
| `Author` | `reviewed → Product[]`, `sameAs` | E-E-A-T. A named human on every verdict, with a real profile |

**`sameAs` matters more than it looks.** Linking `Brand` to its Wikidata entity and official site, and `Author` to a real professional profile, is how you connect your entities to the wider graph. It's a one-time field per brand and it's the cheapest entity-disambiguation win available.

**E-E-A-T is not optional for a review site.** A named author on every verdict, a real `/methodology` page linked from every score block, a `/sources` page listing which marketplaces and platforms you aggregate, and an `Organization` with a `publishingPrinciples` link. Search engines and answer engines both weight this heavily for commercial-intent content, and you get it almost free because a human is already approving every page.

---

## 4. Internal linking as a computed graph

Editors will not remember to add links, and links added by hand are inconsistent and incomplete. **So no editor adds a navigational link.** The CMS stores typed relations; templates render links from them; the CMS reports on the resulting graph.

### Link generation rules

| From | To | Rule | Anchor text |
|---|---|---|---|
| Product | Silo + sub hub | Always — breadcrumb | Category name |
| Product | Brand hub | Always | Brand name |
| Product | 4 alternatives | Same silo, nearest composite score | Product name |
| Product | Comparisons it's in | Max 3 | "X vs Y" |
| Product | Topic hubs | One per aspect flagged notable | Aspect phrase ("bloating and digestion") |
| Product | `/methodology` | Always, from the score block | "how we score" |
| Silo hub | Top 12 products | Curated first, then by composite | Product name |
| Silo hub | Sub-hubs · parent · siblings | Always | Category names |
| Silo hub | Best-of pages in silo | Always | List title |
| Best-of | Its ranked products | Always, in order | Product name + rank |
| Topic hub | Products where aspect is notable | Computed, max 20 | Product name |
| Brand hub | All published products | Always | Product name |

**Anchor text comes from a template set with variation**, not one hardcoded string — identical anchors repeated sitewide is a footprint, and varied anchors carry more semantic range.

### Graph health, surfaced in the CMS

- **Orphans** — indexable pages with zero inbound internal links. Blocks publish.
- **Click depth** — computed from home; >3 blocks publish.
- **Inbound link count** per page, so you can see which pages are starved.
- **Outbound cap** — ~100 internal links per page. Beyond that, links stop distributing meaningful signal and the page reads as a directory.
- **Reciprocity** where it's meaningful (product ↔ comparison, product ↔ topic hub).
- **Broken internal links** — should be structurally impossible, since links come from relations, but assert it in CI anyway.

This is the concrete answer to "in-depth internal linking": a generated graph with health checks, not a habit.

---

## 5. Semantic HTML

The static output has no excuse for div soup. One product page, marked up honestly:

```html
<article itemscope itemtype="https://schema.org/Product">
  <nav aria-label="Breadcrumb"><ol> … </ol></nav>

  <header>
    <h1>MuscleBlaze Biozyme Performance Whey — Review</h1>
    <p class="answer">Worth buying for most people …</p>   <!-- answer-first -->
    <dl class="meta">
      <dt>Based on</dt><dd>1,050 reviews across 4 sources</dd>
      <dt>Updated</dt><dd><time datetime="2026-08-12">12 August 2026</time></dd>
      <dt>Reviewed by</dt><dd><a rel="author" href="/authors/…">…</a></dd>
    </dl>
  </header>

  <section id="verdict" aria-labelledby="h-verdict">
    <h2 id="h-verdict">Should you buy it?</h2> …
  </section>

  <section id="pros-cons" aria-labelledby="h-pros-cons">
    <h2 id="h-pros-cons">What reviewers consistently praise and criticise</h2>
    <ul class="pros"> <li>… <cite><a href="#rv-123">3 reviews</a></cite></li> </ul>
  </section>

  <section id="aspects" aria-labelledby="h-aspects">
    <h2 id="h-aspects">How it performs on each aspect</h2>
    <table><caption>…</caption><thead><tr><th scope="col">…</th></tr></thead> … </table>
  </section>

  <section id="alternatives" …> … </section>
  <section id="faq" …> … </section>
  <section id="reviews" …> … </section>
  <footer> methodology link · sources · disclosure </footer>
</article>
```

Non-negotiables: one `<h1>`; every `<section>` labelled by its heading via `aria-labelledby`; `<time datetime>` for every date; `<table>` with `<caption>` and `scope`d headers for aspect data; `<dl>` for fact pairs; `<figure>`/`<figcaption>` for charts; `<cite>` linking each claim to its evidence; `<nav aria-label>` on every nav region. **No content behind JavaScript** — trivially satisfied, since the page is static.

**Stable anchor ids on every section and every claim.** `#verdict`, `#pros-cons`, `#aspect-digestion`, `#rv-123`. This is what lets an answer engine deep-link a specific claim instead of the page, and it's how you become quotable rather than merely readable.

---

## 6. Structured data — including the part most sites get wrong

| Page type | Emit |
|---|---|
| Product review | `Product` (name, brand, gtin, image, offers) + `Review` (author, reviewRating, **positiveNotes**, **negativeNotes**, datePublished, dateModified) + `BreadcrumbList` + `FAQPage` |
| Silo hub | `CollectionPage` + `ItemList` + `BreadcrumbList` |
| Best-of | `ItemList` with `ListItem.position` + `FAQPage` |
| Comparison | `ItemList` + both `Product`s |
| Brand hub | `Brand` (+ `sameAs`) + `ItemList` |
| Topic hub | `Article` + `FAQPage` + `ItemList` |
| Sitewide | `Organization` (logo, sameAs, publishingPrinciples) + `WebSite` |

**`positiveNotes` / `negativeNotes` on `Review` is the feature built for exactly this product.** Google supports pros-and-cons markup on editorial product reviews and can surface it in rich results. Your pros and cons are already structured, cited lists — emit them.

### The `aggregateRating` trap

Do **not** emit `aggregateRating` built from reviews scraped off Amazon and Flipkart. Aggregate ratings are meant to represent reviews the site itself collected, and claiming third-party ratings as your own aggregate is the kind of thing that gets structured data ignored or penalised.

**Do this instead:** emit one `Review` whose `author` is your publication and whose `reviewRating` is **your editorial verdict score** — that's genuinely yours. Present the aggregated marketplace numbers as visible page content and in your own `<table>`/`<dl>` markup, clearly attributed per source ("Amazon.in: 4.3 from 847 ratings"). You lose nothing extractable — attributed source data is *more* citable than an unattributed blended star — and you stay clean.

---

## 7. Crawl control

A review site with filters is a crawl-trap generator. Decide this before the first page ships.

| Surface | Directive | Reasoning |
|---|---|---|
| Product · hub · best-of · comparison · brand · topic | **Index, follow** | The real pages |
| Review filters (source / aspect / rating) | **Client-side only, no URL change** | The page is static with reviews embedded — filtering needs no server round trip, so it generates no URLs to trap a crawler |
| Review pagination | **Top ~50 in HTML, rest via client-side chunk** | Avoids both thin `?page=N` pages and hiding all content from crawlers |
| Utility tags | **`noindex, follow`** | Navigational value without thin-page dilution |
| Curated collections (promoted tags) | **Index** | Only once they have intro copy and ≥8 products — see below |
| Internal search results | **`noindex`** | Never let these get indexed |
| `THIN DATA` products | **Editor's choice, default `noindex`** | A lever a live-crawling site never has: just don't publish weak pages |

**Tags need a promotion rule or they will dilute the site.** Most tags stay `noindex` filter helpers. A tag becomes an indexable `Collection` page only when an editor gives it unique intro copy and it has ≥8 published products. The CMS enforces the threshold — it won't let an editor tick "index" on a tag with four products and no copy.

**Sitemaps split by type** (`products`, `hubs`, `collections`, `comparisons`, `brands`, `topics`), each with accurate `lastmod` from `last_published_at`. Split sitemaps make indexing problems diagnosable per page type instead of a single opaque number.

### AI crawler access

See `robots.txt` in this repo. One rule, stated so nobody undoes it later: **AI search crawlers are deliberately not blocked.** `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `Claude-User` and `Google-Extended` are how those platforms retrieve pages to cite. Blocking any of them removes us from that platform's answers entirely — and citation is the distribution strategy, not a side effect of it.

Training-only crawlers (`GPTBot`, `ClaudeBot`, `CCBot`) are a separate, reversible decision. Currently allowed.

### One query per indexable page

Programmatic pages cannibalise each other by default. Store a `target_query` on every indexable page and **enforce uniqueness sitewide at the publish gate**, same as `title`. The specific collision to avoid here:

- `/category/supplements/whey-protein/` owns the bare informational query ("whey protein")
- `/best/…` pages must **always carry a qualifier** — a price band, a persona, or a use case

So `/best/whey-protein-under-2000` is fine; a bare `/best/whey-protein` is not, because it competes with its own category hub. The CMS refuses an unqualified best-of slug.

### Persona collections — the missing page type

`Collection` already supports best-of lists. Persona pages are the same entity with a different qualifier, so they cost no new infrastructure and are generated from aspect data the pipeline already computes:

```
/best/whey-protein-for-beginners
/best/protein-powder-for-lactose-intolerance
/best/whey-protein-for-weight-loss
/best/protein-powder-without-bloating
```

That last one is the interesting case — it's a ranking by an aspect score we compute and nobody else has. High-intent query, zero extra data.

---

## 8. The CMS

Payload CMS 3 inside the Next.js app, Postgres via Drizzle. (Directus remains the alternative if you'd rather the admin not be code-first.) What changes in v4 is that the CMS is now the **enforcement layer for the information architecture**, not just a catalogue editor.

### Collections

```
Editorial / entity
  Product          + primaryCategory (required), brand (required), aspects[],
                     competesWith[], slug (locked after publish)
  Category         + parent, hubIntro (rich text, min 300 words), pack, refresh_days
  Brand            + sameAs[], about (min 200 words)
  Aspect           + appliesTo Category[], explainer (min 400 words)
  Collection       + type (best-of | promoted-tag), inSilo, ranks Product[] (ordered),
                     rationale (min 250 words), indexable (gated)
  Comparison       + products[2..4], inSilo, judgement (min 200 words)
  Author           + bio, credentials, sameAs[]
  Tag              + indexable (false by default; gated on copy + count)

SEO infrastructure
  SeoMeta          per page: title, description, canonical, ogImage, robots,
                     validated on save (length + uniqueness across the site)
  Redirect         from, to, type (301|302), createdBy, reason — auto-created on slug change
  LinkEdge         derived: from, to, relation, anchorTemplate  (generated, read-only)
  GraphHealth      derived: page, clickDepth, inboundCount, isOrphan

Ops (unchanged from v3)
  Analysis (versioned) · FetchJob · SourceRoute · ProviderCredential
```

`Review` and `ReviewAspect` remain pipeline-owned, written via Drizzle, surfaced in the admin as read-only views. (~10⁶ rows — a generic CRUD admin over them is the wrong tool.)

### The three CMS behaviours that make the IA real

**1. Slugs are locked and redirects are automatic.** A slug is editable until first publish, then locked. Changing it afterwards requires a reason and *automatically writes a 301* into the `Redirect` collection. Editors changing URLs without redirects is the single most common way a well-built site loses its rankings, and it's entirely preventable in the CMS.

**2. Structure is generated, not authored.** Editors write judgement — the verdict wording, the buying-guide intro, the comparison call. They never write a navigational link, a breadcrumb, a canonical, or a JSON-LD block. Those come from typed relations and templates. This is what keeps 1,000 pages consistent.

**3. The publish gate blocks on structure.** You already have an approval gate for the verdict (v3 §4). Extend the same gate with hard structural checks — a page that fails cannot be published, no override without an explicit logged reason:

```
CONTENT            ✓ answer-first paragraph present, ≤320 chars, states the verdict
                   ✓ ≥3 question-shaped H2s
                   ✓ ≥2 FAQ entries, each answer 40–60 words
                   ✓ unique-content minimum met for the page type

METADATA           ✓ title 30–60 chars, unique sitewide
                   ✓ meta description 120–158 chars, unique sitewide
                   ✓ exactly one H1, contains the primary entity name
                   ✓ self-referencing canonical
                   ✓ primary image with alt text + explicit dimensions

STRUCTURE          ✓ breadcrumb resolves to a published silo hub
                   ✓ click depth ≤ 3
                   ✓ ≥6 generated outbound internal links
                   ✓ ≥1 inbound link from a hub (not an orphan)
                   ✓ brand and primary category both set and published

SCHEMA             ✓ JSON-LD validates for the page type
                   ✓ no aggregateRating built from third-party reviews
                   ✓ dateModified = last_published_at

TRUST              ✓ named author assigned
                   ✓ methodology link present
                   ✓ affiliate disclosure present if any affiliate link exists
```

### Admin screens

```
/admin
├── Products            list · status · SEO health · click depth · inbound links
│   └── [id]  Details · Sources · Fetch · Analysis · SEO · Links · Reviews
├── Bulk import         paste URLs → draft products
├── Review queue        verdicts awaiting approval
├── SEO queue           published pages failing a check post-hoc
├── Stale queue         past refresh threshold
├── Silos               category tree · hub copy status · orphan report
├── Entities            Brands · Aspects · Authors
├── Collections         best-of lists · promoted tags · regenerate from scores
├── Comparisons         curated pairs · auto-suggested from adjacent scores
├── Link graph          depth map · orphans · inbound distribution · outbound caps
├── Redirects           audit trail
├── Providers           credentials · quota · breaker
└── Budget              spend · ceilings · kill switch
```

**The link graph screen earns its place.** At 1,000 pages you cannot reason about depth, orphans, and inbound distribution from a list view — and those three numbers are most of what determines whether the silo works.

---

## 9. AEO: being the source that gets cited

Answer engines need different things from a ranking algorithm. Cheap to provide, and mostly a content-shape discipline the publish gate can enforce.

- **Answer first.** The verdict is the opening paragraph, as a direct declarative sentence — not a preamble. Under 320 characters so it survives extraction whole.
- **Question-shaped H2s** matching real query language: *"Should you buy MuscleBlaze Biozyme?"*, *"Does it cause bloating?"*, *"Is it worth the price over regular whey?"*
- **Atomic, self-contained facts.** One fact per sentence, each carrying its own context. *"23% of 1,050 reviews mention bloating"* survives being lifted out of the page; *"as noted above, this is common"* does not.
- **Explicit attribution and counts** on every number, with the source named. This is what makes a claim quotable and what makes the citation point back to you.
- **Stable anchors** on every section and claim, so an answer can deep-link the specific fact.
- **`FAQPage` schema** on every product, hub, and topic page. Answers 40–60 words — long enough to be complete, short enough to extract.
- **Honest freshness.** Accurate `dateModified`, a visible "updated" date, and a stated review count. Answer engines discount undated commercial content, and rightly.
- **Markdown mirrors.** Serve `/reviews/[slug].md` alongside the HTML — a clean structured version of the same content. Nearly free, since the content is already structured, and it removes any parsing ambiguity for a crawler that prefers text.
- **`llms.txt`** at the root, indexing the site's structure and page types. An emerging convention with uncertain payoff, but it costs an afternoon — worth doing, not worth planning around.

**The thing that actually earns citations here is honesty.** "Not enough data to judge" and "4.3★ raw versus 3.9★ credibility-weighted" are differentiated, verifiable claims that no competitor's affiliate-farm page will make. Answer engines are increasingly good at preferring sources that qualify their claims. That's a content strategy, and it's also just the correct engineering.

---

## 10. Freshness (from v3, with SEO signals added)

A curated catalogue rots silently, and staleness is now both a data-quality problem *and* a ranking problem.

- **`refresh_days` per category:** electronics and supplements 2–4 weeks; beauty and fashion 4–6; furniture and appliances 8–12.
- **Price on its own daily/weekly lane** — one page fetch, ~$0.01, and the field users notice first when it's wrong.
- **Incremental, newest-first:** fetch newest reviews, stop at the first known `external_id`. A refresh costs roughly 5% of an initial crawl.
- **`dateModified` only moves when content actually changed.** Bumping it on every no-op refresh is a transparent freshness trick and gets discounted. Move it when the verdict, pros/cons, aspect scores, or review count materially change; leave it alone otherwise.
- **Sitemap `lastmod` follows the same rule.**
- Visible on the page: *"Based on 1,050 reviews, updated 12 August 2026."*

---

## 11. Pipeline, verdict, providers

Unchanged from v3 — settled and documented there. In brief:

**Six stages:** `FETCH → NORMALISE → ENRICH → AGGREGATE → SYNTHESISE → ALTERNATIVES`, triggered from the admin. `CategoryPack` (aspects, weights, deal-breakers, sources, value metric, thresholds, refresh cadence) parameterises fetch, enrich, and aggregate.

**Aggregate is code-only.** Composite rating, confidence, aspect frequencies, and value score are computed, never generated. Every published statistic traces to rows — which is precisely what makes the page citable.

**Synthesis requires ≥2 evidence IDs per claim**, validated against the input set, reject-and-retry on an unresolvable citation. The editor gate is a second net for judgement, not a substitute for this one.

**Surface one verbatim review quote under each pro and con.** The Princeton GEO study (KDD 2024) puts quotations in the top three citation drivers alongside statistics and cited sources — and we already hold both the quote and the link. Rendering one short line of the actual review under each claim costs nothing and turns a summary into visible evidence. Pick the highest-credibility review already in that claim's evidence list.

**Stratified sampling:** aspects extracted from ~300 reviews by rating band × recency; all reviews stored and displayed.

**Verdict:** rules first (pack thresholds, deal-breakers), model second (prose + citations). States: Buy / Buy-with-caveats / Skip / Thin-data.

**Providers:** Bright Data + Apify behind one adapter interface, keys leased from a credential broker with per-provider circuit breakers, Zod validation on every adapter output, raw payloads in R2 so re-parses are free.

**Fake-review handling:** burst detection, distribution shape, generic-text signature, unverified clustering, incentivised markers, cross-product author reuse. Publish both numbers — raw and credibility-weighted.

---

## 12. Data model additions

On top of v3's schema:

```
Brand             id, slug, name, about, same_as[], logo, published
Aspect            id, slug, label, explainer, applies_to_category[], published
Author            id, slug, name, bio, credentials, same_as[]
Collection        id, slug, type, in_silo, rationale, ranked_product_ids[],
                  indexable, auto_regenerate, last_regenerated_at
Comparison        id, slug, product_ids[], in_silo, judgement, published
SeoMeta           id, page_type, page_id, title, description, canonical,
                  og_image, robots, validated_at, validation_errors jsonb
Redirect          id, from_path, to_path, code, reason, created_by, created_at
LinkEdge          from_page, to_page, relation, anchor_template   (derived)
GraphHealth       page, click_depth, inbound_count, is_orphan, computed_at

Product           + brand_id, primary_category_id, secondary_category_ids[],
                    aspect_ids[], competes_with[], author_id,
                    slug_locked, answer_paragraph, faq jsonb
Category          + hub_intro, hub_word_count, published
```

`LinkEdge` and `GraphHealth` are derived tables, rebuilt on publish. Never hand-edited — that's the whole point.

---

## 13. Delivery phases

SEO structure is **not a later phase**. Silos, entities, schema, and the publish gate must exist before the first page is indexed, because retrofitting an IA onto 500 published pages means 500 redirects and a ranking dip you didn't need.

**Phase 0 — spike (3–4 days).** One product end to end: script → drafted verdict → a single hand-built page with full semantic markup and JSON-LD. Validate the schema, then answer honestly: is this verdict better than reading the star rating? Rework now if not.

**Phase 1 — the operator loop, structurally correct (3–4 weeks).** Payload with `Product`, `Category`, `Brand`, `Author` · resolution assist from a pasted URL · bulk import · both providers behind the broker · full-fetch workflow · sampled extraction · rules verdict · **review-and-publish gate including the structural checks** · semantic static product page with complete JSON-LD · silo hubs with intro copy · generated breadcrumbs and internal links · split sitemaps · slug locking and automatic redirects. **Two divergent category packs** plus generic.

Longer than v3's Phase 1 by about a week, and worth every day of it.

**Phase 2 — entity depth and editorial tooling (2–3 weeks).** `Aspect` topic hubs · `Collection` best-of pages generated from scores · `Comparison` pages · link graph screen with orphan and depth reporting · SEO queue · review queue · analysis versioning and editor edits · fake-review scoring · Hinglish · dedupe · derived tags with the promotion rule.

**Phase 3 — AEO and freshness (2 weeks).** FAQ generation and validation · answer-first enforcement · markdown mirrors · `llms.txt` · scheduled refresh per cadence with the `dateModified` discipline · price fast lane · stale queue · auto-republish on unchanged verdict · `/methodology`, `/sources`, author pages.

**Phase 4 — growth.** Affiliate links with disclosure · price-drop alerts · saved comparisons · more packs and silos · editor roles and audit log.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| **Thin programmatic pages** | Per-page-type unique-content minimums enforced at the publish gate. The tag promotion rule. `THIN DATA` products default to `noindex` — a lever a live-crawling site never has. |
| **Slug changes without redirects** | Slugs lock at first publish; changing one auto-writes a 301. Not a policy — a mechanism. |
| **Silo dissolving into a soup** | One primary category per product, cross-silo links restricted to entity hubs and comparisons, depth capped at 3, orphan and depth checks block publish. |
| **Faceted filters generating crawl traps** | Filters are client-side only with no URL change. Structurally impossible rather than disallowed. |
| **`aggregateRating` from scraped reviews** | Emit your own editorial `Review` rating only; present marketplace numbers as attributed content. Gate checks for this explicitly. |
| **Catalogue goes stale** | Per-category cadence, stale queue, honest `dateModified` discipline, visible update date. |
| **Editorial throughput is the real bottleneck** | At 20 min/product, 1,000 products is 330 hours — far more than the ~$700 of provider spend. Bulk import, auto-republish, generated structure, and rule-transparent verdicts all exist to cut it. Measure minutes-per-product in Phase 1. |
| Payload owning tables it shouldn't | Explicit split; pipeline writes high-volume tables via Drizzle, admin gets read-only views |
| Provider schema drift | Zod validation per adapter, golden-file CI tests, alert on validation-failure rate, raw payloads retained |
| Pack sprawl | Inheritance from a root pack; two divergent packs in Phase 1 to force the abstraction |
| Brand legal complaint | Deterministic explainable verdicts, excerpt-only display with attribution, named editor on record, visible correction path |

---

## 15. Assumptions to confirm

1. **Flat `/reviews/[product]` URLs**, silo carried by breadcrumbs and generated internal links rather than URL nesting. Reversible before launch; expensive after.
2. **No `aggregateRating` from third-party reviews** — your editorial verdict is the only rating you mark up as yours.
3. **Payload CMS 3** inside the Next.js app, Postgres as the single datastore.
4. **The publish gate is hard** — structural failures block publication, with overrides logged. The gate is the mechanism that keeps 1,000 pages consistent; a soft gate is no gate.
5. **Approval-gated publication**; refreshes auto-republish when the verdict is materially unchanged.
6. **Public frontend fully static** (SSG + on-demand revalidation on publish). No user action triggers a provider or model call.
7. **India-first**, `en-IN`, no internationalisation in v1.
8. **Named human authors** on every verdict — required for the E-E-A-T posture above, and it needs real people with real profiles, not a house byline.
9. Target catalogue size and silo count for Phase 3 planning to be set explicitly — it drives refresh budget and editorial staffing more than anything else here.
