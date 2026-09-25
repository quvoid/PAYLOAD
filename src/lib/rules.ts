// Every threshold the site applies. The methodology page renders these values directly,
// so what we publish about how we score can never drift from what the code does.
export const RULES = {
  /** A pro or con is only shown when at least this many reviews back it. */
  minEvidencePerClaim: 2,
  /** Collected reviews needed for each confidence level. Below `medium` the verdict is Thin data. */
  confidence: { high: 80, medium: 40 },
  /** Reviews scoring below this credibility are flagged as likely manipulated. */
  suspiciousBelow: 0.3,
  /** Composite score (0–10) needed for Buy, and for Buy with caveats. */
  verdict: { buy: 7.5, caveats: 6 },
  /** Share of a deal-breaker aspect's mentions that can be negative before it forces a Skip. */
  dealBreakerNegativeShare: 0.5,
  /**
   * A con big enough to turn Buy into Buy with caveats: at least this share of an aspect's
   * mentions are negative, and at least this share of all reviewers mention the aspect.
   */
  notableCon: { negativeShare: 0.35, mentionShare: 0.1 },
  /** An aspect needs this many mentions before it counts toward the composite score. */
  minMentionsPerAspect: 5,
  answerMaxChars: 320,
  alternatives: 3,
  /** A category-wide comparison table is published once a category has this many products. */
  categoryCompareMinProducts: 3,
} as const
