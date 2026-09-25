import type { Review, Sentiment, SourceId } from '@/lib/types'

import { generic, originals, phrases, reviewers } from './phrases'
import { sources } from './taxonomy'

/** How often an aspect comes up, and how often that mention is positive. */
export type AspectProfile = Record<string, { mention: number; positive: number }>

export interface ReviewPlan {
  seed: number
  updatedAt: string
  profile: AspectProfile
  /** Reviews collected per source. */
  collect: Partial<Record<SourceId, number>>
  /** Size of a burst of generic 5★ reviews, flagged as likely manipulated. */
  burst?: number
  /** Where the burst lands. Defaults to Amazon. */
  burstSource?: SourceId
}

// mulberry32: small seeded PRNG so the sample catalogue is identical on every build.
function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DAY = 86_400_000

export function generateReviews(plan: ReviewPlan): Review[] {
  const rand = rng(plan.seed)
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
  const end = new Date(plan.updatedAt).getTime()
  const reviews: Review[] = []
  let n = 0
  const nextId = () => `${plan.seed}${String(++n).padStart(3, '0')}`

  for (const [sourceId, total] of Object.entries(plan.collect) as [SourceId, number][]) {
    const source = sources.find((s) => s.id === sourceId)!
    for (let i = 0; i < total; i++) {
      const tagged: { aspect: string; sentiment: Sentiment }[] = []
      for (const [aspect, p] of Object.entries(plan.profile)) {
        if (rand() >= p.mention) continue
        const sentiment: Sentiment =
          rand() < p.positive ? 'positive' : rand() < 0.2 ? 'neutral' : 'negative'
        tagged.push({ aspect, sentiment })
      }
      if (tagged.length === 0) {
        const aspect = pick(Object.keys(plan.profile))
        tagged.push({
          aspect,
          sentiment: rand() < plan.profile[aspect].positive ? 'positive' : 'negative',
        })
      }

      let original: Review['original']
      const sentences: string[] = []
      for (const t of tagged) {
        const translated = originals[t.aspect]?.[t.sentiment]
        const writesHindi = source.kind === 'marketplace' || source.kind === 'app-store'
        if (!original && writesHindi && translated && rand() < 0.35) {
          const o = pick(translated)
          original = { text: o.text, lang: o.lang }
          sentences.push(o.en)
          continue
        }
        const options = phrases[t.aspect]?.[t.sentiment] ?? phrases[t.aspect]?.positive ?? []
        if (options.length) sentences.push(pick(options))
      }

      const pos = tagged.filter((t) => t.sentiment === 'positive').length
      const neg = tagged.filter((t) => t.sentiment === 'negative').length
      const rating = source.hasRatings
        ? Math.max(1, Math.min(5, Math.round(3.4 + (pos - neg) * 0.9 + (rand() - 0.5) * 1.2)))
        : undefined
      const verified = source.kind === 'marketplace' ? rand() < 0.85 : false
      const body = sentences.join(' ')
      const credibility = Math.min(
        1,
        0.5 + (verified ? 0.25 : 0) + Math.min(0.2, body.length / 500) + rand() * 0.05,
      )

      reviews.push({
        id: nextId(),
        source: sourceId,
        rating,
        author:
          sourceId === 'reddit'
            ? pick(reviewers.reddit)
            : sourceId === 'youtube'
              ? pick(reviewers.youtube)
              : source.kind === 'app-store'
                ? pick(reviewers.appStore)
                : pick(reviewers.marketplace),
        date: new Date(end - Math.floor(rand() * 330) * DAY).toISOString(),
        body,
        original,
        aspects: tagged,
        verified,
        credibility: Math.round(credibility * 100) / 100,
      })
    }
  }

  // A burst: generic 5★ reviews, mostly unverified, all inside three days.
  const burstStart = end - (40 + Math.floor(rand() * 120)) * DAY
  for (let i = 0; i < (plan.burst ?? 0); i++) {
    reviews.push({
      id: nextId(),
      source: plan.burstSource ?? 'amazon',
      rating: 5,
      author: pick(reviewers.marketplace),
      date: new Date(burstStart + Math.floor(rand() * 3) * DAY).toISOString(),
      body: pick(generic),
      aspects: [],
      verified: rand() < 0.2,
      credibility: 0.12,
    })
  }

  return reviews.sort((a, b) => b.date.localeCompare(a.date))
}
