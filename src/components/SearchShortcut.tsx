'use client'

import { useEffect } from 'react'

/** Pressing "/" anywhere outside a text field jumps to the first visible search box. */
export function SearchShortcut() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return
      const box = [...document.querySelectorAll<HTMLInputElement>('input[name="q"]')].find((i) => i.offsetParent)
      if (!box) return
      e.preventDefault()
      box.focus()
      box.select()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}
