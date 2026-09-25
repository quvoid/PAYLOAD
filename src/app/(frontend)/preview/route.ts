import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/store'

// The admin's Preview button lands here. Only someone logged in to the admin can switch on
// draft mode, which makes pages show drafts (unpublished products, lists and guides).
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '/'
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Preview paths must be on this site.', { status: 400 })
  }
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return new Response('Log in to the admin to preview drafts.', { status: 401 })
  }
  ;(await draftMode()).enable()
  redirect(path)
}
