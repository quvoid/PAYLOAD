import Link from 'next/link'

import { resolveRelated } from '@/lib/catalog'
import type { RelatedRef } from '@/lib/types'

import { Section } from './ui'

/** The "Related" pages an editor picked in the admin sidebar. Renders nothing without picks. */
export function RelatedLinks({ related, title = 'Related' }: { related?: RelatedRef[]; title?: string }) {
  const links = resolveRelated(related)
  if (!links.length) return null
  return (
    <Section id="related" title={title}>
      <ul className="grid gap-4 md:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block h-full rounded-lg border border-hairline p-6 hover:border-indigo">
              <span className="text-eyebrow uppercase text-shade-60">{l.kind}</span>
              <span className="mt-2 block text-heading-md">{l.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}
