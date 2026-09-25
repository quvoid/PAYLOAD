import type { Aspect, Author, Brand, Category, Source } from '@/lib/types'

// SAMPLE DATA. Every brand, product and review in src/data is fictional; the author is the real editor.
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
    id: 'play-store',
    name: 'Google Play',
    kind: 'app-store',
    weight: 1,
    hasRatings: true,
    collection: 'App details, rating counts and every written review, collected from the Play Store listing.',
  },
  {
    id: 'app-store',
    name: 'App Store',
    kind: 'app-store',
    weight: 1,
    hasRatings: true,
    collection:
      "App details from Apple's app lookup, and written reviews from Apple's customer-reviews feed (most recent and most helpful).",
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
  { slug: 'delivery-speed', label: 'Delivery speed', question: 'Does food arrive on time?' },
  { slug: 'order-accuracy', label: 'Order accuracy', question: 'Do orders arrive complete and correct?' },
  {
    slug: 'refunds-support',
    label: 'Refunds & support',
    question: 'Does support help when something goes wrong?',
  },
  { slug: 'fees', label: 'Fees & charges', question: 'Are the fees fair?' },
  { slug: 'app-stability', label: 'Crashes & bugs', question: 'Does the app work reliably?' },
  {
    slug: 'payment-success',
    label: 'Payment success',
    question: 'Do payments go through?',
    topic: 'upi-payment-failures',
  },
  { slug: 'security', label: 'Security & privacy', question: 'Is my money and data safe?' },
  { slug: 'ease-of-use', label: 'Ease of use', question: 'Is it easy to use?' },
  { slug: 'ads-spam', label: 'Ads & notifications', question: 'Is it full of ads and spam?' },
  { slug: 'sound-quality', label: 'Sound quality', question: 'How does it sound?' },
  { slug: 'battery-life', label: 'Battery life', question: 'How long does the battery last?' },
  { slug: 'call-quality', label: 'Call quality', question: 'Can people hear you on calls?' },
  { slug: 'connectivity', label: 'Connectivity', question: 'Does Bluetooth stay connected?' },
  { slug: 'comfort', label: 'Comfort & fit', question: 'Are they comfortable to wear?' },
  { slug: 'build-quality', label: 'Build & durability', question: 'Do they last?' },
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
  {
    slug: 'apps',
    name: 'Apps',
    tagline: 'Android and iPhone apps, judged by what their users report on Google Play and the App Store.',
    intro: [
      'An app store rating is an average of millions of taps. It hides the thing you actually want to know: what goes wrong, how often, and whether anyone fixes it. We read the written reviews on both stores and count what people report.',
      'Every app here is scored on the same measures as its competitors, so a comparison between two apps is a comparison of like with like.',
    ],
    aspects: [],
    refreshDays: 14,
    faq: [],
  },
  {
    slug: 'food-delivery-apps',
    parent: 'apps',
    name: 'Food Delivery Apps',
    tagline: 'Food delivery apps scored on delivery, order accuracy, refunds and fees.',
    intro: [
      'Food delivery apps are judged on the worst order, not the average one. A cold meal or a missing item is annoying; a missing item with no refund is the reason people uninstall. Reviews on Google Play and the App Store are full of exactly these stories, and we count them.',
      'Order accuracy and refunds & support are deal-breakers: an app that regularly gets orders wrong, or refuses to make it right, is marked Skip however fast it delivers.',
    ],
    aspects: [
      { aspect: 'delivery-speed', weight: 1 },
      { aspect: 'order-accuracy', weight: 1.2, dealBreaker: true },
      { aspect: 'refunds-support', weight: 1.2, dealBreaker: true },
      { aspect: 'fees', weight: 1 },
      { aspect: 'app-stability', weight: 0.8 },
    ],
    appCategory: 'LifestyleApplication',
    refreshDays: 14,
    faq: [
      {
        q: 'Why do you score apps on reviews and not the star rating?',
        a: 'Store ratings are dominated by quick five-star taps and are rarely updated. Written reviews say what actually happened: late orders, missing items, refunds refused. We count those reports per aspect, so you can see how often each problem comes up rather than one blended number.',
      },
    ],
  },
  {
    slug: 'payment-apps',
    parent: 'apps',
    name: 'UPI & Payment Apps',
    tagline: 'UPI and payment apps scored on failed payments, security, support and ease of use.',
    intro: [
      'A payment app has one job. When a UPI payment fails, money is often debited and returned days later, and the reviews that describe it are the most useful thing on the store page. We count how often reviewers report failed or stuck payments, security worries, and support that does or does not respond.',
      'Payment success, security & privacy and refunds & support are deal-breakers. A payment app that loses track of money is marked Skip regardless of how pleasant it is to use.',
    ],
    aspects: [
      { aspect: 'payment-success', weight: 1.3, dealBreaker: true },
      { aspect: 'security', weight: 1.2, dealBreaker: true },
      { aspect: 'refunds-support', weight: 1.1, dealBreaker: true },
      { aspect: 'app-stability', weight: 1 },
      { aspect: 'ease-of-use', weight: 0.8 },
      { aspect: 'ads-spam', weight: 0.6 },
    ],
    appCategory: 'FinanceApplication',
    refreshDays: 14,
    faq: [
      {
        q: 'What happens when a UPI payment fails but money is debited?',
        a: 'Banks are required to reverse a failed UPI debit automatically, normally by the next working day. In reviews, the apps that score well on refunds & support are the ones that track the reversal and tell you when it lands. Raise it in the app first, then with your bank if it does not arrive.',
      },
    ],
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    tagline: 'Everyday electronics, judged on what owners report after the first month.',
    intro: [
      'Electronics reviews are front-loaded: most are written in the first week, before batteries fade or hinges loosen. We read them all and weight the problems that show up later.',
    ],
    aspects: [],
    refreshDays: 21,
    faq: [],
  },
  {
    slug: 'wireless-earbuds',
    parent: 'electronics',
    name: 'Wireless Earbuds',
    tagline: 'True wireless earbuds scored on sound, battery, calls, connection and how long they last.',
    intro: [
      'Budget earbuds sell on battery hours and bass. Reviews tell you the rest: whether calls are clear, whether one bud keeps disconnecting, and whether they still work after six months.',
      'Build & durability is a deal-breaker: earbuds that commonly stop working are marked Skip, however good they sound out of the box.',
    ],
    aspects: [
      { aspect: 'sound-quality', weight: 1 },
      { aspect: 'battery-life', weight: 1 },
      { aspect: 'call-quality', weight: 0.8 },
      { aspect: 'connectivity', weight: 1 },
      { aspect: 'comfort', weight: 0.7 },
      { aspect: 'build-quality', weight: 1.2, dealBreaker: true },
      { aspect: 'value', weight: 1 },
    ],
    refreshDays: 21,
    faq: [],
  },
]

export const brands: Brand[] = [
  { slug: 'muscleblaze', name: 'MuscleBlaze', about: ['MuscleBlaze is an Indian sports nutrition brand.'], sameAs: [] },
  { slug: 'minimalist', name: 'Minimalist', about: ['Minimalist is an Indian skincare brand.'], sameAs: [] },
  { slug: 'boat', name: 'boAt', about: ['boAt is an Indian consumer electronics brand.'], sameAs: [] },
  { slug: 'zomato', name: 'Zomato', about: ['Zomato is an Indian food delivery and restaurant discovery app.'], sameAs: [] },
  { slug: 'phonepe', name: 'PhonePe', about: ['PhonePe is an Indian UPI payments app.'], sameAs: [] },
  { slug: 'zapeat', name: 'Zapeat', about: ['Zapeat is a sample food delivery app.'], sameAs: [] },
  { slug: 'tiffora', name: 'Tiffora', about: ['Tiffora is a sample home-style meal delivery app.'], sameAs: [] },
  { slug: 'biteloop', name: 'Biteloop', about: ['Biteloop is a sample discount food delivery app.'], sameAs: [] },
  { slug: 'paynest', name: 'PayNest', about: ['PayNest is a sample UPI payments app.'], sameAs: [] },
  { slug: 'rupeeflow', name: 'Rupeeflow', about: ['Rupeeflow is a sample UPI and bill-payments app.'], sameAs: [] },
  { slug: 'tapsy', name: 'Tapsy Pay', about: ['Tapsy Pay is a sample wallet and UPI app.'], sameAs: [] },
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
    slug: 'omkar',
    name: 'Omkar',
    role: 'Editor',
    bio: [
      'Omkar reads every verdict on ReviewLens before it goes live and approves the wording. The numbers behind each verdict are computed from reviews; the judgement about whether it reads fairly is Omkar’s.',
    ],
    credentials: '',
  },
]
