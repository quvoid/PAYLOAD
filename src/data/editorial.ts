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
      'brawnly-performance-whey': 'Pick Brawnly Performance if you want the most protein per rupee and whey usually agrees with you.',
      'northpeak-gold-whey': 'Pick Northpeak Gold if you have a sensitive stomach or want a shake that mixes instantly.',
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
      'brawnly-plant-protein': 'Pick Brawnly Plant if you drink your shake with water or care about taste.',
      'verdant-plant-protein': 'Pick Verdant if you blend smoothies anyway and want a bigger tub for the money.',
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
      'sunveil-aqua-gel-spf50': 'Pick SunVeil Aqua Gel if white cast is a concern or you prefer a light, dewy finish.',
      'dermora-matte-spf50': 'Pick Dermora Matte if you have fair, oily skin and want a matte finish.',
    },
  },
]

export const topics: Topic[] = [
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
