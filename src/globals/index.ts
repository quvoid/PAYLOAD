import type { GlobalConfig } from 'payload'

import { isAdmin, loggedIn, refreshAfterGlobalChange } from '@/collections/shared'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings', description: 'Homepage wording and the banner at the top of every page.' },
  access: { read: loggedIn, update: loggedIn },
  hooks: { afterChange: [refreshAfterGlobalChange] },
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
