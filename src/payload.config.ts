import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Aspects } from './collections/Aspects'
import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { BestLists, Comparisons, Guides } from './collections/Editorial'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { ReviewRequests } from './collections/ReviewRequests'
import { Reviews } from './collections/Reviews'
import { Sources } from './collections/Sources'
import { Users } from './collections/Users'
import { CatalogState, ScoringRules, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: { titleSuffix: ' · ReviewLens admin' },
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
    Aspects,
    Sources,
    Reviews,
    Users,
    Media,
  ],
  globals: [SiteSettings, ScoringRules, CatalogState],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
