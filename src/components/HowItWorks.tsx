'use client'

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import type { Verdict } from '@/lib/types'

import { Icon, Stars, type IconName } from './Icon'

// "How does a verdict get made?" as a walkthrough: four steps that play in turn, each with a
// small animation of what that step does to real reviews. Step wording comes from Site settings;
// the figures are the live catalogue's. Plays only while on screen, pauses under the pointer or
// keyboard focus, has a pause button, and never auto-plays for readers who prefer reduced motion.

const DURATION = 6000 // ms per step

export interface WalkthroughData {
  sources: string[]
  incoming: { author: string; source: string; body: string; rating?: number }[]
  screened: { author: string; body: string; rating?: number; flagged: boolean }[]
  counted: number
  flagged: number
  aspects: { label: string; problem: number }[]
  product: { name: string; initial: string; score: number; verdict: Verdict; verdictLabel: string }
  editor?: string
}

const stepIcons: IconName[] = ['layers', 'flag', 'list', 'user']
const fmt = (n: number) => n.toLocaleString('en-IN')

const REDUCED = '(prefers-reduced-motion: reduce)'
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia(REDUCED).matches

/** Live reduced-motion preference; false while rendering on the server. */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    prefersReducedMotion,
    () => false,
  )
}

/** Counts from 0 to `target` once, after `delay` ms. Reduced motion shows the target at once. */
function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    if (prefersReducedMotion()) return // the initial value is already the target
    let raf = 0
    let start = 0
    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min(1, Math.max(0, (t - start - delay) / duration))
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, delay])
  return value
}

const delay = (ms: number): React.CSSProperties => ({ animationDelay: `${ms}ms` })

/** Step 1: every source pours into one pile. */
function CollectStage({ data }: { data: WalkthroughData }) {
  const total = useCountUp(data.counted + data.flagged, 1600, 600)
  return (
    <div className="flex h-full flex-col justify-center">
      <ul className="flex flex-wrap justify-center gap-2" aria-label="Sources">
        {data.sources.map((s, i) => (
          <li
            key={s}
            className="animate-rise rounded-pill border border-hairline bg-white px-3 py-1 text-micro shadow-l3"
            style={delay(i * 90)}
          >
            {s}
          </li>
        ))}
      </ul>
      {/* Three streams converging on the counter. */}
      <svg aria-hidden viewBox="0 0 300 56" preserveAspectRatio="none" className="mx-auto mt-2 h-12 w-3/4">
        {['M30 0 C30 30 150 26 150 56', 'M150 0 L150 56', 'M270 0 C270 30 150 26 150 56'].map((d) => (
          <path key={d} d={d} fill="none" strokeWidth="2" strokeDasharray="4 4" className="animate-flow stroke-shade-40" />
        ))}
      </svg>
      <p className="animate-pop mx-auto flex items-center gap-2 rounded-pill bg-indigo px-4 py-1.5 text-caption text-white" style={delay(400)}>
        <Icon name="message" className="size-4" />
        <span className="tabular-nums">{fmt(total)}</span> reviews of {data.product.name}
      </p>
      <ul className="relative mx-auto mt-5 h-32 w-full max-w-sm">
        {data.incoming.slice(0, 3).map((r, i) => (
          <li
            key={r.author + i}
            className="animate-rise absolute inset-x-0 rounded-lg border border-hairline bg-white p-3 shadow-l3"
            style={{ ...delay(900 + i * 450), top: `${i * 22}px`, zIndex: 3 - i, scale: `${1 - i * 0.05}`, opacity: 1 - i * 0.25 }}
          >
            <div className="flex items-center justify-between gap-3 text-micro">
              <span className="truncate text-body-strong">{r.author}</span>
              <span className="shrink-0 text-shade-60">{r.source}</span>
            </div>
            <p className="mt-1 truncate text-caption text-shade-60">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Step 2: a scan passes over the reviews and the manipulated ones drop out. */
function ScreenStage({ data }: { data: WalkthroughData }) {
  const set = useCountUp(data.flagged, 1000, 1800)
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden" style={{ '--scan-distance': '260px' } as React.CSSProperties}>
        <span
          aria-hidden
          className="animate-scan pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-transparent to-pink/25 [border-bottom:2px_solid_var(--color-pink)]"
        />
        <ul className="space-y-2">
          {data.screened.map((r, i) => (
            <li
              key={r.author + i}
              className="animate-rise flex items-center gap-3 rounded-md border border-hairline bg-white px-3 py-2"
              style={delay(i * 80)}
            >
              <div
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-md ${r.flagged ? 'animate-flag' : ''}`}
                style={r.flagged ? delay(500 + i * 380) : undefined}
              >
                <span className="text-indigo">
                  <Stars rating={r.rating ?? 5} className="size-3" />
                </span>
                <span className={`min-w-0 flex-1 truncate text-caption ${r.flagged ? 'line-through decoration-pink' : ''}`}>
                  {r.body}
                </span>
              </div>
              {r.flagged ? (
                <span
                  className="animate-pop inline-flex shrink-0 items-center gap-1 rounded-pill bg-blush px-2 py-0.5 text-micro"
                  style={delay(600 + i * 380)}
                >
                  <Icon name="flag" className="size-3" /> Fake
                </span>
              ) : (
                <span className="animate-pop shrink-0 text-indigo" style={delay(600 + i * 380)}>
                  <Icon name="check" className="size-4" />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="animate-rise rounded-lg bg-blush/60 p-3" style={delay(1800)}>
          <p className="text-micro">Set aside</p>
          <p className="font-display text-heading-xl tabular-nums">{fmt(set)}</p>
        </div>
        <div className="animate-rise rounded-lg bg-shade-30 p-3" style={delay(1950)}>
          <p className="text-micro">Kept and counted</p>
          <p className="font-display text-heading-xl tabular-nums">{fmt(data.counted)}</p>
        </div>
      </div>
    </div>
  )
}

function AspectRow({ label, problem, index }: { label: string; problem: number; index: number }) {
  const pct = useCountUp(Math.round(problem * 1000), 900, 300 + index * 220) / 10
  const notable = problem >= 0.1
  return (
    <li className="animate-rise" style={delay(index * 120)}>
      <div className="flex items-baseline justify-between gap-3 text-caption">
        <span className="text-body-strong">{label}</span>
        <span className="tabular-nums text-shade-60">{pct.toFixed(1)}% report a problem</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-pill bg-hairline">
        <div
          className={`animate-grow h-full origin-left rounded-pill ${notable ? 'bg-pink' : 'bg-indigo'}`}
          style={{ ...delay(300 + index * 220), width: `${Math.max(4, Math.min(1, problem / 0.4) * 100)}%` }}
        />
      </div>
    </li>
  )
}

/** Step 3: code tallies each aspect; nothing is estimated. */
function CountStage({ data }: { data: WalkthroughData }) {
  return (
    <div className="flex h-full flex-col">
      <p className="animate-rise flex items-center gap-2 text-caption text-shade-60">
        <Icon name="list" className="size-4 text-pink" />
        Counted from the {fmt(data.counted)} reviews of {data.product.name} we kept
      </p>
      <ul className="mt-5 space-y-5">
        {data.aspects.map((a, i) => (
          <AspectRow key={a.label} label={a.label} problem={a.problem} index={i} />
        ))}
      </ul>
      <p className="animate-rise mt-auto pt-4 text-micro text-shade-60" style={delay(1400)}>
        A pink bar is a notable con: one reviewer in ten or more reports a problem.
      </p>
    </div>
  )
}

/** Step 4: the rules produce a verdict and a named editor approves it. */
function SignStage({ data }: { data: WalkthroughData }) {
  const { product } = data
  const score = useCountUp(Math.round(product.score * 10), 1200, 200) / 10
  const chip =
    product.verdict === 'buy'
      ? 'bg-indigo text-white'
      : product.verdict === 'skip'
        ? 'bg-blush text-indigo'
        : 'bg-peach text-indigo'
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="animate-rise flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-peach font-display text-heading-lg">
          {product.initial}
        </span>
        <span className="text-heading-sm">{product.name}</span>
      </div>
      <div className="relative mt-5 size-32">
        <svg aria-hidden viewBox="0 0 40 40" className="size-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" strokeWidth="2.5" className="stroke-hairline" />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${product.score * 10} 101`}
            className={`animate-draw ${product.verdict === 'skip' ? 'stroke-pink' : 'stroke-indigo'}`}
            style={delay(200)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-display-sm leading-none tabular-nums">{score.toFixed(1)}</span>
          <span className="mt-1 text-micro text-shade-60">out of 10</span>
        </div>
      </div>
      <span
        className={`animate-pop mt-5 inline-flex items-center gap-2 rounded-pill py-2 pr-5 pl-4 text-body-strong ${chip}`}
        style={delay(1300)}
      >
        <Icon name={product.verdict === 'skip' ? 'x' : product.verdict === 'buy' ? 'check' : 'alert'} className="size-4" />
        {product.verdictLabel}
      </span>
      <div className="animate-rise mt-6 flex items-center gap-3 rounded-pill border border-hairline bg-white py-1.5 pr-4 pl-1.5 shadow-l3" style={delay(1900)}>
        <span className="relative flex size-8 items-center justify-center rounded-pill bg-indigo text-white">
          <span aria-hidden className="animate-pulse-ring absolute inset-0 rounded-pill bg-indigo" style={delay(2100)} />
          <Icon name="check" className="relative size-4" />
        </span>
        <span className="text-caption">
          Approved by <span className="text-body-strong">{data.editor ?? 'a named editor'}</span>
        </span>
      </div>
    </div>
  )
}

const stages = [CollectStage, ScreenStage, CountStage, SignStage]

export function HowItWorks({ steps, data }: { steps: { title: string; body: string }[]; data: WalkthroughData }) {
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  // null until the reader presses the button: then auto-play follows the motion preference.
  const [choice, setChoice] = useState<boolean | null>(null)
  const playing = choice ?? !reduced
  const [inView, setInView] = useState(false)
  const [held, setHeld] = useState(false) // pointer over, or keyboard focus inside
  const [run, setRun] = useState(0) // bumps when the section scrolls into view, replaying the stage
  const root = useRef<HTMLDivElement>(null)
  const wasInView = useRef(false)
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const elapsed = useRef(0)
  const n = steps.length

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasInView.current) setRun((r) => r + 1)
        wasInView.current = entry.isIntersecting
        setInView(entry.isIntersecting)
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const select = useCallback((i: number) => {
    elapsed.current = 0
    setActive(i)
  }, [])

  // Progress is drawn straight onto the bars each frame, so the stage doesn't re-render 60×/s.
  const running = playing && inView && !held
  useEffect(() => {
    bars.current.forEach((b, i) => {
      if (b) b.style.transform = `scaleX(${i === active ? elapsed.current / DURATION : 0})`
    })
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      elapsed.current += now - last
      last = now
      const p = Math.min(1, elapsed.current / DURATION)
      const bar = bars.current[active]
      if (bar) bar.style.transform = `scaleX(${p})`
      if (p >= 1) {
        elapsed.current = 0
        setActive((a) => (a + 1) % n)
      } else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, active, n])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!next) return
    e.preventDefault()
    const i = (active + next + n) % n
    select(i)
    document.getElementById(`how-tab-${i}`)?.focus()
  }

  const Stage = stages[Math.min(active, stages.length - 1)]

  return (
    <div
      ref={root}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
      className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch lg:gap-10"
    >
      <div className="flex flex-col">
        <div role="tablist" aria-label="Steps" onKeyDown={onKeyDown} className="grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-3">
          {steps.map((s, i) => {
            const on = i === active
            return (
              <button
                key={s.title}
                id={`how-tab-${i}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="how-stage"
                aria-label={s.title}
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                className={`group relative overflow-hidden rounded-lg text-left transition-colors lg:p-5 ${
                  on ? 'bg-white shadow-l3' : 'bg-white/40 hover:bg-white/70'
                } flex flex-col items-center gap-2 px-2 pt-3 pb-4 lg:flex-row lg:items-start lg:gap-4`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-pill transition-colors lg:size-11 ${on ? 'bg-indigo text-white' : 'bg-white text-indigo'}`}
                >
                  <Icon name={stepIcons[i % stepIcons.length]} className="size-5" />
                </span>
                <span className="text-micro tabular-nums text-shade-60 lg:hidden">{String(i + 1).padStart(2, '0')}</span>
                <span className="hidden min-w-0 lg:block">
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-heading-sm text-pink tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-heading-sm">{s.title}</span>
                  </span>
                  <span className={`mt-1 block text-caption ${on ? 'text-shade-60' : 'text-shade-50'}`}>{s.body}</span>
                </span>
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-hairline/60">
                  <span
                    ref={(el) => {
                      bars.current[i] = el
                    }}
                    className="block h-full origin-left bg-pink"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </span>
              </button>
            )
          })}
        </div>
        {/* Below the large breakpoint the tabs are compact, so the active step's words sit here. */}
        <div className="mt-4 lg:hidden" aria-live="polite">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-heading-md text-pink tabular-nums">{String(active + 1).padStart(2, '0')}</span>
            <span className="text-heading-md">{steps[active].title}</span>
          </p>
          <p className="mt-1 text-caption text-shade-60">{steps[active].body}</p>
        </div>
        <button
          type="button"
          onClick={() => setChoice(!playing)}
          className="mt-4 inline-flex min-h-11 items-center gap-2 self-start rounded-pill border border-indigo bg-white px-5 text-caption text-ink transition-colors hover:bg-cream lg:mt-auto lg:pt-0"
        >
          {playing ? (
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 fill-current">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 fill-current">
              <path d="M4 2.5v11a1 1 0 0 0 1.5.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5Z" />
            </svg>
          )}
          {playing ? 'Pause walkthrough' : 'Play walkthrough'}
        </button>
      </div>

      <div
        id="how-stage"
        role="tabpanel"
        aria-labelledby={`how-tab-${active}`}
        className="order-first rounded-xl bg-white p-5 shadow-l3 sm:p-7 lg:order-none"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-eyebrow uppercase text-shade-60">
            Step {active + 1} of {n}
          </p>
          <div aria-hidden className="flex gap-1.5">
            {steps.map((s, i) => (
              <span key={s.title} className={`h-1.5 rounded-pill transition-all ${i === active ? 'w-6 bg-pink' : 'w-1.5 bg-shade-30'}`} />
            ))}
          </div>
        </div>
        <div className="h-[22rem] sm:h-[23rem]">
          <Stage key={`${active}-${run}`} data={data} />
        </div>
      </div>
    </div>
  )
}
