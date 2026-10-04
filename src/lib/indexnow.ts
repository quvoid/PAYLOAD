import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

// IndexNow: when a page is published or changed, tell Bing (and Yandex, Naver, Seznam, Yep —
// they share submissions) straight away instead of waiting for the next crawl. Bing's index also
// feeds ChatGPT search and Copilot. Google doesn't take part; it keeps using the sitemap.
//
// Off until INDEXNOW_KEY is set (any 8–128 letters, digits or dashes). The key is served at
// /indexnow-key.txt so the search engines can check this site sent it. Never pings from a
// localhost or http:// address, so development and preview builds stay quiet.

const ENDPOINT = 'https://api.indexnow.org/indexnow'

export const indexNowKey = () => {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : undefined
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

/** Submits public addresses; failures are logged, never thrown — publishing must not depend on it. */
export async function submitToIndexNow(paths: string[], log?: (msg: string) => void) {
  const key = indexNowKey()
  const site = siteUrl()
  if (!key || !site.startsWith('https://') || paths.length === 0) return
  const host = new URL(site).host
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${site}/indexnow-key.txt`,
        urlList: [...new Set(paths)].map((p) => `${site}${p}`),
      }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok && res.status !== 202) log?.(`IndexNow: ${res.status} for ${paths.join(', ')}`)
  } catch (e) {
    log?.(`IndexNow: ${(e as Error).message}`)
  }
}

/**
 * afterChange hook: ping when a document is published (or a published one is saved again).
 * Drafts and autosaves are skipped, and so are seed and import runs (context.skipRefresh).
 */
type PathOf = (doc: Record<string, unknown>, req: PayloadRequest) => string | undefined | Promise<string | undefined>

export const pingIndexNow =
  (path: PathOf): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, context }) => {
    if (context?.skipRefresh || !indexNowKey()) return doc
    if (doc?._status === 'draft') return doc
    try {
      // Addresses are worked out inside the save (they may read the database); only the network
      // call is left to finish in the background, so publishing never waits on Bing.
      const paths = [await path(doc, req)]
      // A changed address: tell them about the old one too, so its redirect is picked up.
      if (previousDoc?.slug && previousDoc.slug !== doc.slug) paths.push(await path(previousDoc, req))
      void submitToIndexNow(paths.filter((p): p is string => Boolean(p)), (m) => req.payload.logger.warn(m))
    } catch (e) {
      req.payload.logger.warn(`IndexNow: ${(e as Error).message}`)
    }
    return doc
  }
