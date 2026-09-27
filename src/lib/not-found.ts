import { notFound, permanentRedirect, redirect } from 'next/navigation'

import { redirectFor } from './catalog'

/**
 * A page that doesn't exist: follow a redirect if one is set up for this address (Website →
 * Redirects in the admin, or made automatically when a web address changed), else show 404.
 */
export function notFoundOrRedirect(path: string): never {
  const target = redirectFor(path)
  if (target) (target.permanent ? permanentRedirect : redirect)(target.to)
  notFound()
}
