'use client'

import { useEffect } from 'react'

/**
 * Marks this browser as an editor's, so the public site knows it's worth asking whether someone
 * is logged in (and showing "Edit this page"). Readers' browsers never get the flag, so they never
 * make that request.
 */
export function EditorFlag() {
  useEffect(() => {
    try {
      localStorage.setItem('rl-editor', '1')
    } catch {
      // Storage blocked: the site simply won't show the edit button.
    }
  }, [])
  return null
}
