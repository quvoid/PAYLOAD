import * as migration_20260925_203152_initial from './20260925_203152_initial';
import * as migration_20260927_101014_cms_seo_pages_tags_redirects from './20260927_101014_cms_seo_pages_tags_redirects';
import * as migration_20260927_104830_seo_crawl_schema_page_texts from './20260927_104830_seo_crawl_schema_page_texts';

export const migrations = [
  {
    up: migration_20260925_203152_initial.up,
    down: migration_20260925_203152_initial.down,
    name: '20260925_203152_initial',
  },
  {
    up: migration_20260927_101014_cms_seo_pages_tags_redirects.up,
    down: migration_20260927_101014_cms_seo_pages_tags_redirects.down,
    name: '20260927_101014_cms_seo_pages_tags_redirects',
  },
  {
    up: migration_20260927_104830_seo_crawl_schema_page_texts.up,
    down: migration_20260927_104830_seo_crawl_schema_page_texts.down,
    name: '20260927_104830_seo_crawl_schema_page_texts'
  },
];
