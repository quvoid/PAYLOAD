import Link from 'next/link'

import { getTag } from '@/lib/catalog'
import { routes } from '@/lib/routes'

/** The tags an editor put on a page, as links to each tag's page. Renders nothing without tags. */
export function TagList({ tags, className = '' }: { tags?: string[]; className?: string }) {
  const list = (tags ?? []).map(getTag).filter((t) => t !== undefined)
  if (!list.length) return null
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Tags">
      {list.map((t) => (
        <li key={t.slug}>
          <Link href={routes.tag(t.slug)} className="rounded-pill bg-shade-30 px-4 py-2 text-caption hover:bg-peach">
            {t.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
