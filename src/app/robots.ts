import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/seo'
import { ensureCatalog, settings } from '@/lib/store'

// Built from Settings → Site settings → Crawlers. AI search crawlers are allowed by default: being
// cited by answer engines is the distribution strategy (docs/PLAN.md §7).
// Read on every request, so changes in the admin apply at once.
export const dynamic = 'force-dynamic'

/** Crawlers that fetch pages to answer a user's question, and cite them. */
const AI_SEARCH = ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User']
/** Crawlers that collect pages to train models. */
const AI_TRAINING = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'anthropic-ai', 'CCBot', 'Applebot-Extended', 'Bytespider', 'meta-externalagent']

export default async function robots(): Promise<MetadataRoute.Robots> {
  await ensureCatalog()
  if (settings.hideFromSearch) return { rules: [{ userAgent: '*', disallow: '/' }] }
  const disallow = ['/admin/', '/api/', '/search', ...settings.blockedPaths]
  const blocked = [...(settings.allowAiSearch ? [] : AI_SEARCH), ...(settings.allowAiTraining ? [] : AI_TRAINING)]
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...(blocked.length ? [{ userAgent: blocked, disallow: '/' }] : []),
    ],
    // One sitemap index, which lists the sitemap for each page type.
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
