'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// A thin brand-gradient bar across the top of the window while the next page loads, so a
// 1–2 second server render never looks like a dead click. It starts on any click on a link to
// another page of this site (and on GET forms such as search) and finishes when the address
// changes. Navigations that finish quickly never show it.

const SHOW_AFTER = 120 // ms: prefetched pages arrive before this, so they don't flash the bar
const GIVE_UP_AFTER = 15_000 // ms: a cancelled or failed navigation never leaves it stuck

type Phase = 'idle' | 'loading' | 'done'

/** The URL a click would navigate to, or null if it stays on this page or leaves the site. */
function destination(event: MouseEvent): URL | null {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null
  const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!link || link.hasAttribute('download')) return null
  if (link.target && link.target !== '_self') return null
  const url = new URL(link.href, window.location.href)
  if (url.origin !== window.location.origin) return null
  // Same page (or only a #section on it): nothing to load.
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null
  return url
}

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)
  const active = useRef(false)

  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (trickle.current) clearInterval(trickle.current)
    trickle.current = null
  }, [])

  const reset = useCallback(() => {
    clear()
    active.current = false
    setPhase('idle')
    setProgress(0)
  }, [clear])

  const start = useCallback(() => {
    clear()
    active.current = true
    timers.current.push(
      setTimeout(() => {
        setProgress(0.08)
        setPhase('loading')
        // Creep towards 90% ever more slowly; the last stretch is covered when the page arrives.
        trickle.current = setInterval(() => setProgress((p) => p + (0.9 - p) * 0.08), 200)
      }, SHOW_AFTER),
      setTimeout(reset, GIVE_UP_AFTER),
    )
  }, [clear, reset])

  // The new page has arrived: run to the end, then fade out.
  useEffect(() => {
    if (!active.current) return
    const shown = trickle.current !== null
    clear()
    active.current = false
    if (!shown) return reset() // arrived before the bar showed
    setProgress(1)
    setPhase('done')
    timers.current.push(
      setTimeout(() => setPhase('idle'), 250),
      setTimeout(() => setProgress(0), 500),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs only when the address changes
  }, [pathname, searchParams])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (destination(event)) start()
    }
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement
      // Only forms that load a page. Server-action forms show their own "Sending…" state.
      if (form.method === 'get') start()
    }
    // Coming back through the browser's back/forward cache restores the page mid-load.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reset()
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
      window.removeEventListener('pageshow', onPageShow)
      clear()
    }
  }, [start, reset, clear])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]">
      <div
        className={`h-full origin-left bg-brand-gradient transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none ${
          phase === 'idle' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
