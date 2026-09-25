import type { Metadata } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { PreviewBar, SampleBanner } from '@/components/SampleBanner'
import { banner } from '@/lib/catalog'
import { ensureCatalog } from '@/lib/store'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureCatalog()
  const bannerText = banner()
  const { isEnabled: previewing } = await draftMode()
  return (
    <html lang="en-IN" className={`${inter.variable} ${devanagari.variable}`}>
      <body>
        {previewing && <PreviewBar />}
        {bannerText && <SampleBanner text={bannerText} />}
        {children}
        <JsonLd data={graph(organizationLd(), websiteLd())} />
      </body>
    </html>
  )
}
