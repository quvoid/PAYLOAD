import type { BestOf, PairComparison, Topic } from '@/lib/types'

// SAMPLE DATA. Best-of lists rank by rule (regenerated when scores move); pairs are chosen by
// an editor; topic hubs explain one aspect across a silo.

export const bestOf: BestOf[] = [
  {
    slug: 'whey-protein-under-2500',
    title: 'Best whey protein under ₹2,500',
    category: 'whey-protein',
    qualifier: 'under ₹2,500',
    intro: [
      'These are the whey proteins we track whose lowest current price is under ₹2,500, ranked by composite score — our weighted average of taste, mixability, digestion, value, authenticity and label accuracy, calculated from reviews after discounting the ones that look manipulated.',
      'Products marked Skip or Not enough data are left out, however cheap they are. A budget whey that short-fills its protein is not a budget win.',
    ],
    rule: { maxPrice: 2500 },
    faq: [
      {
        q: 'What is the best whey protein under ₹2,500?',
        a: 'The first product on this list, ranked by composite score across taste, mixability, digestion, value, authenticity and label accuracy. The ranking updates automatically when prices or reviews change, so the top pick can move as marketplace sales come and go.',
      },
    ],
  },
  {
    slug: 'protein-powder-without-bloating',
    title: 'Best protein powder without bloating',
    category: 'supplements',
    qualifier: 'without bloating',
    intro: [
      'Ranked purely by digestion score: the share of reviewers mentioning digestion who report no bloating, heaviness or acidity. Whey and plant proteins are ranked together because, for this question, the only thing that matters is how your stomach reacts.',
      'If dairy is the problem, the plant proteins near the top are the obvious place to start. If whey suits you otherwise, the isolates are usually easier on the stomach than concentrates.',
    ],
    rule: { aspect: 'digestion' },
    faq: [
      {
        q: 'Which protein powder is least likely to cause bloating?',
        a: 'The product at the top of this list has the highest digestion score in our data: the largest share of reviewers who mention digestion and report no problems. Plant proteins and whey isolates dominate the top because they contain little or no lactose.',
      },
    ],
  },
  {
    slug: 'sunscreen-without-white-cast',
    title: 'Best sunscreen without white cast',
    category: 'sunscreen',
    qualifier: 'without white cast',
    intro: [
      'Ranked by white-cast score: the share of reviewers mentioning white cast who say the sunscreen blends in. This matters most for medium and deeper Indian skin tones, where mineral-heavy formulas often look ashy.',
    ],
    rule: { aspect: 'white-cast' },
    faq: [
      {
        q: 'Which sunscreen leaves no white cast on Indian skin?',
        a: 'Gel and chemical-filter sunscreens score best for white cast in our data, and the top product on this list scores highest. Check its breakout and protection scores too — a sunscreen that blends in but breaks you out is not a good trade.',
      },
    ],
  },
  {
    slug: 'upi-app-for-reliable-payments',
    title: 'Best UPI app for reliable payments',
    category: 'payment-apps',
    qualifier: 'for reliable payments',
    intro: [
      'Ranked by payment-success score: the share of reviewers mentioning payments who say they go through. For a payment app nothing else matters as much — a pleasant app that loses track of your money is not a good app.',
      'Apps marked Skip are left out entirely, however many cashback offers they run.',
    ],
    rule: { aspect: 'payment-success' },
    faq: [
      {
        q: 'Which UPI app has the fewest failed payments?',
        a: 'The app at the top of this list has the highest payment-success score in our data: the largest share of reviewers who mention payments and report no failures. Most failed UPI payments reviewers describe are reversed by the bank automatically, but the best apps make that easy to track.',
      },
    ],
  },
  {
    slug: 'food-delivery-app-with-best-refunds',
    title: 'Best food delivery app for refunds and support',
    category: 'food-delivery-apps',
    qualifier: 'for refunds and support',
    intro: [
      'Ranked by refunds & support score: the share of reviewers mentioning support who say a problem was put right. Every delivery app gets orders wrong sometimes; what separates them is what happens next.',
    ],
    rule: { aspect: 'refunds-support' },
    faq: [
      {
        q: 'Which food delivery app gives refunds most easily?',
        a: 'The app at the top of this list has the highest refunds & support score in our data. Reviewers of the top-ranked apps describe refunds for missing items within minutes, while lower-ranked apps are more often accused of closing complaints without a fix.',
      },
    ],
  },
]

export const comparisons: PairComparison[] = [
  {
    slug: 'brawnly-performance-whey-vs-northpeak-gold-whey',
    category: 'whey-protein',
    products: ['brawnly-performance-whey', 'northpeak-gold-whey'],
    judgement: [
      'This is the everyday-value whey against the premium one. Brawnly Performance costs meaningfully less per gram of protein and matches Northpeak Gold on taste; Northpeak Gold wins on mixability and, decisively, on digestion.',
      'If whey has never bothered your stomach, Brawnly Performance is the better buy. If it has, the premium is worth paying.',
    ],
    pickIf: {
      'brawnly-performance-whey':
        'Pick Brawnly Performance if you want the most protein per rupee and whey usually agrees with you.',
      'northpeak-gold-whey':
        'Pick Northpeak Gold if you have a sensitive stomach or want a shake that mixes instantly.',
    },
  },
  {
    slug: 'brawnly-plant-protein-vs-verdant-plant-protein',
    category: 'plant-protein',
    products: ['brawnly-plant-protein', 'verdant-plant-protein'],
    judgement: [
      'Both digest easily, which is the reason most people buy a plant protein. The difference is taste: Brawnly Plant Protein is one of the few plant powders reviewers enjoy with water, while Verdant is gritty unless blended.',
    ],
    pickIf: {
      'brawnly-plant-protein':
        'Pick Brawnly Plant if you drink your shake with water or care about taste.',
      'verdant-plant-protein':
        'Pick Verdant if you blend smoothies anyway and want a bigger tub for the money.',
    },
  },
  {
    slug: 'dermora-matte-spf50-vs-sunveil-aqua-gel-spf50',
    category: 'sunscreen',
    products: ['sunveil-aqua-gel-spf50', 'dermora-matte-spf50'],
    judgement: [
      'Two strong SPF 50 sunscreens that suit different skin. SunVeil Aqua Gel disappears into every skin tone; Dermora Matte controls oil better but leaves a cast on medium and deeper skin.',
    ],
    pickIf: {
      'sunveil-aqua-gel-spf50':
        'Pick SunVeil Aqua Gel if white cast is a concern or you prefer a light, dewy finish.',
      'dermora-matte-spf50':
        'Pick Dermora Matte if you have fair, oily skin and want a matte finish.',
    },
  },
  {
    slug: 'paynest-upi-vs-rupeeflow',
    category: 'payment-apps',
    products: ['paynest-upi', 'rupeeflow'],
    judgement: [
      'Both apps get payments through reliably, so this comes down to everything else. PayNest is simpler and quieter; Rupeeflow has stronger bill-payment features but surrounds them with ads and loan offers.',
    ],
    pickIf: {
      'paynest-upi':
        'Pick PayNest if you want the simplest app with the fewest interruptions — or you are setting up UPI for a parent.',
      rupeeflow:
        'Pick Rupeeflow if bill payments and reminders matter more to you than a quiet app.',
    },
  },
]

export const topics: Topic[] = [
  {
    slug: 'upi-payment-failures',
    aspect: 'payment-success',
    silo: 'apps',
    title: 'Why do UPI payments fail, and which apps fail least?',
    explainer: [
      'A failed UPI payment is usually not the app’s fault alone: the payer’s bank, the receiver’s bank and the UPI network all have to respond in time. But apps differ in how often reviewers hit failures, and in how clearly they show what happened to the money.',
      'We count every review that mentions whether payments go through. The ranking below shows which apps reviewers trust with their money.',
      'If money is debited and the payment fails, the bank is required to reverse it automatically, normally by the next working day. Raise it in the app first, then with your bank if it does not arrive.',
    ],
    faq: [
      {
        q: 'Why does a UPI payment fail when money is debited?',
        a: 'Usually because one of the banks involved timed out after the debit but before the credit was confirmed. The transaction is then reversed rather than completed. It is common during bank downtime and at busy times such as salary days and sales.',
      },
    ],
  },
  {
    slug: 'protein-powder-bloating',
    aspect: 'digestion',
    silo: 'supplements',
    title: 'Does protein powder cause bloating?',
    explainer: [
      'Bloating is the most common reason people give up on a protein powder, and the complaint is not evenly spread. It clusters in whey concentrates, which carry more lactose, and in products reviewers describe as heavily sweetened.',
      'Across the protein powders we track, we count every review that mentions digestion and record whether it reports a problem. The table below ranks products by the share of those reviews that report no bloating, heaviness or acidity.',
      'If you react to whey, the usual fixes reviewers describe are a smaller serving, switching to an isolate, or switching to a plant protein. None of this is medical advice: persistent symptoms are worth raising with a doctor.',
    ],
    faq: [
      {
        q: 'Why does whey protein cause bloating?',
        a: 'The most common reason is lactose. Whey concentrate still contains some milk sugar, and many adults digest it poorly. Sweeteners and thickeners added for taste and texture can also cause bloating. Isolates and plant proteins contain little or no lactose, which is why they score better here.',
      },
      {
        q: 'Is plant protein better for bloating?',
        a: 'In our data, plant proteins score higher on digestion than whey concentrates on average. They are not guaranteed to suit everyone — some people react to pea or soy — but for lactose-related bloating they are the most common fix reviewers report.',
      },
    ],
  },
  {
    slug: 'fake-supplements',
    aspect: 'authenticity',
    silo: 'supplements',
    title: 'How common are fake supplements in India?',
    explainer: [
      'Counterfeit supplements are a known problem on Indian marketplaces, especially for imported whey sold by third-party sellers at unusually deep discounts. Reviewers report tampered seals, mismatched batch numbers and tubs that taste different from the last one.',
      'We count every review that raises authenticity and whether it reports a suspected fake. The ranking below shows which products reviewers trust most.',
    ],
    faq: [
      {
        q: 'How can I tell if my whey protein is fake?',
        a: 'Check the seal, the batch number and expiry printing, and the authenticity code if the brand provides one. Compare the taste and texture with a tub you trust. Buying from the brand-authorised seller on each marketplace avoids most of the fakes reviewers describe.',
      },
    ],
  },
  {
    slug: 'sunscreen-white-cast',
    aspect: 'white-cast',
    silo: 'skincare',
    title: 'Which sunscreens leave a white cast on Indian skin?',
    explainer: [
      'White cast is the ashy film some sunscreens leave behind, and it is far more visible on medium and deeper skin tones. Mineral filters like zinc oxide cause it most; gel and chemical-filter formulas rarely do.',
      'We count every review that mentions white cast and whether it reports one. The ranking below shows which sunscreens blend in best.',
    ],
    faq: [
      {
        q: 'Why do some sunscreens leave a white cast?',
        a: 'Mineral filters such as zinc oxide and titanium dioxide sit on top of the skin and reflect light, which shows up as a white or grey film. Tinted formulas and chemical filters avoid this, which is why they score better for white cast on Indian skin tones.',
      },
    ],
  },
]
