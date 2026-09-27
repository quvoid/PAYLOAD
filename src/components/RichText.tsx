import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import React from 'react'

import { getCategory } from '@/lib/catalog'
import { routes } from '@/lib/routes'

// Renders rich text written in the admin (Pages). Styled with the site's type tokens.

/** Where an internal link written in the editor points. */
const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { relationTo, value } = linkNode.fields.doc ?? {}
  const slug = value && typeof value === 'object' ? (value as { slug?: string }).slug : undefined
  if (!slug) return '#'
  switch (relationTo) {
    case 'products':
      return routes.product(slug)
    case 'brands':
      return routes.brand(slug)
    case 'best-lists':
      return routes.best(slug)
    case 'comparisons':
      return routes.compare(slug)
    case 'guides':
      return routes.topic(slug)
    case 'tags':
      return routes.tag(slug)
    case 'categories': {
      const category = getCategory(slug)
      return category ? routes.category(category) : '#'
    }
    default:
      return `/${slug}`
  }
}

type CalloutBlock = { blockType: 'callout'; tone?: 'info' | 'warning'; text: string }
type ButtonBlock = { blockType: 'button'; label: string; url: string }

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    callout: ({ node }: { node: { fields: CalloutBlock } }) => (
      <aside
        className={`not-prose my-8 rounded-lg px-6 py-5 ${node.fields.tone === 'warning' ? 'bg-peach' : 'bg-shade-30'}`}
      >
        {node.fields.text}
      </aside>
    ),
    button: ({ node }: { node: { fields: ButtonBlock } }) => {
      const { url, label } = node.fields
      const external = /^https?:\/\//.test(url)
      const className =
        'my-6 inline-flex items-center rounded-pill bg-ink px-6 py-3 text-body-strong text-white no-underline hover:bg-indigo'
      return external ? (
        <a href={url} className={className} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <Link href={url} className={className}>
          {label}
        </Link>
      )
    },
  },
})

export function RichText({ data, className = '' }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters}
      className={[
        'max-w-[70ch] text-body-lg',
        '[&_p]:my-4 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-heading-xl',
        '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-heading-lg [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-heading-md',
        '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1',
        '[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-pink [&_blockquote]:pl-5 [&_blockquote]:italic',
        '[&_a]:underline [&_a]:decoration-shade-40 [&_a]:underline-offset-4 hover:[&_a]:decoration-pink',
        '[&_hr]:my-10 [&_hr]:border-hairline [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg',
        '[&_table]:my-6 [&_table]:w-full [&_td]:border [&_td]:border-hairline [&_td]:p-2 [&_th]:border [&_th]:border-hairline [&_th]:p-2',
        className,
      ].join(' ')}
    />
  )
}
