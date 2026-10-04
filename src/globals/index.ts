import type { GlobalConfig } from 'payload'

import { PAGE_TEXT_DEFAULTS, PAGE_TEXT_KEYS } from '@/lib/page-texts'
import { TEMPLATE_KINDS } from '@/lib/seo-template-kinds'
import { UNIQUENESS_THRESHOLD } from '@/lib/uniqueness'
import { isAdmin, linkFields, loggedIn, refreshAfterGlobalChange, urlField } from '@/collections/shared'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Homepage wording, the banner, search engine settings, social profiles and analytics.',
  },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Homepage & banner',
          fields: [
            {
              type: 'collapsible',
              label: 'Banner',
              fields: [
                { name: 'showBanner', label: 'Show the banner', type: 'checkbox', defaultValue: true },
                {
                  name: 'bannerText',
                  type: 'text',
                  defaultValue:
                    'Development build — products marked Sample are fictional. Real products stay hidden until an editor publishes them.',
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Homepage',
              fields: [
                { name: 'heroEyebrow', label: 'Small heading', type: 'text', defaultValue: 'Reviews from everywhere · one honest answer' },
                { name: 'heroTitle', label: 'Headline', type: 'text', defaultValue: 'Should you buy it? Every review, weighed.' },
                {
                  name: 'heroText',
                  label: 'Introduction',
                  type: 'textarea',
                  defaultValue:
                    'We read every review of a product across Amazon, Flipkart, Reddit and the app stores, set aside the ones that look fake, count what people actually say — and give you a straight answer.',
                },
                {
                  name: 'steps',
                  label: '"How does a verdict get made?" steps',
                  type: 'array',
                  maxRows: 4,
                  fields: [
                    { name: 'title', type: 'text', required: true },
                    { name: 'body', type: 'textarea', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Search engines',
          description:
            'Defaults for every page. Each product, list, guide and page can override them in its own SEO tab.',
          fields: [
            {
              name: 'hideFromSearch',
              label: 'Hide the whole site from search engines',
              type: 'checkbox',
              admin: {
                description:
                  'Turn on while the site is on a temporary address or not ready. Search engines are asked not to list any page. Turn off when you launch.',
              },
            },
            {
              name: 'metaDescription',
              label: 'Default description',
              type: 'textarea',
              maxLength: 160,
              admin: {
                description:
                  'Used by search results and link previews for pages without their own description. Up to 160 characters.',
              },
            },
            {
              name: 'shareImage',
              label: 'Default share image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'The picture shown when a link is shared on WhatsApp, X, LinkedIn and so on, unless the page has its own. 1200 × 630 works best.',
              },
            },
            {
              name: 'logo',
              label: 'Logo for search engines',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'A square logo. Search engines may show it next to your results.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'googleVerification',
                  label: 'Google Search Console code',
                  type: 'text',
                  admin: { description: 'Only the content="…" value from the HTML tag Google gives you.' },
                },
                {
                  name: 'bingVerification',
                  label: 'Bing Webmaster code',
                  type: 'text',
                  admin: { description: 'Only the content="…" value.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Programmatic SEO',
          description:
            'Rules applied to every generated page at once. A page’s own SEO tab always wins over these.',
          fields: [
            {
              type: 'collapsible',
              label: 'Search result templates',
              admin: {
                description:
                  'Leave empty to keep the standard wording. Placeholders in {braces} are filled in for each page; write the full title, including the site name if you want it.',
              },
              fields: [
                {
                  name: 'templates',
                  type: 'group',
                  label: false,
                  fields: Object.entries(TEMPLATE_KINDS).map(([kind, { label, placeholders }]) => ({
                    name: kind.replace('-', '_'),
                    label,
                    type: 'group' as const,
                    admin: { description: `Placeholders: ${placeholders}` },
                    fields: [
                      {
                        type: 'row' as const,
                        fields: [
                          { name: 'title', label: 'Title', type: 'text' as const },
                          { name: 'description', label: 'Description', type: 'text' as const },
                        ],
                      },
                    ],
                  })),
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Duplicate content check',
              fields: [
                {
                  name: 'uniquenessThreshold',
                  label: 'Minimum difference from the most similar page',
                  type: 'number',
                  min: 0,
                  max: 1,
                  defaultValue: UNIQUENESS_THRESHOLD,
                  admin: {
                    step: 0.05,
                    description:
                      '0.40 means at least 40% of a page’s 3-word phrases must be its own. Every editor sees the check in the sidebar of products, lists, head-to-heads, guides and pages.',
                  },
                },
                {
                  name: 'blockDuplicates',
                  label: 'Stop near-duplicate pages from being published',
                  type: 'checkbox',
                  admin: { description: 'Off: editors see a warning. On: publishing is refused until the page is rewritten.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Crawlers',
          description:
            'What search engines and AI crawlers may read. The admin, the API and search results are always blocked.',
          fields: [
            {
              name: 'blockedPaths',
              label: 'Also keep crawlers out of',
              type: 'array',
              labels: { singular: 'Address', plural: 'Addresses' },
              admin: { description: 'Paths such as /drafts/ or /*?sort=. Crawlers are asked not to read them.' },
              fields: [{ name: 'path', type: 'text', required: true, admin: { placeholder: '/drafts/' } }],
            },
            {
              name: 'allowAiSearch',
              label: 'Let AI search engines read the site',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'ChatGPT search, Perplexity, Claude search and similar. They cite and link to the pages they use.',
              },
            },
            {
              name: 'allowAiTraining',
              label: 'Let AI companies train their models on the site',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'GPTBot, Google-Extended, ClaudeBot, Common Crawl and similar. They don’t send visitors.' },
            },
            {
              name: 'goneOnDelete',
              label: 'Mark deleted pages as "Gone" (410)',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'When a published page is deleted for good, search engines are told it is gone on purpose. The rule appears under Website → Redirects.',
              },
            },
          ],
        },
        {
          label: 'Organisation',
          description: 'Who publishes the site. Search engines show this as the publisher of every page.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'legalName', label: 'Registered company name', type: 'text' },
                { name: 'foundingDate', label: 'Founded', type: 'date', admin: { date: { pickerAppearance: 'monthOnly' } } },
              ],
            },
            { name: 'contactEmail', label: 'Contact email', type: 'email' },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'twitterHandle',
              label: 'X (Twitter) handle',
              type: 'text',
              admin: { placeholder: '@reviewlens' },
            },
            {
              name: 'socialProfiles',
              label: 'Official profiles',
              type: 'array',
              labels: { singular: 'Profile', plural: 'Profiles' },
              admin: {
                description:
                  'Links to your Instagram, X, YouTube, LinkedIn and so on. Search engines use them to recognise the brand.',
              },
              fields: [urlField({ name: 'url', required: true, admin: { placeholder: 'https://instagram.com/…' } })],
            },
          ],
        },
        {
          label: 'Analytics',
          fields: [
            {
              name: 'gaMeasurementId',
              label: 'Google Analytics measurement ID',
              type: 'text',
              validate: (value: unknown) =>
                !value || /^G-[A-Z0-9]+$/.test(String(value)) ? true : 'It looks like G-XXXXXXXXXX.',
              admin: {
                placeholder: 'G-XXXXXXXXXX',
                description: 'Paste the ID from Google Analytics 4 to start counting visits. Leave empty for no analytics.',
              },
            },
          ],
        },
      ],
    },
  ],
}

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Website',
    description:
      'The links in the menu at the top and the footer at the bottom of every page. Categories, ranked lists and comparisons are listed automatically; these are the links you choose.',
  },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    {
      name: 'headerLinks',
      label: 'Menu links',
      type: 'array',
      maxRows: 6,
      labels: { singular: 'Link', plural: 'Links' },
      admin: {
        description: 'Shown after "Categories" in the top menu. Leave empty for the standard links: Best lists, Compare, How we score.',
      },
      fields: linkFields(),
    },
    {
      name: 'footerColumns',
      label: 'Footer columns',
      type: 'array',
      maxRows: 3,
      labels: { singular: 'Column', plural: 'Columns' },
      admin: {
        description: 'Columns of links in the footer, e.g. "Company" with About and Contact. Leave empty for the standard "Trust" column.',
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'links', type: 'array', labels: { singular: 'Link', plural: 'Links' }, fields: linkFields() },
      ],
    },
    {
      name: 'footerAbout',
      label: 'Text under the logo',
      type: 'textarea',
      defaultValue:
        'Every review, weighed. Numbers are counted by code; every verdict is approved by a named editor.',
    },
    {
      name: 'footerNote',
      label: 'Small print',
      type: 'textarea',
      defaultValue:
        "We don't earn affiliate commission. If that changes, every affected page will say so.",
      admin: { description: 'Shown at the very bottom, after "© <year> ReviewLens."' },
    },
    {
      name: 'footerRight',
      label: 'Small print, right-hand side',
      type: 'text',
      defaultValue: 'Review excerpts are short and link to the original.',
    },
  ],
}

export const ScoringRules: GlobalConfig = {
  slug: 'scoring-rules',
  label: 'Scoring rules',
  admin: {
    group: 'Advanced · Scoring',
    description:
      'The thresholds every verdict is decided by. The "How we score" page shows these exact values. Admins only — changing one changes verdicts across the whole site.',
  },
  access: { read: loggedIn, update: isAdmin },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'buyScore', label: 'Satisfaction needed for Buy (0–10)', type: 'number', required: true, defaultValue: 7.5 },
        { name: 'caveatsScore', label: 'Satisfaction needed for Buy with caveats', type: 'number', required: true, defaultValue: 6 },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'dealBreakerProblemRate',
          label: 'Deal-breaker fails at (share of reviewers)',
          type: 'number',
          required: true,
          defaultValue: 0.2,
          admin: { description: '0.2 = one in five reviewers report a problem.' },
        },
        {
          name: 'notableConProblemRate',
          label: 'Notable con at (share of reviewers)',
          type: 'number',
          required: true,
          defaultValue: 0.1,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minReviewsHigh', label: 'Reviews for high confidence', type: 'number', required: true, defaultValue: 80 },
        {
          name: 'minReviewsMedium',
          label: 'Minimum reviews for any verdict',
          type: 'number',
          required: true,
          defaultValue: 40,
          admin: { description: 'Below this the verdict is "Not enough data".' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minMentionsPerAspect', label: 'Mentions before a measure is judged', type: 'number', required: true, defaultValue: 5 },
        { name: 'minEvidencePerClaim', label: 'Reviews needed behind each pro or con', type: 'number', required: true, defaultValue: 2 },
        {
          name: 'suspiciousBelow',
          label: 'Flag reviews below this credibility',
          type: 'number',
          required: true,
          defaultValue: 0.3,
        },
      ],
    },
  ],
}

/** Internal: a counter the site checks before rendering, bumped whenever content changes. */
export const CatalogState: GlobalConfig = {
  slug: 'catalog-state',
  admin: { hidden: true },
  // Only server-side code touches it (the Local API skips access checks); nothing public can.
  access: { read: () => false, update: () => false },
  fields: [{ name: 'version', type: 'number', defaultValue: 0 }],
}

/** Wording and search settings of the fixed pages (the ones not written as Pages). */
export const PageTexts: GlobalConfig = {
  slug: 'page-texts',
  label: 'Page texts',
  admin: {
    group: 'Website',
    description:
      'Headings, introductions and search-result text for the site’s fixed pages. Numbers and lists on those pages fill themselves in.',
  },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [refreshAfterGlobalChange] },
  fields: [
    {
      type: 'tabs',
      tabs: PAGE_TEXT_KEYS.map((key) => {
        const d = PAGE_TEXT_DEFAULTS[key]
        return {
          name: key,
          label: d.label,
          fields: [
            ...(key === 'home'
              ? []
              : [
                  { name: 'heading', type: 'text' as const, defaultValue: d.heading },
                  {
                    name: 'intro',
                    label: 'Introduction',
                    type: 'textarea' as const,
                    defaultValue: d.intro,
                    admin: {
                      description:
                        key === 'sources' ? '{sources} is replaced by the number of review sources.' : undefined,
                    },
                  },
                ]),
            ...(key === 'search' || key === 'notFound'
              ? []
              : [
                  {
                    type: 'collapsible' as const,
                    label: 'Search engines',
                    fields: [
                      {
                        name: 'title',
                        label: 'Search result title',
                        type: 'text' as const,
                        defaultValue: d.title,
                        admin: { description: 'The site name is added at the end. Aim for 50–60 characters in total.' },
                      },
                      {
                        name: 'description',
                        label: 'Search result description',
                        type: 'textarea' as const,
                        defaultValue: d.description,
                        maxLength: 160,
                      },
                      { name: 'shareImage', label: 'Share image', type: 'upload' as const, relationTo: 'media' as const },
                      {
                        name: 'noindex',
                        label: 'Hide this page from search engines',
                        type: 'checkbox' as const,
                      },
                    ],
                  },
                ]),
          ],
        }
      }),
    },
  ],
}
