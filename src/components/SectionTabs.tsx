'use client'

import React, { useEffect, useState } from 'react'

/**
 * In-page section links that stick under the header, with the section being read marked. Plain
 * anchors, so they work before (and without) JavaScript; the script only moves the marker.
 */
export function SectionTabs({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el))
    // A section counts as being read once its top passes the upper third of the window.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[calc(4.5rem+1px)] z-20 -mx-4 border-b border-hairline bg-white/90 px-4 backdrop-blur-lg md:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
    >
      <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? 'location' : undefined}
              className={`inline-flex min-h-12 items-center whitespace-nowrap border-b-2 px-3 text-caption transition-colors ${
                active === i.id ? 'border-pink text-ink' : 'border-transparent text-shade-60 hover:text-ink'
              }`}
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
