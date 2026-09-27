import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { redirectFor } from './catalog'

/**
 * A page that doesn't exist: follow a redirect if one is set up for this address (Website →
 * Redirects in the admin, or made automatically when a web address changed), else show 404.
 */
export function notFoundOrRedirect(path: string): never {
  const target = redirectFor(path)
  // Normally answered earlier by src/proxy.ts with a real 301/302/410; this is the fallback.
  if (target?.to) (target.status === 301 ? permanentRedirect : redirect)(target.to)
  notFound()
}
