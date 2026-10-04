import { Inter } from 'next/font/google'
import React from 'react'

import { EditorFlag } from './EditorFlag'

// Admin logo, icon and typeface: the same five palette bars and Inter as the public site.

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const bars = [
  { h: 11, y: 13, fill: '#51e5ff' },
  { h: 16, y: 8, fill: 'currentColor' }, // indigo on light, white on the dark theme
  { h: 13, y: 11, fill: '#ec368d' },
  { h: 9, y: 15, fill: '#ffa5a5' },
  { h: 6, y: 18, fill: '#ffd6c0' },
]

function Bars({ size }: { size: number }) {
  return (
    <svg aria-hidden viewBox="4 6 25 20" width={size * 1.25} height={size} style={{ color: 'var(--rl-ink, #440381)' }}>
      {bars.map((b, i) => (
        <rect key={i} x={6 + i * 4.5} y={b.y} width={3} height={b.h} rx={1.5} fill={b.fill} />
      ))}
    </svg>
  )
}

export function AdminLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'var(--rl-ink, #440381)' }}>
      <Bars size={34} />
      <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em' }}>
        Review<span style={{ fontWeight: 300 }}>Lens</span>
      </span>
    </span>
  )
}

export function AdminIcon() {
  return <Bars size={20} />
}

/**
 * Wraps the admin (admin.components.providers) to load Inter through next/font — self-hosted,
 * no request to Google — and hand it to Payload as its body font. Also flags the browser as an
 * editor's, for the site's "Edit this page" button.
 */
export function AdminFont({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <style>{`:root{--font-body:${inter.style.fontFamily},-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}`}</style>
      <EditorFlag />
      {children}
    </>
  )
}
