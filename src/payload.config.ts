import { postgresAdapter } from '@payloadcms/db-postgres'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Aspects } from './collections/Aspects'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { BestLists, Comparisons, Guides } from './collections/Editorial'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { ReviewRequests } from './collections/ReviewRequests'
import { Reviews } from './collections/Reviews'
import { refreshAfterChange, refreshAfterDelete } from './collections/shared'
import { Sources } from './collections/Sources'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { CatalogState, Navigation, ScoringRules, SiteSettings } from './globals'
import { seoGenerators, seoExtraFields } from './lib/seo-admin'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: { titleSuffix: ' · ReviewLens admin' },
    // Live preview: the page beside the editor, updating as you type (Products, lists, guides, pages).
    livePreview: {
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    components: {
      beforeDashboard: ['/components/admin/Welcome#Welcome'],
      graphics: {
        Logo: '/components/admin/Brand#AdminLogo',
        Icon: '/components/admin/Brand#AdminIcon',
      },
    },
  },
  // Sidebar order: what editors use most comes first (groups are set on each collection).
  collections: [
    Products,
    Categories,
    Brands,
    BestLists,
    Comparisons,
    Guides,
    ReviewRequests,
    Pages,
    Tags,
    Media,
    Aspects,
    Sources,
    Reviews,
    Users,
  ],
  globals: [Navigation, SiteSettings, ScoringRules, CatalogState],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Sync the schema automatically only under `pnpm dev` (on the Neon dev branch). Scripts like
    // the seed must never do it: against production it marks the database as dev-managed, and
    // from then on `payload migrate` stops at a prompt, which hangs the Vercel build.
    push: process.env.NODE_ENV === 'development',
  }),
  sharp,
  plugins: [
    // An SEO tab on every public page type: search title, description, share image, preview of
    // the Google result, and "hide from search engines". Defaults live in Site settings.
    seoPlugin({
      collections: ['products', 'categories', 'brands', 'best-lists', 'comparisons', 'guides', 'pages', 'tags'],
      uploadsCollection: 'media',
      tabbedUI: true,
      ...seoGenerators,
      fields: ({ defaultFields }) => [...defaultFields, ...seoExtraFields],
    }),
    // Old addresses that should send visitors somewhere else. Created automatically when a
    // published page's web address changes; editors can add their own.
    redirectsPlugin({
      collections: ['pages', 'products', 'categories', 'brands', 'best-lists', 'comparisons', 'guides', 'tags'],
      redirectTypes: ['301', '302'],
      redirectTypeFieldOverride: {
        label: 'Kind',
        defaultValue: '301',
        admin: { description: 'Permanent (301) unless the old address will come back.' },
      },
      overrides: {
        labels: { singular: 'Redirect', plural: 'Redirects' },
        admin: {
          group: 'Website',
          useAsTitle: 'from',
          description:
            'Send an old address to a new one, so old links and search results keep working. Made for you when you change a published page’s web address.',
        },
        hooks: {
          beforeValidate: [
            // Accept a pasted full link and keep only its path: https://site.com/old/ → /old
            ({ data }) => {
              if (typeof data?.from !== 'string') return data
              let from = data.from.trim()
              try {
                if (/^https?:\/\//.test(from)) from = new URL(from).pathname
              } catch {}
              from = `/${from.replace(/^\/+/, '')}`.replace(/(.)\/+$/, '$1')
              return { ...data, from }
            },
          ],
          afterChange: [refreshAfterChange],
          afterDelete: [refreshAfterDelete],
        },
      },
    }),
    // Vercel's disk isn't kept between requests, so uploaded images live in Vercel Blob there.
    // Without a token (local dev) they stay on disk in /media. alwaysInsertFields keeps the
    // database schema identical either way, so one set of migrations fits both.
    vercelBlobStorage({
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      alwaysInsertFields: true,
      // Upload straight from the browser: Vercel functions reject request bodies over 4.5 MB.
      clientUploads: true,
    }),
  ],
})
