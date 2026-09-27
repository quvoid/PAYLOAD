import type { Payload } from 'payload'

// Near-duplicate check for generated and templated pages (docs: programmatic-seo). Each page's
// words become a set of 3-word sequences ("shingles"); two pages' Jaccard distance is the share
// of sequences they don't have in common: 0 = identical, 1 = nothing shared. Pages closer than
// the threshold to another page of the same type risk being treated as thin duplicates.

export const UNIQUENESS_THRESHOLD = 0.4

export const UNIQUE_COLLECTIONS = ['products', 'best-lists', 'comparisons', 'guides', 'pages'] as const
export type UniqueCollection = (typeof UNIQUE_COLLECTIONS)[number]

type Doc = Record<string, unknown>

/** Plain text of a rich text (Lexical) document. */
const richText = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: string; children?: unknown[]; root?: unknown; fields?: { text?: string } }
  if (n.root) return richText(n.root)
  return [n.text ?? '', n.fields?.text ?? '', ...(n.children ?? []).map(richText)].join(' ')
}
const rows = (list: unknown, ...keys: string[]) =>
  (Array.isArray(list) ? list : []).flatMap((r) => keys.map((k) => String((r as Doc)?.[k] ?? '')))

/** The words a reader sees that editors wrote (numbers filled in by code are left out). */
export function docText(collection: UniqueCollection, d: Doc): string {
  switch (collection) {
    case 'products':
      return [d.answer, d.verdictBody, ...rows(d.claims, 'text'), ...rows(d.faq, 'q', 'a')].join(' ')
    case 'best-lists':
      return [d.title, d.qualifier, d.intro, ...rows(d.faq, 'q', 'a')].join(' ')
    case 'comparisons':
      return [d.judgement, ...rows(d.pickIf, 'text')].join(' ')
    case 'guides':
      return [d.title, d.explainer, ...rows(d.faq, 'q', 'a')].join(' ')
    case 'pages':
      return [d.title, d.intro, richText(d.content)].join(' ')
  }
}

export function shingles(text: string, size = 3): Set<string> {
  const words = text.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu) ?? []
  const out = new Set<string>()
  for (let i = 0; i + size <= words.length; i++) out.add(words.slice(i, i + size).join(' '))
  return out
}

export function jaccardDistance(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 0
  let shared = 0
  for (const s of a) if (b.has(s)) shared++
  return 1 - shared / (a.size + b.size - shared)
}

export interface Nearest {
  distance: number
  /** Too little text to judge (fewer than 20 word sequences). */
  tooShort: boolean
  nearest?: { id: number | string; title: string }
}

const titleOf = (d: Doc) => String(d.title ?? d.name ?? d.slug ?? d.id)

/** How different a document is from the most similar published document of the same type. */
export function nearestTo(collection: UniqueCollection, doc: Doc, others: Doc[]): Nearest {
  const mine = shingles(docText(collection, doc))
  if (mine.size < 20) return { distance: 1, tooShort: true }
  let best: Nearest = { distance: 1, tooShort: false }
  for (const o of others) {
    if (o.id === doc.id) continue
    const d = jaccardDistance(mine, shingles(docText(collection, o)))
    if (d < best.distance) best = { distance: d, tooShort: false, nearest: { id: o.id as number, title: titleOf(o) } }
  }
  return best
}

/** The published documents a new one is compared with. */
export const publishedDocs = async (payload: Payload, collection: UniqueCollection) =>
  (
    await payload.find({
      collection,
      where: { _status: { equals: 'published' } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })
  ).docs as unknown as Doc[]
