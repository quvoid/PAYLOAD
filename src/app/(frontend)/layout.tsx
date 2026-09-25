import type { Metadata } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { SampleBanner } from '@/components/SampleBanner'
import { SAMPLE_DATA } from '@/lib/catalog'
import { graph, organizationLd, SITE, websiteLd } from '@/lib/seo'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — every review, weighed`, template: `%s | ${SITE.name}` },
  description: SITE.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${devanagari.variable}`}>
      <body>
        {SAMPLE_DATA && <SampleBanner />}
        {children}
        <JsonLd data={graph(organizationLd(), websiteLd())} />
      </body>
    </html>
  )
}
