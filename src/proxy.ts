import { NextResponse, type NextRequest } from 'next/server'

// Runs before any page renders. Answers old addresses with real status codes, which pages can't:
//   301/302 → the redirects editors manage under Website → Redirects (one Location header)
//   410     → pages removed on purpose ("Gone"), which search engines drop faster than a 404
// and sends /Reviews/X to /reviews/x, since every address on the site is lowercase.

type Rule = { status: 301 | 302 | 410; to?: string }

// Rules are fetched from the app (src/app/redirect-rules.json) and kept for 30 seconds.
const TTL = 30_000
let cache: { at: number; rules: Record<string, Rule> } | null = null

async function rules(origin: string) {
  if (cache && Date.now() - cache.at < TTL) return cache.rules
  try {
    const res = await fetch(`${origin}/redirect-rules.json`, { cache: 'no-store' })
    if (res.ok) cache = { at: Date.now(), rules: await res.json() }
  } catch {
    // Keep serving with the last rules we had (or none) rather than failing the request.
  }
  return cache?.rules ?? {}
}

const gone = () =>
  new NextResponse(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>This page has been removed</h1><p>It is no longer part of the site. <a href="/">Go to the homepage</a>.</p></body></html>',
    { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } },
  )

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  const rule = (await rules(request.nextUrl.origin))[path]
  if (rule?.status === 410) return gone()
  if (rule?.to) {
    const target = new URL(rule.to, request.url)
    if (!/^https?:/.test(rule.to)) target.search = search
    return NextResponse.redirect(target, rule.status)
  }

  if (path !== path.toLowerCase()) {
    return NextResponse.redirect(new URL(`${path.toLowerCase()}${search}`, request.url), 301)
  }
  return NextResponse.next()
}

export const config = {
  // Site pages only: not the admin, the API, Next.js assets, images/scripts/sitemaps, or the rules.
  // Other extensions (an old /page.html, say) still pass through, so they can be redirected.
  matcher: [
    '/((?!admin|api|_next|redirect-rules\\.json|.*\\.(?:png|jpe?g|gif|svg|ico|webp|avif|css|js|map|txt|xml|woff2?)$).*)',
  ],
}
