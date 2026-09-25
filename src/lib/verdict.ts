import type { Verdict } from './types'

export const verdictMeta: Record<
  Verdict,
  { label: string; glyph: string; summary: string }
> = {
  buy: { label: 'Buy', glyph: '✓', summary: 'Worth buying for most people.' },
  'buy-with-caveats': {
    label: 'Buy, with caveats',
    glyph: '!',
    summary: 'Worth buying, with a catch you should know about.',
  },
  skip: { label: 'Skip', glyph: '✕', summary: 'Better options exist.' },
  'thin-data': {
    label: 'Not enough data',
    glyph: '?',
    summary: "Too few reviews to judge fairly — we'd rather say so.",
  },
}
