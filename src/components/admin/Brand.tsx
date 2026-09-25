import React from 'react'

// Admin logo and icon: the same five palette bars as the public wordmark.

const bars = [
  { h: 11, y: 13, fill: '#51e5ff' },
  { h: 16, y: 8, fill: '#440381' },
  { h: 13, y: 11, fill: '#ec368d' },
  { h: 9, y: 15, fill: '#ffa5a5' },
  { h: 6, y: 18, fill: '#ffd6c0' },
]

function Bars({ size }: { size: number }) {
  return (
    <svg aria-hidden viewBox="4 6 25 20" width={size * 1.25} height={size}>
      {bars.map((b, i) => (
        <rect key={i} x={6 + i * 4.5} y={b.y} width={3} height={b.h} rx={1.5} fill={b.fill} />
      ))}
    </svg>
  )
}

export function AdminLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Bars size={32} />
      <span style={{ fontSize: 26, fontWeight: 500 }}>
        Review<span style={{ fontWeight: 300 }}>Lens</span>
      </span>
    </span>
  )
}

export function AdminIcon() {
  return <Bars size={20} />
}
