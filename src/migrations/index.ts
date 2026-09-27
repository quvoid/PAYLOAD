import * as migration_20260925_203152_initial from './20260925_203152_initial';
import * as migration_20260927_101014_cms_seo_pages_tags_redirects from './20260927_101014_cms_seo_pages_tags_redirects';

export const migrations = [
  {
    up: migration_20260925_203152_initial.up,
    down: migration_20260925_203152_initial.down,
    name: '20260925_203152_initial',
  },
  {
    up: migration_20260927_101014_cms_seo_pages_tags_redirects.up,
    down: migration_20260927_101014_cms_seo_pages_tags_redirects.down,
    name: '20260927_101014_cms_seo_pages_tags_redirects'
  },
];
