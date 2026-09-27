// Page types that have search-result templates (Site settings → Programmatic SEO), and the
// placeholders each one understands. Shared by the admin (field help) and the site.

export const TEMPLATE_KINDS = {
  products: { label: 'Product reviews', placeholders: '{name} {brand} {category} {verdict} {score} {reviews} {price} {year}' },
  categories: { label: 'Categories and sections', placeholders: '{name} {section} {count} {year}' },
  brands: { label: 'Brands', placeholders: '{name} {count} {year}' },
  'best-lists': { label: 'Ranked lists', placeholders: '{name} {qualifier} {category} {count} {top} {year}' },
  comparisons: { label: 'Head-to-heads', placeholders: '{a} {b} {category} {year}' },
  guides: { label: 'Guides', placeholders: '{name} {measure} {section} {count} {year}' },
  tags: { label: 'Tags', placeholders: '{name} {count} {year}' },
  pages: { label: 'Pages', placeholders: '{name} {year}' },
} as const

export type TemplateKind = keyof typeof TEMPLATE_KINDS
