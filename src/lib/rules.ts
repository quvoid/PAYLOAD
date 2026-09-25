// Every threshold the site applies. These are the defaults; the live values come from the
// "Scoring rules" settings in the admin (copied in by store.ts). The methodology page renders
// these values directly, so what we publish about how we score never drifts from what we do.
export const RULES = {
  /** A pro or con is only shown when at least this many reviews back it. */
  minEvidencePerClaim: 2,
  /** Collected reviews needed for each confidence level. Below `medium` the verdict is Thin data. */
  confidence: { high: 80, medium: 40 },
  /** Reviews scoring below this credibility are flagged as likely manipulated. */
  suspiciousBelow: 0.3,
  /** Satisfaction score (0–10) needed for Buy, and for Buy with caveats. */
  verdict: { buy: 7.5, caveats: 6 },
  /**
   * Problem rate: the share of ALL counted reviewers who report a problem with an aspect. Judged
   * against everyone, not just those who mention the aspect — specific reviews are mostly
   * complaints, so "share of mentions that are negative" makes every popular product look bad.
   */
  /** A deal-breaker aspect fails — forcing a Skip — at this problem rate (1 in 5 reviewers). */
  dealBreakerProblemRate: 0.2,
  /** An aspect becomes a notable con — turning Buy into Buy with caveats — at this problem rate. */
  notableConProblemRate: 0.1,
  /** An aspect needs this many mentions before it can be judged at all. */
  minMentionsPerAspect: 5,
  answerMaxChars: 320,
  alternatives: 3,
  /** A category-wide comparison table is published once a category has this many products. */
  categoryCompareMinProducts: 3,
}
