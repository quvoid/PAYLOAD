import type { Claim, FAQ } from '@/lib/types'

// Draft wording for real products. Written from the computed numbers, never containing numbers
// itself — the page shows every figure next to it, computed from reviews. An editor approves or
// rewrites this before a product stops being a draft.
//
// Claims are only drafted where the evidence quote the site picks actually says what the claim
// says; aspects where the sentiment model's tagging was unreliable are left out rather than guessed.

export interface RealEditorial {
  variant: string
  answer: string
  verdictBody: string[]
  claims: Claim[]
  faq: FAQ[]
}

export const editorial: Record<string, RealEditorial> = {
  'muscleblaze-biozyme-performance-whey': {
    variant: 'Reviews across flavours and pack sizes',
    answer:
      'Worth buying. Reviewers consistently like the taste and trust that what arrives is genuine, and digestion complaints are rare. The complaints that do come up are about particular flavours being too sweet and a few suspected fakes from third-party sellers, so buy from the brand-authorised seller.',
    verdictBody: [
      'MuscleBlaze Biozyme Performance Whey clears every deal-breaker we check for whey: few reviewers report digestion trouble, and authenticity complaints are rare.',
      'Taste is the most discussed aspect and mostly positive; the negative mentions focus on specific flavours being too sweet. Value draws mixed comments, largely tied to sale prices.',
    ],
    claims: [
      { aspect: 'taste', sentiment: 'positive', text: 'Flavours reviewers enjoy' },
      { aspect: 'authenticity', sentiment: 'positive', text: 'Genuine, freshly manufactured tubs' },
      { aspect: 'digestion', sentiment: 'positive', text: 'No bloating or stomach trouble for most' },
      { aspect: 'taste', sentiment: 'negative', text: 'Some flavours are too sweet' },
      { aspect: 'value', sentiment: 'negative', text: 'Not worth the price for some reviewers' },
      { aspect: 'authenticity', sentiment: 'negative', text: 'Suspected fakes from third-party sellers' },
    ],
    faq: [
      {
        q: 'Is MuscleBlaze Biozyme Performance Whey genuine on Flipkart?',
        a: 'Most reviewers who mention authenticity describe genuine, freshly manufactured tubs. The few suspected-fake reports mention third-party sellers rather than the brand. Buying from the brand-authorised seller, then checking the seal and authenticity code as soon as it arrives, avoids the problem reviewers describe.',
      },
      {
        q: 'Does MuscleBlaze Biozyme cause bloating?',
        a: 'Few reviewers report digestion problems, and several specifically mention no bloating or stomach trouble. As with any whey concentrate, people who are sensitive to lactose may still react, so starting with a smaller serving is sensible if whey has troubled you before.',
      },
    ],
  },
  'minimalist-spf-50-sunscreen': {
    variant: 'SPF 50 PA++++ · Flipkart listing',
    answer:
      'Worth buying for everyday use. Reviewers rarely report tanning, white cast or breakouts, the problems that decide whether people keep wearing a sunscreen. The complaints that come up are about texture on oily skin and the tube feeling small for the price.',
    verdictBody: [
      'Minimalist SPF 50 passes both sunscreen deal-breakers comfortably: breakout and protection complaints are rare.',
      'Texture is the most discussed aspect and splits reviewers — many find it light, while some with oily skin describe it as greasy or dulling. Value comments focus on the quantity in the tube.',
    ],
    claims: [
      { aspect: 'protection', sentiment: 'positive', text: 'Helps with tanning over regular use' },
      { aspect: 'texture', sentiment: 'negative', text: 'Can feel greasy or dull on oily skin' },
      { aspect: 'breakouts', sentiment: 'negative', text: 'Itching or irritation on some sensitive skin' },
      { aspect: 'value', sentiment: 'negative', text: 'Tube feels small for the price' },
    ],
    faq: [
      {
        q: 'Does Minimalist SPF 50 leave a white cast?',
        a: 'White cast is rarely reported as a problem in its reviews. A few reviewers, mostly with medium or deeper skin tones, notice a light cast after applying, so blending it in thin layers helps if that is a concern for you.',
      },
      {
        q: 'Is Minimalist SPF 50 good for oily skin?',
        a: 'Reviewers are split. Many describe the texture as light, while some with oily skin find it greasy or dulling by midday. If your skin is very oily, reviewers suggest using a little less or pairing it with a mattifying step.',
      },
    ],
  },
  'boat-airdopes-141': {
    variant: 'True wireless earbuds · Flipkart listing',
    answer:
      'A reasonable budget pick rather than a standout. Reviewers like the price and the sound for the money, but battery life disappoints more often than the box suggests, and a few report one bud dying. Overall satisfaction sits just below our Buy line.',
    verdictBody: [
      'The Airdopes 141 Gen 2 has no single problem that stands out: every aspect we track is reported as a problem by only a small share of reviewers.',
      'It lands just below our Buy line because overall satisfaction is middling. Battery life draws more complaints than praise, and a handful of reviewers report one earbud stopping working — the failure to watch for at this price.',
    ],
    claims: [
      { aspect: 'value', sentiment: 'positive', text: 'Good value for the price' },
      { aspect: 'call-quality', sentiment: 'positive', text: 'Clear calls with decent noise reduction' },
      { aspect: 'battery-life', sentiment: 'negative', text: 'Battery backup shorter than expected' },
      { aspect: 'connectivity', sentiment: 'negative', text: 'Weak Bluetooth range' },
      { aspect: 'build-quality', sentiment: 'negative', text: 'One earbud stops working for a few reviewers' },
    ],
    faq: [
      {
        q: 'How long does the boAt Airdopes 141 Gen 2 battery last?',
        a: 'Battery life is the most common complaint in its reviews, with several reviewers describing shorter single-charge playback than they expected. Treat the advertised total, which includes charges from the case, as a best case rather than a typical day of use.',
      },
      {
        q: 'Are the boAt Airdopes 141 Gen 2 good for calls?',
        a: 'Most reviewers who mention calls are satisfied, and several praise the noise reduction on the microphones. A smaller group say their voice is unclear in noisy places, so these suit everyday calls better than calls made on busy streets or in traffic.',
      },
    ],
  },
  phonepe: {
    variant: 'Android & iPhone',
    answer:
      'Use it. Payments go through reliably and reviewers find it quick and easy to use. The complaints are about everything around the payments: slow support, especially for insurance, wallet and autopay issues, promotional calls and notifications, and occasional sluggishness in the app.',
    verdictBody: [
      'PhonePe passes every deal-breaker we check for payment apps: few reviewers report failed or stuck payments, and security worries are uncommon.',
      'Support is its weakest aspect. Reviewers who needed help — often with insurance, wallet top-ups or autopay — describe slow or unresolved complaints. Spam calls, notifications and occasional app slowdowns are the other recurring gripes.',
    ],
    claims: [
      { aspect: 'ease-of-use', sentiment: 'positive', text: 'Quick and easy to scan and pay' },
      { aspect: 'payment-success', sentiment: 'positive', text: 'Payments go through reliably' },
      { aspect: 'refunds-support', sentiment: 'negative', text: 'Support is slow to resolve problems' },
      { aspect: 'app-stability', sentiment: 'negative', text: 'App can be slow or buggy' },
      { aspect: 'ads-spam', sentiment: 'negative', text: 'Promotional calls and notifications' },
    ],
    faq: [
      {
        q: 'Is PhonePe safe to use?',
        a: 'Security complaints are uncommon in its reviews. The reports that do appear mostly describe scams that begin outside the app, such as calls asking for a PIN or for approval of a payment request. Never share your UPI PIN, and decline requests you did not start.',
      },
      {
        q: 'How do I get help from PhonePe support?',
        a: 'Reviewers describe using the help section inside the app, and support is also their most common complaint: responses can be slow for insurance, wallet and autopay issues. Keeping transaction IDs and screenshots ready makes it faster to escalate a problem.',
      },
    ],
  },
  zomato: {
    variant: 'Android & iPhone',
    answer:
      'Use it, with caveats. Deliveries mostly arrive and the app works well, but when an order goes wrong, support is the most common complaint, and many reviewers feel fees have crept up. Photograph problem orders before you contact support.',
    verdictBody: [
      'Zomato passes our deal-breakers for food delivery. Support is its biggest problem: complaints about refunds and customer care are the most frequent issue in its recent reviews.',
      'Fees and delivery times are the other recurring themes. Reviewers describe charges adding up at checkout and late or reassigned deliveries, and overall satisfaction sits just below our Buy line.',
    ],
    claims: [
      { aspect: 'delivery-speed', sentiment: 'positive', text: 'Comes through when other apps let people down' },
      { aspect: 'app-stability', sentiment: 'positive', text: 'Smooth app with live delivery updates' },
      { aspect: 'refunds-support', sentiment: 'negative', text: 'Support rarely resolves bad orders' },
      { aspect: 'fees', sentiment: 'negative', text: 'Small portions and high charges for the price' },
      { aspect: 'delivery-speed', sentiment: 'negative', text: 'Late or reassigned deliveries' },
      { aspect: 'order-accuracy', sentiment: 'negative', text: 'Missing or wrong items' },
    ],
    faq: [
      {
        q: 'How do I get a refund on Zomato?',
        a: 'Reviewers who got refunds usually reported the problem through in-app chat soon after delivery, with photos of the order. Complaints raised later, or without photos, are the ones most often described as closed without a refund. Support is the most common complaint in its reviews.',
      },
      {
        q: 'Why do Zomato orders cost more than at the restaurant?',
        a: 'Reviewers point to platform and delivery fees added at checkout, and to menu prices that can be higher on the app than in the restaurant itself. Fees are one of the most discussed complaints, so compare the final total rather than the menu price.',
      },
    ],
  },
}
