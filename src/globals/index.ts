import type { GlobalConfig } from 'payload'

import { isAdmin, linkFields, loggedIn, refreshAfterGlobalChange } from '@/collections/shared'

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
              fields: [{ name: 'url', type: 'text', required: true, admin: { placeholder: 'https://instagram.com/…' } }],
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
  ],
}

export const ScoringRules: GlobalConfig = {
  slug: 'scoring-rules',
  label: 'Scoring rules',
  admin: {
    group: 'Scoring',
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
