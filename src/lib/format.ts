const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const count = new Intl.NumberFormat('en-IN')
const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 })
const longDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})
const shortDate = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
})

export const formatINR = (n: number) => inr.format(n)
/** Prices of 0 are free apps. */
export const formatPrice = (n: number) => (n === 0 ? 'Free' : inr.format(n))
/** Indian-style short counts: 12L, 1.2Cr. */
export const formatCompact = (n: number) => compact.format(n)
export const formatCount = (n: number) => count.format(n)
export const formatDate = (iso: string) => longDate.format(new Date(iso))
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso))
export const formatPct = (share: number) => `${Math.round(share * 100)}%`
/** Problem rates keep a decimal so a value just under a threshold never reads as the threshold. */
export const formatRate = (share: number) => `${(share * 100).toFixed(1)}%`
export const formatRating = (n: number) => n.toFixed(1)
export const formatScore = (n: number) => n.toFixed(1)

export const isoDate = (iso: string) => iso.slice(0, 10)

/** Lowercase a name for use mid-sentence, keeping acronyms: "UPI & Payment Apps" → "UPI & payment apps". */
export const inSentence = (name: string) =>
  name
    .split(' ')
    .map((w) => (/^[A-Z0-9+]{2,}$/.test(w) ? w : w.toLowerCase()))
    .join(' ')
