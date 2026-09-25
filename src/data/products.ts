import type { Product } from '@/lib/types'

import { generateReviews, type ReviewPlan } from './generate'

// SAMPLE DATA — fictional products. Prose (answer, verdict, pros/cons wording, FAQ) stands in for
// the editor-approved synthesis; every statistic on the site is computed from `reviews`.

type Seed = Omit<Product, 'reviews'> & { plan: Omit<ReviewPlan, 'updatedAt'> }

const seeds: Seed[] = [
  {
    slug: 'brawnly-performance-whey',
    name: 'Brawnly Performance Whey',
    shortName: 'Brawnly Performance',
    brand: 'brawnly',
    category: 'whey-protein',
    variant: '1 kg · Rich Chocolate',
    verdict: 'buy-with-caveats',
    answer:
      'Worth buying for most people. It is well priced per gram of protein and the chocolate flavour holds up, but digestion complaints are common enough to plan around — if whey usually upsets your stomach, start with a smaller tub or pick an isolate.',
    verdictBody: [
      'Brawnly Performance Whey clears the bar on taste, mixability and value, and nothing in its reviews points to fakes or a short-filled label. That covers most of what you want from an everyday whey.',
      "The catch is digestion. Bloating comes up far more often here than for the other whey proteins we track, and it is the complaint that makes people stop using a tub. If whey has troubled you before, the alternatives below with stronger digestion scores are the safer buy.",
    ],
    claims: [
      { aspect: 'taste', sentiment: 'positive', text: 'Chocolate flavour tastes like a milkshake, not chalky' },
      { aspect: 'mixability', sentiment: 'positive', text: 'Mixes cleanly in a shaker without lumps' },
      { aspect: 'value', sentiment: 'positive', text: 'Good value per gram of protein, especially on sale' },
      { aspect: 'digestion', sentiment: 'negative', text: 'Bloating and a heavy stomach after a scoop' },
    ],
    faq: [
      {
        q: 'Does Brawnly Performance Whey cause bloating?',
        a: 'It is the most common complaint in its reviews. Reviewers who describe themselves as lactose-sensitive report it most, while many others report no issues at all. Starting with half a scoop, or switching to an isolate, is the fix reviewers describe most often.',
      },
      {
        q: 'Is Brawnly Performance Whey good value for money?',
        a: 'Yes. Its price per 100 g of protein is among the lowest of the whey proteins we track, and value is one of the aspects reviewers praise most. Prices move with marketplace sales, so check the current price table before you buy.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '25 g' },
      { label: 'Serving size', value: '33 g' },
      { label: 'Pack size', value: '1 kg' },
      { label: 'Type', value: 'Concentrate + isolate blend' },
    ],
    valueQuantity: 757,
    offers: [
      { source: 'amazon', price: 2399, mrp: 3299, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 2449, mrp: 3299, inStock: true, checkedAt: '2026-09-24' },
      { source: 'brand-store', price: 2299, mrp: 3299, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.3, total: 847 },
      { source: 'flipkart', rating: 4.1, total: 203 },
      { source: 'brand-store', rating: 4.6, total: 312 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-06-02',
    updatedAt: '2026-09-12',
    plan: {
      seed: 11,
      profile: {
        taste: { mention: 0.45, positive: 0.8 },
        mixability: { mention: 0.3, positive: 0.85 },
        digestion: { mention: 0.35, positive: 0.5 },
        value: { mention: 0.35, positive: 0.8 },
        authenticity: { mention: 0.12, positive: 0.85 },
        'label-accuracy': { mention: 0.1, positive: 0.85 },
      },
      collect: { amazon: 44, flipkart: 20, 'brand-store': 10, reddit: 8, youtube: 6 },
      burst: 9,
    },
  },
  {
    slug: 'northpeak-gold-whey',
    name: 'Northpeak Gold Whey',
    shortName: 'Northpeak Gold',
    brand: 'northpeak',
    category: 'whey-protein',
    variant: '907 g · Double Rich Chocolate',
    verdict: 'buy',
    answer:
      'Buy it if you can pay the premium. It is the most consistent whey we track — it mixes instantly, sits easily on the stomach and tastes good across flavours. Buy from the brand-authorised seller, because fake tubs are a known problem.',
    verdictBody: [
      'Northpeak Gold Whey scores well on every measure we track, and its digestion score is one of the strongest in the category. Reviewers rarely have a bad word to say about the product itself.',
      'What they do mention is price and fakes. It costs noticeably more per gram of protein than the value picks, and authenticity complaints are real enough that the seller you buy from matters.',
    ],
    claims: [
      { aspect: 'mixability', sentiment: 'positive', text: 'Dissolves almost instantly, even in cold water' },
      { aspect: 'digestion', sentiment: 'positive', text: 'Easy on the stomach, including for sensitive reviewers' },
      { aspect: 'taste', sentiment: 'positive', text: 'Flavours taste good without being too sweet' },
      { aspect: 'value', sentiment: 'negative', text: 'Expensive per gram of protein' },
      { aspect: 'authenticity', sentiment: 'negative', text: 'Suspected fake tubs from third-party sellers' },
    ],
    faq: [
      {
        q: 'Is Northpeak Gold Whey worth the higher price?',
        a: 'If digestion or consistency matter most to you, reviewers suggest yes: it scores well on every measure we track. If you mainly want protein per rupee, the value picks in this category cost noticeably less per 100 g of protein for similar taste scores.',
      },
      {
        q: 'How do I avoid fake Northpeak Gold Whey?',
        a: 'Buy from the brand-authorised seller on each marketplace, check the seal and batch number, and verify the authenticity code on the tub. Most suspected fakes in reviews came from third-party sellers offering unusually deep discounts.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '24 g' },
      { label: 'Serving size', value: '30.4 g' },
      { label: 'Pack size', value: '907 g (2 lb)' },
      { label: 'Type', value: 'Isolate-led blend' },
    ],
    valueQuantity: 716,
    offers: [
      { source: 'amazon', price: 3299, mrp: 4299, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 3349, mrp: 4299, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.5, total: 2140 },
      { source: 'flipkart', rating: 4.4, total: 611 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-05-20',
    updatedAt: '2026-09-08',
    plan: {
      seed: 23,
      profile: {
        taste: { mention: 0.4, positive: 0.85 },
        mixability: { mention: 0.35, positive: 0.92 },
        digestion: { mention: 0.25, positive: 0.88 },
        value: { mention: 0.3, positive: 0.62 },
        authenticity: { mention: 0.25, positive: 0.72 },
        'label-accuracy': { mention: 0.1, positive: 0.9 },
      },
      collect: { amazon: 48, flipkart: 22, reddit: 12, youtube: 8 },
      burst: 3,
    },
  },
  {
    slug: 'avara-alpha-whey',
    name: 'Avara Alpha Whey',
    shortName: 'Avara Alpha',
    brand: 'avara',
    category: 'whey-protein',
    variant: '1 kg · Kulfi',
    verdict: 'buy',
    answer:
      'Buy it — it is the best value whey we track. It costs less per gram of protein than almost anything else, reviewers like the Indian flavours, and there is no pattern of digestion problems or fakes. Mixability is good rather than great.',
    verdictBody: [
      'Avara Alpha Whey wins on value without giving much away elsewhere. Taste reviews are positive, especially for the kulfi and malai flavours, and digestion and label accuracy both hold up.',
      'Mixability is the one area where it trails the premium picks: a few reviewers need a blender for lump-free shakes. For most people that is a fair trade for the price.',
    ],
    claims: [
      { aspect: 'value', sentiment: 'positive', text: 'Among the cheapest per gram of protein' },
      { aspect: 'taste', sentiment: 'positive', text: 'Indian flavours reviewers actually enjoy' },
      { aspect: 'digestion', sentiment: 'positive', text: 'No pattern of bloating complaints' },
      { aspect: 'mixability', sentiment: 'negative', text: 'Some lumps without a blender' },
    ],
    faq: [
      {
        q: 'Is Avara Alpha Whey genuine?',
        a: 'Authenticity complaints are rare in its reviews, and the brand sells through its own store as well as marketplaces. As with any supplement, check the seal and batch number when the tub arrives and buy from the brand-authorised seller where possible.',
      },
      {
        q: 'Which Avara Alpha Whey flavour is best?',
        a: 'Kulfi and malai kesar are the flavours reviewers praise most often. Chocolate reviews are more mixed, with some describing it as too sweet. Flavour preference is personal, so the smaller pack is a sensible first buy if you are unsure.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '25 g' },
      { label: 'Serving size', value: '34 g' },
      { label: 'Pack size', value: '1 kg' },
      { label: 'Type', value: 'Concentrate' },
    ],
    valueQuantity: 735,
    offers: [
      { source: 'amazon', price: 2099, mrp: 2999, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 2149, mrp: 2999, inStock: false, checkedAt: '2026-09-24' },
      { source: 'brand-store', price: 1999, mrp: 2999, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.2, total: 1320 },
      { source: 'flipkart', rating: 4.3, total: 402 },
      { source: 'brand-store', rating: 4.7, total: 190 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-06-18',
    updatedAt: '2026-09-18',
    plan: {
      seed: 37,
      profile: {
        taste: { mention: 0.5, positive: 0.82 },
        mixability: { mention: 0.25, positive: 0.8 },
        digestion: { mention: 0.2, positive: 0.85 },
        value: { mention: 0.45, positive: 0.92 },
        authenticity: { mention: 0.1, positive: 0.9 },
        'label-accuracy': { mention: 0.15, positive: 0.88 },
      },
      collect: { amazon: 46, flipkart: 20, 'brand-store': 8, reddit: 10, youtube: 6 },
      burst: 4,
    },
  },
  {
    slug: 'kettle-co-raw-whey',
    name: 'Kettle & Co. Raw Whey Unflavoured',
    shortName: 'Kettle & Co. Raw',
    brand: 'kettle-co',
    category: 'whey-protein',
    variant: '1 kg · Unflavoured',
    verdict: 'skip',
    answer:
      'Skip it. The price per gram of protein is tempting, but reviewers repeatedly report that the protein content falls short of the label, and taste and mixability complaints are common. The cheapest reliable alternative costs only a little more.',
    verdictBody: [
      'Label accuracy is a deal-breaker for us, and Kettle & Co. Raw Whey fails it: reviewers citing lab tests and short scoops outnumber those who say the label holds up.',
      'It is cheap, and some reviewers are happy with it as a budget unflavoured base. But at a small premium, the value picks in this category deliver the protein they promise.',
    ],
    claims: [
      { aspect: 'value', sentiment: 'positive', text: 'Low sticker price for a 1 kg tub' },
      { aspect: 'label-accuracy', sentiment: 'negative', text: 'Protein content below what the label claims' },
      { aspect: 'taste', sentiment: 'negative', text: 'Hard to drink with just water' },
      { aspect: 'mixability', sentiment: 'negative', text: 'Clumps unless blended' },
    ],
    faq: [
      {
        q: 'Why is Kettle & Co. Raw Whey marked Skip?',
        a: 'Label accuracy is one of our deal-breakers for protein. More reviewers report protein content below the label than confirm it, including several citing independent lab tests. When a product may not deliver the protein it claims, its low price stops being good value.',
      },
      {
        q: 'Is unflavoured whey worth it?',
        a: 'Unflavoured whey is useful for cooking and for mixing into smoothies, and it avoids sweeteners. It tastes of milk solids, so most people do not drink it with water alone. Check label accuracy scores first — cheap unflavoured tubs are where short-filling shows up most.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '24 g' },
      { label: 'Serving size', value: '30 g' },
      { label: 'Pack size', value: '1 kg' },
      { label: 'Type', value: 'Concentrate, unflavoured' },
    ],
    valueQuantity: 800,
    offers: [
      { source: 'amazon', price: 1599, mrp: 2199, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 1649, mrp: 2199, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 3.9, total: 618 },
      { source: 'flipkart', rating: 3.7, total: 150 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-07-04',
    updatedAt: '2026-09-02',
    plan: {
      seed: 41,
      profile: {
        taste: { mention: 0.35, positive: 0.25 },
        mixability: { mention: 0.3, positive: 0.35 },
        digestion: { mention: 0.3, positive: 0.6 },
        value: { mention: 0.4, positive: 0.75 },
        authenticity: { mention: 0.15, positive: 0.6 },
        'label-accuracy': { mention: 0.35, positive: 0.2 },
      },
      collect: { amazon: 40, flipkart: 18, reddit: 9, youtube: 5 },
      burst: 12,
    },
  },
  {
    slug: 'fitora-whey-isolate',
    name: 'Fitora Whey Isolate',
    shortName: 'Fitora Isolate',
    brand: 'fitora',
    category: 'whey-protein',
    variant: '1 kg · Cafe Mocha',
    verdict: 'thin-data',
    answer:
      "We don't have enough reviews to judge this one yet. The early reviews are positive, but there are too few of them — and too few sources — to separate a good product from a good launch. We'll publish a verdict once there's enough data.",
    verdictBody: [
      'Fitora Whey Isolate launched recently and has only a handful of reviews across two marketplaces. Early reviewers like the taste and report no digestion problems, which is what you would hope for from an isolate.',
      'A small, early sample is exactly where review manipulation is easiest and most effective, so we are not putting a verdict on it yet. This page updates automatically as reviews come in.',
    ],
    claims: [
      { aspect: 'taste', sentiment: 'positive', text: 'Early reviewers like the cafe mocha flavour' },
      { aspect: 'digestion', sentiment: 'positive', text: 'No early reports of bloating' },
    ],
    faq: [
      {
        q: 'Why is there no verdict for Fitora Whey Isolate?',
        a: 'It does not yet have enough reviews for us to judge it fairly. Below our minimum, a handful of enthusiastic early reviews can make a product look better than it is. We publish the data we have and add a verdict once there is enough of it.',
      },
      {
        q: 'Is whey isolate better than whey concentrate?',
        a: 'Isolate is filtered further, so it carries less lactose and fat and usually more protein per scoop. That makes it easier on the stomach for many people. It also costs more, so concentrate remains the better value if dairy does not bother you.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '27 g' },
      { label: 'Serving size', value: '31 g' },
      { label: 'Pack size', value: '1 kg' },
      { label: 'Type', value: 'Isolate' },
    ],
    valueQuantity: 871,
    offers: [{ source: 'amazon', price: 3999, mrp: 4999, inStock: true, checkedAt: '2026-09-24' }],
    platformStats: [
      { source: 'amazon', rating: 4.4, total: 64 },
      { source: 'flipkart', rating: 4.0, total: 11 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-09-10',
    updatedAt: '2026-09-21',
    plan: {
      seed: 53,
      profile: {
        taste: { mention: 0.5, positive: 0.85 },
        mixability: { mention: 0.3, positive: 0.85 },
        digestion: { mention: 0.3, positive: 0.9 },
        value: { mention: 0.3, positive: 0.5 },
        'label-accuracy': { mention: 0.1, positive: 0.9 },
      },
      collect: { amazon: 14, flipkart: 5, youtube: 2 },
    },
  },
  {
    slug: 'verdant-plant-protein',
    name: 'Verdant Plant Protein',
    shortName: 'Verdant Plant',
    brand: 'verdant',
    category: 'plant-protein',
    variant: '1 kg · Chocolate',
    verdict: 'buy-with-caveats',
    answer:
      "Buy it if you need a plant protein that is easy to digest — that is where it shines. But taste is the most common complaint by a distance: expect a gritty, earthy shake unless you blend it with milk or fruit.",
    verdictBody: [
      'Verdant Plant Protein does the job plant proteins exist for. Digestion reviews are excellent, and label accuracy holds up.',
      'Taste is the catch. Grittiness and an earthy aftertaste come up in a large share of taste mentions, and mixability is only middling. Reviewers who blend it into smoothies are much happier than those drinking it with water.',
    ],
    claims: [
      { aspect: 'digestion', sentiment: 'positive', text: 'Very easy on the stomach' },
      { aspect: 'label-accuracy', sentiment: 'positive', text: 'Protein content matches the label' },
      { aspect: 'taste', sentiment: 'negative', text: 'Gritty, earthy taste with water' },
      { aspect: 'mixability', sentiment: 'negative', text: 'Needs a blender for a smooth shake' },
    ],
    faq: [
      {
        q: 'Does Verdant Plant Protein taste good?',
        a: 'Taste is its weakest aspect. Many reviewers describe it as gritty or earthy when mixed with water. Reviewers who blend it with milk, banana or peanut butter are far more positive, so how you plan to drink it matters more than the flavour you pick.',
      },
      {
        q: 'Is plant protein easier to digest than whey?',
        a: 'For people who react to lactose, usually yes. Plant proteins contain no dairy, and in our data they score higher on digestion than most whey concentrates. Some people react to pea or soy instead, so a smaller pack is a sensible first buy.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '24 g' },
      { label: 'Serving size', value: '35 g' },
      { label: 'Pack size', value: '1 kg' },
      { label: 'Source', value: 'Pea + brown rice' },
    ],
    valueQuantity: 686,
    offers: [
      { source: 'amazon', price: 2299, mrp: 2999, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 2349, mrp: 2999, inStock: true, checkedAt: '2026-09-24' },
      { source: 'brand-store', price: 2199, mrp: 2999, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.0, total: 540 },
      { source: 'flipkart', rating: 3.9, total: 120 },
      { source: 'brand-store', rating: 4.5, total: 88 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-07-11',
    updatedAt: '2026-09-15',
    plan: {
      seed: 61,
      profile: {
        taste: { mention: 0.5, positive: 0.35 },
        mixability: { mention: 0.3, positive: 0.55 },
        digestion: { mention: 0.3, positive: 0.9 },
        value: { mention: 0.25, positive: 0.7 },
        'label-accuracy': { mention: 0.12, positive: 0.88 },
      },
      collect: { amazon: 40, flipkart: 16, 'brand-store': 8, reddit: 10, youtube: 6 },
      burst: 5,
    },
  },
  {
    slug: 'brawnly-plant-protein',
    name: 'Brawnly Plant Protein',
    shortName: 'Brawnly Plant',
    brand: 'brawnly',
    category: 'plant-protein',
    variant: '500 g · Vanilla',
    verdict: 'buy',
    answer:
      'Buy it. It is the rare plant protein reviewers like the taste of, it digests easily, and its label holds up. It costs more per gram of protein than whey, which is normal for plant protein.',
    verdictBody: [
      'Brawnly Plant Protein avoids the usual plant-protein trade-off. Taste reviews are positive, mixability is decent, and digestion is as strong as you would expect from a dairy-free powder.',
      'Price is the only real point against it, and that is a category-wide issue rather than a Brawnly one.',
    ],
    claims: [
      { aspect: 'taste', sentiment: 'positive', text: 'Vanilla flavour without the usual earthy aftertaste' },
      { aspect: 'digestion', sentiment: 'positive', text: 'No bloating, including for lactose-intolerant reviewers' },
      { aspect: 'mixability', sentiment: 'positive', text: 'Mixes smoothly in a shaker' },
    ],
    faq: [
      {
        q: 'Is Brawnly Plant Protein good for lactose intolerance?',
        a: 'It contains no dairy, and reviewers who describe themselves as lactose-intolerant report no digestion problems. Its digestion score is one of the highest across all the protein powders we track. As always, check the ingredient list if you have other allergies.',
      },
      {
        q: 'Brawnly Plant Protein or Verdant Plant Protein?',
        a: 'Both digest easily. Brawnly Plant Protein wins clearly on taste and mixability, while Verdant is cheaper per gram of protein if you are willing to blend it. Our head-to-head comparison lays out every score side by side.',
      },
    ],
    specs: [
      { label: 'Protein per serving', value: '25 g' },
      { label: 'Serving size', value: '35 g' },
      { label: 'Pack size', value: '500 g' },
      { label: 'Source', value: 'Pea isolate' },
    ],
    valueQuantity: 357,
    offers: [
      { source: 'amazon', price: 1299, mrp: 1699, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 1349, mrp: 1699, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.2, total: 310 },
      { source: 'flipkart', rating: 4.1, total: 74 },
    ],
    author: 'priya-menon',
    publishedAt: '2026-07-11',
    updatedAt: '2026-09-15',
    plan: {
      seed: 67,
      profile: {
        taste: { mention: 0.4, positive: 0.82 },
        mixability: { mention: 0.3, positive: 0.8 },
        digestion: { mention: 0.3, positive: 0.92 },
        value: { mention: 0.3, positive: 0.75 },
        'label-accuracy': { mention: 0.1, positive: 0.88 },
      },
      collect: { amazon: 38, flipkart: 16, reddit: 8, youtube: 6 },
      burst: 2,
    },
  },
  {
    slug: 'sunveil-aqua-gel-spf50',
    name: 'SunVeil Aqua Gel SPF 50 PA++++',
    shortName: 'SunVeil Aqua Gel',
    brand: 'sunveil',
    category: 'sunscreen',
    variant: '50 ml',
    verdict: 'buy',
    answer:
      'Buy it. It is the sunscreen reviewers are happiest to wear every day: no white cast on Indian skin tones, a light gel that does not feel greasy in humidity, and few reports of breakouts. Reapply as directed — no sunscreen lasts all day.',
    verdictBody: [
      'SunVeil Aqua Gel scores highly on the two things that decide whether people keep wearing a sunscreen: it disappears into the skin and it feels light.',
      'Protection reviews are solid and breakout reports are low, including from reviewers with acne-prone skin. Fragrance is barely mentioned, which for sunscreen is a good sign.',
    ],
    claims: [
      { aspect: 'white-cast', sentiment: 'positive', text: 'No white cast, including on darker skin tones' },
      { aspect: 'texture', sentiment: 'positive', text: 'Light gel that stays non-greasy in humidity' },
      { aspect: 'breakouts', sentiment: 'positive', text: 'Rarely causes breakouts' },
    ],
    faq: [
      {
        q: 'Does SunVeil Aqua Gel leave a white cast?',
        a: 'Almost never, according to reviewers — including those with wheatish and dusky skin. White cast is its strongest aspect, and it scores higher on it than any other sunscreen we track. A gel texture that absorbs quickly is the reason reviewers give most often.',
      },
      {
        q: 'Is SunVeil Aqua Gel good for oily skin?',
        a: 'Reviewers with oily and combination skin are among its most positive. They describe it as light and non-greasy, even in humid cities. A small number find it slightly sticky under makeup, so it may need a few minutes to set first.',
      },
    ],
    specs: [
      { label: 'SPF / PA', value: 'SPF 50, PA++++' },
      { label: 'Filters', value: 'Chemical' },
      { label: 'Finish', value: 'Dewy gel' },
      { label: 'Volume', value: '50 ml' },
    ],
    valueQuantity: 50,
    offers: [
      { source: 'amazon', price: 399, mrp: 499, inStock: true, checkedAt: '2026-09-24' },
      { source: 'nykaa', price: 379, mrp: 499, inStock: true, checkedAt: '2026-09-24' },
      { source: 'flipkart', price: 409, mrp: 499, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.3, total: 3120 },
      { source: 'nykaa', rating: 4.4, total: 2210 },
      { source: 'flipkart', rating: 4.2, total: 640 },
    ],
    author: 'arjun-shah',
    publishedAt: '2026-06-25',
    updatedAt: '2026-09-19',
    plan: {
      seed: 71,
      profile: {
        'white-cast': { mention: 0.4, positive: 0.9 },
        texture: { mention: 0.45, positive: 0.85 },
        breakouts: { mention: 0.2, positive: 0.85 },
        protection: { mention: 0.25, positive: 0.85 },
        fragrance: { mention: 0.1, positive: 0.75 },
        value: { mention: 0.25, positive: 0.82 },
      },
      collect: { amazon: 40, nykaa: 30, flipkart: 10, reddit: 10, youtube: 6 },
      burst: 3,
    },
  },
  {
    slug: 'dermora-matte-spf50',
    name: 'Dermora Matte Sunscreen SPF 50',
    shortName: 'Dermora Matte',
    brand: 'dermora',
    category: 'sunscreen',
    variant: '80 ml',
    verdict: 'buy-with-caveats',
    answer:
      'A good sunscreen with one big catch: white cast. Protection and breakout reviews are strong and the matte finish suits oily skin, but many reviewers with medium to deeper skin tones report a visible white cast. Fair skin, buy it; deeper skin, look elsewhere.',
    verdictBody: [
      'Dermora Matte does what a sunscreen must: reviewers report little tanning and few breakouts, and the matte finish is popular with oily skin.',
      'White cast splits its reviewers. Those with fair skin rarely mention it; those with wheatish, dusky or deep skin mention it constantly. Whether this is a Buy depends on which group you are in.',
    ],
    claims: [
      { aspect: 'protection', sentiment: 'positive', text: 'Little or no tanning, even outdoors' },
      { aspect: 'breakouts', sentiment: 'positive', text: 'Does not clog pores' },
      { aspect: 'texture', sentiment: 'positive', text: 'Matte finish that suits oily skin' },
      { aspect: 'white-cast', sentiment: 'negative', text: 'Visible white cast on medium and deeper skin' },
    ],
    faq: [
      {
        q: 'Does Dermora Matte Sunscreen leave a white cast?',
        a: 'On fair skin, rarely. On wheatish, dusky and deep skin tones it is the most common complaint in its reviews. If your skin is medium or deeper, reviewers suggest a gel sunscreen instead, or blending this one in thin layers.',
      },
      {
        q: 'Is Dermora Matte good for acne-prone skin?',
        a: 'Breakout reports are low, and reviewers with acne-prone skin are generally positive. The matte, non-greasy finish is the reason given most often. As with any new sunscreen, patch-test for a few days before applying it all over.',
      },
    ],
    specs: [
      { label: 'SPF / PA', value: 'SPF 50, PA+++' },
      { label: 'Filters', value: 'Hybrid (mineral + chemical)' },
      { label: 'Finish', value: 'Matte' },
      { label: 'Volume', value: '80 ml' },
    ],
    valueQuantity: 80,
    offers: [
      { source: 'amazon', price: 549, mrp: 699, inStock: true, checkedAt: '2026-09-24' },
      { source: 'nykaa', price: 529, mrp: 699, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.2, total: 1840 },
      { source: 'nykaa', rating: 4.1, total: 1520 },
    ],
    author: 'arjun-shah',
    publishedAt: '2026-06-25',
    updatedAt: '2026-09-11',
    plan: {
      seed: 79,
      profile: {
        'white-cast': { mention: 0.45, positive: 0.45 },
        texture: { mention: 0.35, positive: 0.82 },
        breakouts: { mention: 0.2, positive: 0.88 },
        protection: { mention: 0.3, positive: 0.88 },
        fragrance: { mention: 0.1, positive: 0.6 },
        value: { mention: 0.25, positive: 0.78 },
      },
      collect: { amazon: 38, nykaa: 28, reddit: 8, youtube: 6 },
      burst: 4,
    },
  },
  {
    slug: 'glowfield-tinted-spf40',
    name: 'Glowfield Tinted Sunscreen SPF 40',
    shortName: 'Glowfield Tinted',
    brand: 'glowfield',
    category: 'sunscreen',
    variant: '40 ml',
    verdict: 'skip',
    answer:
      'Skip it. The tint avoids a white cast, but breakouts are the most common complaint in its reviews, and a sunscreen that causes breakouts is one you stop wearing. It is also expensive per millilitre.',
    verdictBody: [
      'Glowfield Tinted Sunscreen fails our breakouts deal-breaker: reviewers reporting new acne or bumps outnumber those who say it is fine on their skin.',
      'The tint does its job on white cast, and some reviewers like it as a light base. But with protection reviews also mixed and a high price per millilitre, the sunscreens above are better buys.',
    ],
    claims: [
      { aspect: 'white-cast', sentiment: 'positive', text: 'The tint avoids a white cast' },
      { aspect: 'breakouts', sentiment: 'negative', text: 'Breakouts within the first week or two' },
      { aspect: 'fragrance', sentiment: 'negative', text: 'Strong added fragrance' },
    ],
    faq: [
      {
        q: 'Why is Glowfield Tinted Sunscreen marked Skip?',
        a: 'Breakouts are one of our deal-breakers for sunscreen, and more reviewers report breakouts with it than report none. A sunscreen only works if you wear it every day, and reviewers who break out stop. The added fragrance is a likely factor reviewers point to.',
      },
      {
        q: 'Are tinted sunscreens better for Indian skin?',
        a: 'Tinted sunscreens can hide the white cast that some mineral filters leave on medium and deeper skin tones. They are only a better choice if the formula suits your skin otherwise — check breakout and texture scores, not just white cast.',
      },
    ],
    specs: [
      { label: 'SPF / PA', value: 'SPF 40, PA+++' },
      { label: 'Filters', value: 'Mineral, tinted' },
      { label: 'Finish', value: 'Satin' },
      { label: 'Volume', value: '40 ml' },
    ],
    valueQuantity: 40,
    offers: [
      { source: 'amazon', price: 699, mrp: 899, inStock: true, checkedAt: '2026-09-24' },
      { source: 'nykaa', price: 649, mrp: 899, inStock: true, checkedAt: '2026-09-24' },
    ],
    platformStats: [
      { source: 'amazon', rating: 4.1, total: 980 },
      { source: 'nykaa', rating: 3.8, total: 610 },
    ],
    author: 'arjun-shah',
    publishedAt: '2026-07-30',
    updatedAt: '2026-09-05',
    plan: {
      seed: 83,
      profile: {
        'white-cast': { mention: 0.25, positive: 0.82 },
        texture: { mention: 0.35, positive: 0.6 },
        breakouts: { mention: 0.4, positive: 0.25 },
        protection: { mention: 0.25, positive: 0.55 },
        fragrance: { mention: 0.2, positive: 0.3 },
        value: { mention: 0.3, positive: 0.4 },
      },
      collect: { amazon: 36, nykaa: 24, reddit: 8, youtube: 4 },
      burst: 11,
    },
  },
]

export const products: Product[] = seeds.map(({ plan, ...product }) => ({
  ...product,
  reviews: generateReviews({ ...plan, updatedAt: product.updatedAt }),
}))
