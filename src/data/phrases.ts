import type { Sentiment } from '@/lib/types'

type Phrases = Partial<Record<Sentiment, string[]>>

// Building blocks for generated sample reviews, keyed by aspect then sentiment.
export const phrases: Record<string, Phrases> = {
  taste: {
    positive: [
      'Chocolate flavour tastes like a proper milkshake, not chalky.',
      'Taste is genuinely good — I look forward to it after training.',
      'Not too sweet, which I prefer.',
    ],
    neutral: ['Taste is okay, nothing special.'],
    negative: [
      'Taste is artificial and far too sweet for me.',
      'Strong aftertaste — I have to mix it with coffee to get it down.',
      'Gritty and earthy, hard to drink with just water.',
    ],
  },
  mixability: {
    positive: [
      'Mixes cleanly in a shaker with no lumps.',
      'Dissolves in about twenty seconds, even in cold water.',
    ],
    negative: [
      'Leaves clumps at the bottom unless I use a blender.',
      'Foams a lot and takes ages to settle.',
    ],
  },
  digestion: {
    positive: [
      'No bloating or acidity, even on an empty stomach.',
      "Easy on the stomach, and I'm usually sensitive to whey.",
    ],
    negative: [
      'Gives me bloating almost every time.',
      'Stomach feels heavy for hours after a scoop.',
    ],
  },
  value: {
    positive: [
      'Good price per gram of protein, especially during a sale.',
      "Cheaper per serving than most of what I've tried.",
      'Lasts long for the price.',
    ],
    negative: ['Too expensive for what it is.', 'Price has gone up twice in six months.'],
  },
  authenticity: {
    positive: [
      'Authenticity code on the tub verified fine.',
      'Seal and batch number checked out with the brand.',
    ],
    negative: [
      'Seal looked tampered with — I suspect a fake.',
      'Tasted different from my last tub; worried it is a duplicate.',
    ],
  },
  'label-accuracy': {
    positive: [
      'An independent lab test I watched matched the label.',
      'Protein per scoop feels right — my tracked macros line up.',
    ],
    negative: [
      'An independent lab test found less protein than the label claims.',
      'The scoop holds noticeably less than the serving size on the label.',
    ],
  },
  'white-cast': {
    positive: ['No white cast at all on my wheatish skin.', 'Blends in completely within a minute.'],
    negative: ['Leaves a visible white cast on my dusky skin.', 'Looks ashy in photos.'],
  },
  texture: {
    positive: ['Lightweight gel, absorbs fast.', 'Not greasy even in Mumbai humidity.'],
    negative: ['Feels sticky and heavy by afternoon.', 'Pills when I put makeup over it.'],
  },
  breakouts: {
    positive: [
      'No breakouts after a month of daily use.',
      'Does not clog my pores, and I have acne-prone skin.',
    ],
    negative: ['Broke me out within a week.', 'Got small bumps on my forehead after using it.'],
  },
  protection: {
    positive: ['No tanning even on a beach trip.', 'Held up through a full day outdoors.'],
    negative: ['Still got tanned after two hours in the sun.', 'Needs reapplying far too often.'],
  },
  fragrance: {
    positive: ['Barely any smell, which I like.'],
    negative: ['Strong perfume smell that gave me a headache.'],
  },
  'delivery-speed': {
    positive: ['Food arrived before the estimated time, still hot.', 'Delivery is consistently quick in my area.'],
    negative: ['Delivery took over an hour and the food was cold.', 'The estimated time keeps increasing after I order.'],
  },
  'order-accuracy': {
    positive: ['Orders always arrive complete and correct.', 'Never had a missing item so far.'],
    negative: ['Items missing from my order twice this month.', 'Received someone else’s order.'],
  },
  'refunds-support': {
    positive: ['Support refunded a missing item within minutes.', 'Customer care actually solved my problem.'],
    negative: [
      'Support closed my complaint without a refund.',
      'Only a chatbot, no way to reach a real person.',
      'Money was debited but support keeps saying wait.',
    ],
  },
  fees: {
    positive: ['Delivery fee is reasonable and shown upfront.', 'Membership pays for itself if you order often.'],
    negative: ['Platform fee, packing fee, rain fee — the total keeps growing.', 'Prices are higher than in the restaurant.'],
  },
  'app-stability': {
    positive: ['App is smooth and never crashes.', 'Works fine even on my old phone.'],
    negative: ['App crashes at checkout.', 'Keeps logging me out after the latest update.'],
  },
  'payment-success': {
    positive: ['Payments go through instantly, even at small shops.', 'Never had a failed transaction.'],
    negative: ['Payment failed but money was debited from my account.', 'Transactions keep getting stuck in pending.'],
  },
  security: {
    positive: ['Feels secure — app lock and alerts for every payment.', 'Quick to block my account when I reported fraud.'],
    negative: ['Got a fraud call right after signing up.', 'Asks for too many permissions I do not need.'],
  },
  'ease-of-use': {
    positive: ['Clean, simple interface — easy for my parents too.', 'Scanning and paying takes two taps.'],
    negative: ['Too many screens before I can pay.', 'The new design hides the scan button.'],
  },
  'ads-spam': {
    positive: ['No ads, no pointless notifications.'],
    negative: ['Full of loan offers and ads.', 'Spam notifications every hour.'],
  },
}

// Reviews written in Hindi or Hinglish. The English is what analysis runs on; the original is shown.
export const originals: Record<
  string,
  Partial<Record<Sentiment, { text: string; lang: 'hi' | 'hi-Latn'; en: string }[]>>
> = {
  taste: {
    positive: [
      {
        text: 'Chocolate flavour ekdum badhiya hai, doodh ke saath aur bhi accha lagta hai.',
        lang: 'hi-Latn',
        en: 'The chocolate flavour is excellent, and even better with milk.',
      },
    ],
  },
  digestion: {
    positive: [
      {
        text: 'स्वाद अच्छा है, पेट में कोई दिक्कत नहीं हुई।',
        lang: 'hi',
        en: 'Tastes good, and no stomach trouble at all.',
      },
    ],
    negative: [
      {
        text: 'Bhai taste mast hai but bloating hota hai.',
        lang: 'hi-Latn',
        en: 'The taste is great, but it causes bloating.',
      },
    ],
  },
  value: {
    positive: [
      { text: 'Sale mein liya, paisa vasool.', lang: 'hi-Latn', en: 'Bought it on sale — worth the money.' },
    ],
  },
  mixability: {
    negative: [
      {
        text: 'Shaker mein ghulta nahi, gutthliyan reh jaati hain.',
        lang: 'hi-Latn',
        en: "Doesn't dissolve in a shaker; lumps are left behind.",
      },
    ],
  },
  texture: {
    positive: [
      {
        text: 'Chipchipa nahi hai, office ke liye perfect.',
        lang: 'hi-Latn',
        en: 'Not sticky at all — perfect for the office.',
      },
    ],
  },
  breakouts: {
    negative: [
      {
        text: 'Isse mere chehre pe daane aa gaye.',
        lang: 'hi-Latn',
        en: 'This gave me pimples on my face.',
      },
    ],
  },
  'delivery-speed': {
    negative: [
      { text: 'Delivery bahut late hoti hai, khana thanda aata hai.', lang: 'hi-Latn', en: 'Delivery is very late and the food arrives cold.' },
    ],
  },
  'payment-success': {
    negative: [
      {
        text: 'Paisa kat gaya par payment fail dikha raha hai.',
        lang: 'hi-Latn',
        en: 'Money was deducted but it shows the payment as failed.',
      },
    ],
    positive: [
      { text: 'पेमेंट तुरंत हो जाता है, कोई दिक्कत नहीं।', lang: 'hi', en: 'Payments go through instantly, no problems.' },
    ],
  },
  'refunds-support': {
    negative: [
      { text: 'Customer care se koi reply nahi aata.', lang: 'hi-Latn', en: 'Customer care never replies.' },
    ],
  },
}

/** The generic one-liners that show up in bursts of manipulated 5★ reviews. */
export const generic = [
  'Good product.',
  'Nice 👍',
  'Value for money.',
  'Best product, must buy.',
  'Very good quality.',
  'Excellent.',
]

export const reviewers = {
  marketplace: [
    'Amazon Customer',
    'Rohit K.',
    'Sneha P.',
    'Verified buyer',
    'Karthik R.',
    'Ananya S.',
    'Imran A.',
    'Meera J.',
    'Vikram T.',
    'Pooja D.',
  ],
  reddit: ['u/lifts_in_pune', 'u/desi_gains', 'u/sunscreen_nerd', 'u/budget_bulk', 'u/skin_in_blr'],
  youtube: ['FitWithRahul', 'Gym Truths India', 'Skin Science Hindi', 'LabTested', 'Budget Gains'],
  appStore: ['Rahul Verma', 'Neha', 'A Google user', 'Sandeep K', 'Divya R', 'techie_ravi', 'Farhan', 'Kavya'],
}
