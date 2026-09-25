import { allProducts, getProduct } from '@/lib/catalog'
import { ensureCatalog } from '@/lib/store'

// Every review for one product, as a static JSON file. The product page ships the first reviews in
// its HTML and fetches this only when a reader filters or asks for all of them (docs/PLAN.md §7).

export const dynamic = 'force-static'
export async function generateStaticParams() {
  await ensureCatalog()
  return allProducts().map((p) => ({ product: p.slug }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ product: string }> }) {
  await ensureCatalog()
  const product = getProduct((await params).product)
  if (!product) return new Response('Not found', { status: 404 })
  return Response.json(product.reviews)
}
