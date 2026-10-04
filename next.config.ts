import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// Security headers on every response (docs: security-and-https). HSTS is deliberately without
// "preload": joining the browsers' preload list is hard to undo, so add it once the domain is final.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // SAMEORIGIN, not DENY: the admin's live preview shows the site in a frame on the same origin.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // Not a full script allow-list (the admin and analytics need inline scripts): upgrade any http://
  // asset to https://, and forbid other sites from framing ours.
  {
    key: 'Content-Security-Policy',
    value: "upgrade-insecure-requests; frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
  },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  // /reviews/<product>.md: the review as Markdown for answer engines (src/lib/markdown.ts). Checked
  // before the page routes, or /reviews/[product] would take it as a product called "x.md".
  async rewrites() {
    return { beforeFiles: [{ source: '/reviews/:product.md', destination: '/reviews-md/:product' }] }
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
