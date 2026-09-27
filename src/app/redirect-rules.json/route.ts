import { ensureCatalog, redirects } from '@/lib/store'

// The redirect rules (Website → Redirects in the admin), for src/proxy.ts. Public on purpose:
// every rule is visible anyway by requesting its old address.
export const dynamic = 'force-dynamic'

export async function GET() {
  await ensureCatalog()
  return Response.json(Object.fromEntries(redirects), { headers: { 'Cache-Control': 'public, max-age=30' } })
}
