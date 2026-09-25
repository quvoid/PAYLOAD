import type { Aspect, Author, Brand, Category, Source } from '@/lib/types'

// SAMPLE DATA. Every brand, product, person and review in src/data is fictional.
// It stands in for Payload + the scraper pipeline until those are connected.

export const sources: Source[] = [
  {
    id: 'amazon',
    name: 'Amazon.in',
    kind: 'marketplace',
    weight: 1,
    hasRatings: true,
    collection: 'Product reviews collected with a headful browser session, newest first.',
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    kind: 'marketplace',
    weight: 1,
    hasRatings: true,
    collection: 'Product reviews collected by scraper, newest first.',
  },
  {
    id: 'nykaa',
    name: 'Nykaa',
    kind: 'marketplace',
    weight: 1,
    hasRatings: true,
    collection: 'Product reviews collected by scraper, used for beauty and skincare.',
  },
  {
    id: 'brand-store',
    name: 'Brand store',
    kind: 'brand-store',
    weight: 0.6,
    hasRatings: true,
    collection:
      "Reviews on the manufacturer's own store. Down-weighted: the seller controls what stays up.",
  },
  {
    id: 'reddit',
    name: 'Reddit',
    kind: 'community',
    weight: 1,
    hasRatings: false,
    collection: "Threads and comments read from Reddit's public JSON endpoints.",
  },
  {
    id: 'youtube',
    name: 'YouTube',
    kind: 'video',
    weight: 1,
    hasRatings: false,
    collection: 'Review videos and their comments.',
  },
]

export const aspects: Aspect[] = [
  { slug: 'taste', label: 'Taste', question: 'Does it taste good?' },
  { slug: 'mixability', label: 'Mixability', question: 'Does it mix without lumps?' },
  {
    slug: 'digestion',
    label: 'Digestion',
    question: 'Does it cause bloating?',
    topic: 'protein-powder-bloating',
  },
  { slug: 'value', label: 'Value for money', question: 'Is it worth the price?' },
  {
    slug: 'authenticity',
    label: 'Authenticity',
    question: 'Are people receiving fakes?',
    topic: 'fake-supplements',
  },
  {
    slug: 'label-accuracy',
    label: 'Label accuracy',
    question: 'Does the protein content match the label?',
  },
  {
    slug: 'white-cast',
    label: 'White cast',
    question: 'Does it leave a white cast?',
    topic: 'sunscreen-white-cast',
  },
  { slug: 'texture', label: 'Texture', question: 'How does it feel on the skin?' },
  { slug: 'breakouts', label: 'Breakouts', question: 'Does it cause breakouts?' },
  { slug: 'protection', label: 'Sun protection', question: 'Does it prevent tanning?' },
  { slug: 'fragrance', label: 'Fragrance', question: 'Does it smell strong?' },
]

const proteinFaq = [
  {
    q: 'How much protein do I need in a day?',
    a: 'Most adults who train regularly aim for roughly 1.2 to 2 grams of protein per kilogram of body weight a day. A scoop of whey adds 20 to 27 grams, so it is a top-up to food, not a replacement for it. Your doctor or a dietitian can set a number for you.',
  },
  {
    q: 'Why do you show price per 100 g of protein?',
    a: 'Tubs differ in scoop size and protein per scoop, so the sticker price hides what you actually pay for protein. Dividing the lowest current price by the grams of protein in the tub gives a number you can compare across every brand we track.',
  },
]

export const categories: Category[] = [
  {
    slug: 'supplements',
    name: 'Protein & Supplements',
    tagline: 'Whey, plant protein and the supplements people actually argue about.',
    intro: [
      'Supplements are the category where reviews matter most and can be trusted least. Marketplace ratings are inflated by review bursts, brand-owned stores show their own scores, and a meaningful share of complaints are about fakes rather than the product itself.',
      'We track every product here on the same measures — taste, mixability, digestion, value per gram of protein, authenticity and label accuracy — so a comparison between two tubs is a comparison of like with like.',
    ],
    aspects: [],
    refreshDays: 21,
    faq: [],
  },
  {
    slug: 'whey-protein',
    parent: 'supplements',
    name: 'Whey Protein',
    tagline: 'Every whey protein we track, scored on the same six measures.',
    intro: [
      'Whey protein is the most-reviewed supplement in India and the most manipulated. A tub with a 4.4★ marketplace average can hide a cluster of bloating complaints, a run of suspected fakes, or a lab test showing less protein than the label claims.',
      'We collect reviews from Amazon.in, Flipkart, brand stores, Reddit and YouTube, discount the ones that look manipulated, and count what reviewers actually mention. Every product below is scored on taste, mixability, digestion, value per 100 g of protein, authenticity and label accuracy.',
      'Digestion, authenticity and label accuracy are deal-breakers: a product that fails any of them is marked Skip, however good it tastes. If you have a sensitive stomach, sort by digestion first — it is the most common reason people stop using a whey.',
    ],
    aspects: [
      { aspect: 'taste', weight: 1 },
      { aspect: 'mixability', weight: 0.8 },
      { aspect: 'digestion', weight: 1, dealBreaker: true },
      { aspect: 'value', weight: 1 },
      { aspect: 'authenticity', weight: 1.2, dealBreaker: true },
      { aspect: 'label-accuracy', weight: 1, dealBreaker: true },
    ],
    valueMetric: { label: 'per 100 g protein', basis: 100 },
    refreshDays: 21,
    faq: proteinFaq,
  },
  {
    slug: 'plant-protein',
    parent: 'supplements',
    name: 'Plant Protein',
    tagline: 'Pea, rice and blended plant proteins, scored like whey.',
    intro: [
      'Plant proteins trade some taste and texture for easier digestion. Reviews reflect that almost exactly: digestion scores run higher than whey, and taste complaints run higher too — gritty texture and an earthy aftertaste are the two things reviewers mention most.',
      'We score plant proteins on the same measures as whey so you can compare across the two, and we price them per 100 g of protein because plant tubs often carry more filler per scoop.',
    ],
    aspects: [
      { aspect: 'taste', weight: 1 },
      { aspect: 'mixability', weight: 0.8 },
      { aspect: 'digestion', weight: 1, dealBreaker: true },
      { aspect: 'value', weight: 1 },
      { aspect: 'label-accuracy', weight: 1, dealBreaker: true },
    ],
    valueMetric: { label: 'per 100 g protein', basis: 100 },
    refreshDays: 28,
    faq: proteinFaq,
  },
  {
    slug: 'skincare',
    name: 'Skincare',
    tagline: 'Sunscreens and everyday skincare, judged by people with Indian skin.',
    intro: [
      'Skincare reviews are unusually personal: the same sunscreen can be invisible on one skin tone and chalky on another. We keep that nuance by counting what reviewers report rather than averaging it away.',
    ],
    aspects: [],
    refreshDays: 35,
    faq: [],
  },
  {
    slug: 'sunscreen',
    parent: 'skincare',
    name: 'Sunscreen',
    tagline: 'Sunscreens scored on white cast, texture, breakouts and real-world protection.',
    intro: [
      "Sunscreen marketing is all SPF numbers. Reviews are about something else: whether it leaves a white cast on Indian skin tones, whether it feels greasy in humidity, and whether it breaks you out. Those are the measures we score, because they decide whether you'll actually wear it every day.",
      'Breakouts and sun protection are deal-breakers. A sunscreen that clogs pores or leaves reviewers tanned is marked Skip regardless of how nice it feels.',
    ],
    aspects: [
      { aspect: 'white-cast', weight: 1 },
      { aspect: 'texture', weight: 1 },
      { aspect: 'breakouts', weight: 1.2, dealBreaker: true },
      { aspect: 'protection', weight: 1.2, dealBreaker: true },
      { aspect: 'fragrance', weight: 0.6 },
      { aspect: 'value', weight: 0.8 },
    ],
    valueMetric: { label: 'per 10 ml', basis: 10 },
    refreshDays: 35,
    faq: [
      {
        q: 'Is SPF 50 much better than SPF 30?',
        a: 'SPF 30 blocks about 97% of UVB and SPF 50 about 98%. The bigger difference in practice is how much you apply and how often you reapply, which is why we score texture and white cast: a sunscreen you like wearing gets applied properly.',
      },
    ],
  },
]

export const brands: Brand[] = [
  {
    slug: 'brawnly',
    name: 'Brawnly',
    about: [
      'Brawnly is a sample sports-nutrition brand selling whey and plant protein through marketplaces and its own store.',
    ],
    sameAs: [],
  },
  {
    slug: 'northpeak',
    name: 'Northpeak',
    about: ['Northpeak is a sample imported whey brand with a premium price point.'],
    sameAs: [],
  },
  {
    slug: 'avara',
    name: 'Avara',
    about: ['Avara is a sample value-focused protein brand with Indian flavours.'],
    sameAs: [],
  },
  {
    slug: 'kettle-co',
    name: 'Kettle & Co.',
    about: ['Kettle & Co. is a sample budget brand selling unflavoured raw whey.'],
    sameAs: [],
  },
  {
    slug: 'fitora',
    name: 'Fitora',
    about: ['Fitora is a sample new brand with a single whey isolate.'],
    sameAs: [],
  },
  {
    slug: 'verdant',
    name: 'Verdant',
    about: ['Verdant is a sample plant-protein-only brand.'],
    sameAs: [],
  },
  {
    slug: 'sunveil',
    name: 'SunVeil',
    about: ['SunVeil is a sample sunscreen brand focused on gel textures.'],
    sameAs: [],
  },
  {
    slug: 'dermora',
    name: 'Dermora',
    about: ['Dermora is a sample dermatologist-positioned skincare brand.'],
    sameAs: [],
  },
  {
    slug: 'glowfield',
    name: 'Glowfield',
    about: ['Glowfield is a sample tinted-skincare brand.'],
    sameAs: [],
  },
]

export const authors: Author[] = [
  {
    slug: 'priya-menon',
    name: 'Priya Menon',
    role: 'Senior editor, supplements',
    bio: [
      'Sample author profile. In production every verdict carries the name of the editor who approved it, with a real bio and credentials.',
    ],
    credentials: 'Sample credentials',
  },
  {
    slug: 'arjun-shah',
    name: 'Arjun Shah',
    role: 'Editor, skincare',
    bio: ['Sample author profile.'],
    credentials: 'Sample credentials',
  },
]
