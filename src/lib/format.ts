const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const count = new Intl.NumberFormat('en-IN')
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
export const formatCount = (n: number) => count.format(n)
export const formatDate = (iso: string) => longDate.format(new Date(iso))
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso))
export const formatPct = (share: number) => `${Math.round(share * 100)}%`
export const formatRating = (n: number) => n.toFixed(1)
export const formatScore = (n: number) => n.toFixed(1)

export const isoDate = (iso: string) => iso.slice(0, 10)
