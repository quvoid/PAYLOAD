# ReviewLens — What we're building, and why

Read this first. It explains the whole project in plain language. No technical
background needed. If you only read one document in this folder, read this one.

Last updated: 12 September 2026


---

## 1. The one-paragraph version

We're building a website that collects every review of a product from across the
internet — Amazon, Flipkart, YouTube, Reddit, brand stores — puts them all in one
place, and then tells you honestly whether to buy it. Not a star rating. An actual
answer: buy it, buy it but here's the catch, skip it, or we don't have enough
information to say. Every claim we make is backed by real reviews you can click
through and read yourself.


---

## 2. The problem

Say you want to buy a protein powder. Right now, here's what happens:

- Amazon shows you 4.3 stars from 847 reviews. Some of those reviews are fake.
- Flipkart shows you 4.1 from 203 reviews. Different people, different opinions.
- HealthKart shows 4.5 — but HealthKart is owned by the same company that makes
  MuscleBlaze, so of course it does.
- There are twelve YouTube videos about it, all 15 minutes long.
- There's a Reddit thread where three people say it gives them stomach trouble.
- The first five Google results are blog posts written to earn affiliate
  commission, all saying roughly "great taste, slightly expensive."

So you spend forty minutes reading, still aren't sure, and buy it anyway.

The information exists. It's just scattered, inconsistent, partly fake, and
nobody has done the work of weighing it and reaching a conclusion.

That's the work we're doing.


---

## 3. What a user actually sees

Someone searches "muscleblaze biozyme review" and lands on our page. From top to
bottom, they get:

**The product** — exact name, size, flavour, and what it costs right now on each
site that sells it.

**The answer, immediately.** First paragraph, no preamble: "Worth buying for most
people. Genuinely well-priced per gram of protein and the taste holds up, but
about a quarter of reviewers report bloating, and that complaint clusters heavily
in the unflavoured version."

**Two star ratings, not one.** The raw average (4.3) and our credibility-weighted
average (3.9), which discounts reviews that look manipulated. We show both and
explain the difference. Nobody else does this.

**How fresh this is.** "Based on 1,050 reviews across 4 sources, updated
12 August 2026." Stated plainly, because if we're showing you pre-collected data
you deserve to know how old it is.

**Pros and cons — with receipts.** Not vague. "Mixes cleanly with a shaker —
mentioned by 34% of reviewers" with a link to the actual reviews that said so.
Every single claim links to its evidence.

**A breakdown by what actually matters** for this kind of product: taste,
mixability, digestion, value for money, whether people received a fake, whether
the protein content matches the label. Different for every product category —
for a washing machine it'd be after-sales service and noise instead.

**What else to consider** — three or four genuine alternatives, scored on exactly
the same measures so the comparison is fair.

**All the reviews.** Filterable by source, star rating, or topic. Each one shows
an excerpt and links out to the original.

That's the whole product. Everything else in this document is about how we
produce that page reliably, cheaply, and at scale.


---

## 4. How it works, step by step

### Step 1 — Somebody adds a product

An editor (that's us, internally) opens the admin panel and pastes the Amazon
URL. The system reads that page and fills in the product name, sizes, flavours,
price, and image automatically. The editor confirms it's the right product and
adds four things:

    Category      Supplements → Whey Protein
    Brand         MuscleBlaze
    Tags          whey, isolate-blend, under-3000
    Other URLs    the Flipkart and HealthKart pages for the same product

**That is the entire admin input. Nothing else is ever typed by hand.**

No page title, no description, no URL, no links to other pages, no technical
markup, no write-up. Everything else on the finished page is produced by the
system from those four fields plus the review data. The admin's job is to say
*which product this is and where it belongs* — and then, much later at Step 7, to
approve what came out.

That's about two minutes of work.

### Step 2 — The system goes and collects everything

The editor clicks "Run full fetch." In the background, over the next minute or
two, the system pulls reviews from every source attached to that product. It uses
two paid services — Bright Data and Apify — that specialise in collecting this
data legally and reliably. For YouTube and Reddit we use their free official
APIs, because paying for something free is silly.

Typically this brings back 300–500 reviews per product.

### Step 3 — The system cleans them up

Reviews come in messy. Different sites use different rating scales. Lots of
Indian reviews are in Hindi or Hinglish ("bhai taste mast hai but bloating hota
hai") — we translate those for analysis but keep and show the original, because
those are often the most honest reviews on the page. Duplicates get removed. Spam
gets flagged.

### Step 4 — The system works out what people are actually saying

Every review gets read and tagged against a list of things that matter for that
category. For protein powder: taste, mixability, digestion, value, authenticity,
and so on. Each tag gets a sentiment — positive, negative, neutral.

This is the step that turns a pile of opinions into "23% of reviewers mention
bloating." That number is *counted*, not guessed. It's the most important thing
we produce.

### Step 5 — The system does the maths

The overall score, the confidence level, the score for each individual aspect,
and the value-for-money figure (rupees per gram of actual protein) are all
calculated by code. No AI involved in producing any number. This matters — see
section 7.

### Step 6 — The AI writes it up

Now, and only now, we use an AI model. Its job is narrow: take the numbers that
were already calculated and the reviews they came from, and write the pros, the
cons, and the verdict in readable English.

**Which AI we use.** Two services, with two API keys:

- **NVIDIA** (build.nvidia.com) — for the heavy, repetitive work. Reading and
  tagging hundreds of reviews per product is thousands of small calls, so it needs
  to be cheap and fast. This is where most of our AI usage goes.
- **OpenRouter** — for the final write-up, where quality matters more than cost.
  OpenRouter is a single door to many different models, so we can change which
  model writes our verdicts without changing any code.

Both speak the same API format, which means swapping a model is a settings
change, not a rebuild. Having two providers also means one going down doesn't
stop us — the other picks up.

**How it's told to write.** The house style comes from a separate **writing
skill** — a document that defines our tone, how a verdict should be structured,
what to say and what to avoid, and how blunt to be. *(To be supplied — this is
the one piece still outstanding.)* The system feeds that skill to the model as its
instructions, so if we later decide our verdicts should read differently, we edit
one document rather than hunting through code.

**What the writing skill can and cannot change.** It governs *style* — wording,
tone, structure, length. It can never override the factual rules, which are
enforced by code regardless of what any instruction says:

- Every claim must carry at least two real review IDs. If the model cites a
  review that doesn't exist, the output is rejected and it tries again.
- The model never produces a number. All statistics come from Step 5.

The AI explains conclusions the code already reached. It does not reach them.

### Step 7 — A human reads it before anyone else does

The draft lands in a review queue. An editor reads the verdict, checks it reads
fairly, tweaks the wording if needed, and hits Publish. Their name goes on the
page.

This is our biggest safety net. Because we're choosing which products to add
anyway, a person is already in the loop — so we may as well have them approve the
verdict before a single reader sees it.

### Step 8 — The page goes live as plain static HTML

The page is built once and served as a plain file. When a reader visits, nothing
is fetched, nothing is calculated, no AI runs. It just loads. Instantly, and at
essentially zero cost per visit.

### Step 9 — It gets refreshed on a schedule

Every few weeks (faster for electronics and supplements, slower for furniture)
the system fetches only the *new* reviews and recalculates. If the verdict hasn't
really changed, it republishes automatically. If the verdict flipped — a "buy"
became a "skip" — it goes back to a human.

Prices get checked far more often, daily or weekly, because a wrong price is the
first thing a reader notices and it costs almost nothing to check.


---

## 5. The one big decision: we choose the products in advance

We are *not* building a search box that goes and crawls the internet live when
somebody types a product name.

Instead we decide what's in our catalogue, collect the data ahead of time, and
serve finished pages.

This makes the whole thing dramatically simpler and better:

- **No waiting.** A live crawl takes 30–90 seconds. Our pages load instantly.
- **No surprise bills.** Costs happen when we press a button, not when traffic
  arrives. A page going viral costs us nothing.
- **No garbage pages.** The hardest technical problem in a live system is working
  out which product someone actually meant. We skip it entirely — a human tells
  us.
- **Nothing bad reaches a reader.** A person approves every page.
- **We can choose not to publish.** If a product only has eight reviews, we can
  simply not publish a confident-sounding page about it. A live system has no
  such option.

There are two costs to this choice, and we should be honest about both:

- **The catalogue goes stale if we don't maintain it.** In a live system a stale
  product fixes itself the next time someone searches. Here, nothing fixes itself
  unless we schedule it. A site full of authoritative-looking three-month-old
  data is worse than no site. This is why the refresh scheduling in Step 9 isn't
  optional.

- **Our own time becomes the bottleneck.** See section 9.


---

## 6. Who does what

The split is deliberate, and it's the core of the design.

**Humans decide and judge:**
- Which products go in the catalogue
- What category and brand each one belongs to, and which tags apply
  — *that four-field entry is the entire data-entry job (Step 1)*
- Whether the verdict reads fairly, and whether the wording is right
- The buying-guide text on category pages
- Whether to publish at all

**The machine does everything that has to be consistent:**
- Collecting and cleaning reviews
- Counting what people said
- Calculating every score
- Writing the first draft of the verdict, in the house style defined by the
  writing skill
- Building every internal link on the site
- Building breadcrumbs, page titles, and the structured data search engines read
- Checking 21 quality rules before a page can go live

An editor never types a link, never writes a page title from scratch, never
touches the technical markup. That's not to save them effort — it's because those
things have to be identical in shape across a thousand pages, and humans are bad
at that. Humans are good at judgement. Machines are good at consistency. We're
using each for what it's good at.


---

## 7. Why anyone should trust us

This is the whole business. If people don't trust the verdict, we have nothing —
there are already a hundred affiliate blogs saying "great product, buy now."

Four things make us different, and all four are engineering decisions, not
marketing:

**1. Every claim is traceable.** Click any pro or con and you see the actual
reviews it came from. No claim gets published without at least two real reviews
behind it, and that's checked automatically.

**2. No number comes from an AI.** All statistics are computed from the review
data by code. The AI writes sentences; it never counts. So when we say 23%, it's
23%.

**3. We handle fake reviews openly.** Review manipulation on Amazon India is
widespread — ignoring it would make our verdict *worse* than the star rating we're
trying to improve on. So we detect it (sudden bursts of 5-star reviews, suspicious
rating patterns, generic one-line text, the same reviewer praising a whole brand's
catalogue) and we publish both numbers: raw and adjusted. We show our working.

**4. "We don't know" is a real answer.** If a product has too few reviews to
judge, we say so instead of writing something confident and hollow. This costs us
a page. It buys us credibility, which is worth more.

Also: a named person approves every verdict, we publish a page explaining exactly
how we score things, and we publish a page listing every source we pull from. If
we ever earn affiliate commission, we say so on the page.


---

## 8. How people will find us

Two audiences, and they want roughly the same thing.

**Google.** Someone types "muscleblaze biozyme review" and we want to be the
result they click. That means the site has to be organised sensibly — products
grouped into categories, categories grouped into sections, everything reachable
in three clicks, every page genuinely different from every other page. Boring,
unglamorous structure work. It's most of what determines whether this succeeds.

**AI assistants.** Increasingly people ask ChatGPT or Google's AI "is MuscleBlaze
Biozyme any good?" and get an answer with a few sources cited underneath. We want
to be one of those sources. That means writing in a way that's easy to quote:
the answer in the first sentence, headings phrased as real questions, one fact per
sentence, every number with its source attached, and a stable link for every
individual claim so an AI can point at the exact fact rather than the page.

Here's the useful part: **the thing that makes us citable is the thing that makes
us honest.** A sentence like "23% of 1,050 reviews mention bloating (Amazon 847,
Flipkart 203)" is quotable precisely *because* it's specific and sourced. And
"we don't have enough data to judge this" is a distinctive, verifiable statement
that no affiliate farm will ever make. Being trustworthy and being findable turn
out to be the same project.

The site is organised like this:

    /                                      home
    /category/supplements/                 a section (we call it a silo)
    /category/supplements/whey-protein/    a category within it
    /reviews/muscleblaze-biozyme…          a product page
    /best/whey-protein-under-2000          a ranked list
    /compare/biozyme-vs-gold-standard      a head-to-head
    /brands/muscleblaze                    everything by one brand
    /topics/protein-powder-bloating        an article about one issue
    /methodology                           how we score
    /sources                               where our data comes from

The "best of" pages are worth calling out — they match what people actually
search for ("best whey protein under 2000"), they're exactly the format AI
answers like to quote, and they cost us almost nothing because the ranking already
exists in our data.

See sitemap.html in this folder for a picture of all of it.


---

## 9. What this costs, and what's actually scarce

**Money is not the problem.**

    Collecting and analysing one product, first time     $0.45 – $1.00
    Refreshing it later (only new reviews)               $0.05 – $0.15
    Checking the price                                   about $0.01
    Someone reading a published page                     $0.00

    1,000 products, all-in to get started                $450 – $1,000
    Keeping 1,000 products fresh                         $50 – $150 / month

Traffic adds nothing, because published pages are static files.

Most of that is the review data itself, not the AI. The AI portion is small and
gets smaller depending on which models we run through NVIDIA and OpenRouter — so
it's a dial we can turn later if we need to, not something to optimise now.

**Time is the problem.**

If it takes an editor 20 minutes to take a product from paste to published, then
1,000 products is 330 hours of human work. That's far more expensive than the
$700 of data costs.

So the single number that governs this project is **minutes per product.** We
should measure it from week one and treat every decision as either raising it or
lowering it. Bulk import, auto-republishing unchanged verdicts, generating all
the structure automatically, showing editors exactly which rule produced a
verdict so they can confirm rather than re-litigate — all of that exists to push
that number down.


---

## 10. What we're building it with

In plain terms:

- **One website** (Next.js) that serves both the public pages and the admin panel.
- **Payload CMS** for the admin panel — it lets us define the catalogue in code
  and get a working admin interface out of it, which saves weeks.
- **One database** (Postgres) holding everything.
- **Inngest** to run the collection jobs reliably in the background, so a
  flaky data source retries itself instead of losing the whole job.
- **Bright Data and Apify** to collect the review data. Two providers so if one
  fails or hits a limit, the other covers.
- **NVIDIA and OpenRouter** for the AI steps. NVIDIA handles the bulk reading and
  tagging of reviews, where we need cheap and fast. OpenRouter handles the final
  write-up, and gives us one door to many models so we can change our mind about
  which one writes our verdicts without touching code. Two keys, so one provider
  having a bad day doesn't stop us. Same pattern as the data providers.
- **A writing skill** (a document, not software) that defines how verdicts should
  read. Still to be supplied. It controls tone and structure only — the factual
  rules are enforced in code and can't be overridden by it.
- **Cloud file storage** to keep the raw data we bought. If we later find a bug in
  how we processed it, we can re-process for free instead of paying again.

The public site is static HTML. That's not a compromise — it's what makes it fast,
free to serve, and perfectly readable by search engines and AI crawlers.


---

## 11. What could go wrong

Honestly listed, most likely first.

**We let the catalogue go stale.** The most likely failure. Mitigated by scheduled
refreshes per category, a queue showing what's overdue, and a visible "last
updated" date on every page so we can't hide from it.

**Editorial work becomes the bottleneck and we stall at 80 products.** Mitigated by
measuring minutes-per-product early, bulk import from day one, and automating
everything that isn't judgement.

**We publish thin, low-value pages to hit a number.** This kills sites like ours.
Mitigated by hard minimums — a category page can't publish without real
buying-guide text, a product can't publish without a verdict, and thin-data
products default to being hidden from search engines.

**Somebody changes a URL and we lose our rankings.** The most common self-inflicted
wound on a site like this. Mitigated mechanically: URLs lock when a page is
published, and changing one automatically creates a redirect. It's not a rule
people have to remember.

**The AI writes a plausible but wrong criticism.** Mitigated by requiring real
review IDs on every claim, rejecting any that don't check out, and then a human
reading it. Both layers matter — an editor skimming forty bullet points will not
spot a fabricated citation, but the automatic check catches it every time.

**A data provider changes their format and we silently collect nulls.** Mitigated by
validating every response against an expected shape and alerting when the failure
rate rises.

**A brand's lawyers email us.** Mitigated by verdicts that follow published rules we
can explain, showing only short excerpts of reviews with links to the original, a
named editor on record for each page, and a visible way to request a correction.


---

## 12. How we'll know it's working

Early (first 3 months):

- Minutes per product, trending down
- Can we publish 20 products in a week without cutting corners
- Do our pages appear at all for "product name + review" searches
- The honest gut check: would you send our page to a friend who asked?

Later (6–12 months):

- Number of products where we rank on the first page of Google
- Whether AI assistants cite us when asked about products in our categories
- Return visitors, and people arriving via "best X" searches
- Affiliate revenue, once we turn it on

The real test is the gut check, and it should be applied from day one. If our
verdict isn't more useful than glancing at the star rating, none of the rest of
this matters.


---

## 13. The order we build in

**Phase 0 — Prove it works (3–4 days).** One product, done by hand, start to
finish. Then look at the output and answer honestly: is this better than just
reading the star rating? If not, we rethink the idea now, before building
anything.

**Phase 1 — The full loop, done properly (3–4 weeks).** An editor can paste a
URL and end up with a published page. Admin panel, both data providers,
collection and analysis, the verdict, the approval step, and the complete site
structure with correct titles, links, and search-engine markup. Two very
different product categories, on purpose, to make sure the system isn't secretly
built for just one.

**Phase 2 — Depth (2–3 weeks).** Brand pages, topic pages, best-of lists,
comparison pages, fake-review detection, Hindi/Hinglish handling, and the tools
editors need to work fast.

**Phase 3 — Freshness and AI-friendliness (2 weeks).** Scheduled refreshes,
price checking, FAQ sections, and the finishing touches that help AI assistants
quote us accurately.

**Phase 4 — Growth.** Affiliate links, price-drop alerts, more categories,
proper editor roles.

Note that the site structure and search-engine work happen in Phase 1, not later.
Retrofitting it onto 500 already-published pages means 500 redirects and a
ranking dip we never needed to have.

**One thing is still outstanding:** the writing skill (see Step 6). Phase 0 can
run on a rough placeholder style just to see whether the verdict is any good.
Phase 1 needs the real one, because the whole point of Phase 1 is producing pages
we'd actually publish. Everything else in the plan is decided.


---

## 14. The other files in this folder

- **README.md** — this file. Plain-language explanation of everything.
- **PLAN.md** — the full technical specification. Every decision, with reasons.
- **architecture.html** — 13 diagrams of how the system works internally.
- **sitemap.html** — a simple picture of the site structure with real examples.

The two HTML files are also published as web pages you can share:

- Architecture reference: https://claude.ai/code/artifact/8691a7cf-20f0-4e7e-ba28-d11349a2a66e
- Site structure: https://claude.ai/code/artifact/fabcefde-2760-4b42-bff5-4013492beca1


---

## 15. If you remember four things

1. **We collect reviews from everywhere, weigh them honestly, and give a real
   answer.** Not a star rating — a recommendation, with the evidence attached.

2. **We choose the products in advance and a human approves every verdict.** That
   makes the system simpler, cheaper, faster for readers, and much safer.

3. **Machines do the counting; people do the judging.** Every number is computed,
   never generated. Every page is approved, never auto-published. Every link is
   built by the system, never typed by hand.

4. **Being trustworthy and being findable are the same job.** The specific,
   sourced, appropriately-hedged sentences that make us worth reading are exactly
   the ones Google ranks and AI assistants quote. We don't have to choose.
