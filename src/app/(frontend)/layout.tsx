import type { Metadata } from 'next'
import { Inter, Noto_Sans_Devanagari } from 'next/font/google'
import { draftMode } from 'next/headers'
import Script from 'next/script'
import React, { Suspense } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { NavigationProgress } from '@/components/NavigationProgress'
import { PreviewBar, SampleBanner } from '@/components/SampleBanner'
import { SearchShortcut } from '@/components/SearchShortcut'
import { banner } from '@/lib/catalog'
import { ensureCatalog, settings } from '@/lib/store'
import { graph, organizationLd, SITE, websiteLd } from '@/lib/seo'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
})

// Site-wide defaults. Search-engine settings come from Settings → Site settings in the admin.
export async function generateMetadata(): Promise<Metadata> {
  await ensureCatalog()
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name} — every review, weighed`, template: `%s | ${SITE.name}` },
    description: settings.metaDescription || SITE.description,
    ...(settings.hideFromSearch && { robots: { index: false, follow: false } }),
    verification: {
      ...(settings.googleVerification && { google: settings.googleVerification }),
      ...(settings.bingVerification && { other: { 'msvalidate.01': settings.bingVerification } }),
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureCatalog()
  const bannerText = banner()
  const { isEnabled: previewing } = await draftMode()
  return (
    <html lang="en-IN" className={`${inter.variable} ${devanagari.variable}`}>
      <body>
        <Suspense>
          <NavigationProgress />
        </Suspense>
        {previewing && <PreviewBar />}
        {previewing && <LivePreviewListener />}
        {bannerText && <SampleBanner text={bannerText} />}
        {children}
        <SearchShortcut />
        <JsonLd data={graph(organizationLd(), websiteLd())} />
        {/* Google Analytics, when an ID is set in Site settings → Analytics. Never counts editors previewing. */}
        {settings.gaMeasurementId && !previewing && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(settings.gaMeasurementId)});`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
