import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_redirects_type" ADD VALUE '410';
  CREATE TABLE "categories_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "_categories_v_version_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "aspects_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "users_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "page_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"home_title" varchar DEFAULT 'Every review, weighed — honest buying verdicts',
  	"home_description" varchar DEFAULT 'Every review of a product from across the internet, weighed honestly, with a straight answer on whether to buy it.',
  	"home_share_image_id" integer,
  	"home_noindex" boolean,
  	"categories_heading" varchar DEFAULT 'All categories',
  	"categories_intro" varchar DEFAULT 'Every category we review. Each one is scored on the measures that matter for it, so products are always compared like with like.',
  	"categories_title" varchar DEFAULT 'All categories',
  	"categories_description" varchar DEFAULT 'Every category ReviewLens reviews, from protein powder to UPI apps.',
  	"categories_share_image_id" integer,
  	"categories_noindex" boolean,
  	"best_heading" varchar DEFAULT 'Ranked lists',
  	"best_intro" varchar DEFAULT 'Each list ranks products by a score we compute from reviews, and re-ranks itself whenever reviews or prices change.',
  	"best_title" varchar DEFAULT 'Ranked lists — best products by what matters',
  	"best_description" varchar DEFAULT 'Every ranked list on ReviewLens, each ordered by scores computed from real reviews.',
  	"best_share_image_id" integer,
  	"best_noindex" boolean,
  	"compare_heading" varchar DEFAULT 'Compare',
  	"compare_intro" varchar DEFAULT 'Scores, sentiment and share of voice side by side — for a whole category, or two products head to head.',
  	"compare_title" varchar DEFAULT 'Compare products side by side',
  	"compare_description" varchar DEFAULT 'Head-to-head comparisons and whole-category tables, every measure computed from reviews.',
  	"compare_share_image_id" integer,
  	"compare_noindex" boolean,
  	"methodology_heading" varchar DEFAULT 'How we score',
  	"methodology_intro" varchar DEFAULT 'Code counts; people judge. Every number on ReviewLens is computed from reviews by fixed rules. A model writes the wording of pros, cons and verdicts, but never a number, and a named editor approves every page.',
  	"methodology_title" varchar DEFAULT 'How we score products',
  	"methodology_description" varchar DEFAULT 'How ReviewLens collects reviews, discounts manipulation, computes every number and reaches a verdict.',
  	"methodology_share_image_id" integer,
  	"methodology_noindex" boolean,
  	"sources_heading" varchar DEFAULT 'Where our reviews come from',
  	"sources_intro" varchar DEFAULT 'We collect reviews from {sources} kinds of source. We show short excerpts only, and every review links back to where it was posted.',
  	"sources_title" varchar DEFAULT 'Where our reviews come from',
  	"sources_description" varchar DEFAULT 'Every source ReviewLens collects reviews from, how we collect them, and how much each one counts.',
  	"sources_share_image_id" integer,
  	"sources_noindex" boolean,
  	"search_heading" varchar DEFAULT 'Search the catalogue',
  	"search_intro" varchar DEFAULT '',
  	"not_found_heading" varchar DEFAULT 'We haven’t reviewed that.',
  	"not_found_intro" varchar DEFAULT 'The page you’re looking for doesn’t exist, or the product isn’t in our catalogue yet.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_blocked_paths" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL
  );
  
  ALTER TABLE "products_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "products_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "products_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "products_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "_products_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "best_lists_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "best_lists_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "best_lists_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "best_lists_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "best_lists_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_best_lists_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_best_lists_v_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "_best_lists_v_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "_best_lists_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "_best_lists_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "guides_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "guides_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "guides_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "guides_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "guides_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "_guides_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "best_lists_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "comparisons_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "guides_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "navigation" ADD COLUMN "footer_right" varchar DEFAULT 'Review excerpts are short and link to the original.';
  ALTER TABLE "site_settings" ADD COLUMN "templates_products_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_products_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_categories_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_categories_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_brands_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_brands_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_best_lists_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_best_lists_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_comparisons_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_comparisons_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_guides_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_guides_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_tags_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_tags_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_pages_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "templates_pages_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "uniqueness_threshold" numeric DEFAULT 0.4;
  ALTER TABLE "site_settings" ADD COLUMN "block_duplicates" boolean;
  ALTER TABLE "site_settings" ADD COLUMN "allow_ai_search" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "allow_ai_training" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "gone_on_delete" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "legal_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "founding_date" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "categories_same_as" ADD CONSTRAINT "categories_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_version_same_as" ADD CONSTRAINT "_categories_v_version_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aspects_same_as" ADD CONSTRAINT "aspects_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."aspects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_same_as" ADD CONSTRAINT "users_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_home_share_image_id_media_id_fk" FOREIGN KEY ("home_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_categories_share_image_id_media_id_fk" FOREIGN KEY ("categories_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_best_share_image_id_media_id_fk" FOREIGN KEY ("best_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_compare_share_image_id_media_id_fk" FOREIGN KEY ("compare_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_methodology_share_image_id_media_id_fk" FOREIGN KEY ("methodology_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_sources_share_image_id_media_id_fk" FOREIGN KEY ("sources_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_blocked_paths" ADD CONSTRAINT "site_settings_blocked_paths_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "categories_same_as_order_idx" ON "categories_same_as" USING btree ("_order");
  CREATE INDEX "categories_same_as_parent_id_idx" ON "categories_same_as" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_version_same_as_order_idx" ON "_categories_v_version_same_as" USING btree ("_order");
  CREATE INDEX "_categories_v_version_same_as_parent_id_idx" ON "_categories_v_version_same_as" USING btree ("_parent_id");
  CREATE INDEX "aspects_same_as_order_idx" ON "aspects_same_as" USING btree ("_order");
  CREATE INDEX "aspects_same_as_parent_id_idx" ON "aspects_same_as" USING btree ("_parent_id");
  CREATE INDEX "users_same_as_order_idx" ON "users_same_as" USING btree ("_order");
  CREATE INDEX "users_same_as_parent_id_idx" ON "users_same_as" USING btree ("_parent_id");
  CREATE INDEX "page_texts_home_home_share_image_idx" ON "page_texts" USING btree ("home_share_image_id");
  CREATE INDEX "page_texts_categories_categories_share_image_idx" ON "page_texts" USING btree ("categories_share_image_id");
  CREATE INDEX "page_texts_best_best_share_image_idx" ON "page_texts" USING btree ("best_share_image_id");
  CREATE INDEX "page_texts_compare_compare_share_image_idx" ON "page_texts" USING btree ("compare_share_image_id");
  CREATE INDEX "page_texts_methodology_methodology_share_image_idx" ON "page_texts" USING btree ("methodology_share_image_id");
  CREATE INDEX "page_texts_sources_sources_share_image_idx" ON "page_texts" USING btree ("sources_share_image_id");
  CREATE INDEX "site_settings_blocked_paths_order_idx" ON "site_settings_blocked_paths" USING btree ("_order");
  CREATE INDEX "site_settings_blocked_paths_parent_id_idx" ON "site_settings_blocked_paths" USING btree ("_parent_id");
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "products_rels_best_lists_id_idx" ON "products_rels" USING btree ("best_lists_id");
  CREATE INDEX "products_rels_comparisons_id_idx" ON "products_rels" USING btree ("comparisons_id");
  CREATE INDEX "products_rels_guides_id_idx" ON "products_rels" USING btree ("guides_id");
  CREATE INDEX "products_rels_pages_id_idx" ON "products_rels" USING btree ("pages_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_rels_best_lists_id_idx" ON "_products_v_rels" USING btree ("best_lists_id");
  CREATE INDEX "_products_v_rels_comparisons_id_idx" ON "_products_v_rels" USING btree ("comparisons_id");
  CREATE INDEX "_products_v_rels_guides_id_idx" ON "_products_v_rels" USING btree ("guides_id");
  CREATE INDEX "_products_v_rels_pages_id_idx" ON "_products_v_rels" USING btree ("pages_id");
  CREATE INDEX "best_lists_rels_products_id_idx" ON "best_lists_rels" USING btree ("products_id");
  CREATE INDEX "best_lists_rels_best_lists_id_idx" ON "best_lists_rels" USING btree ("best_lists_id");
  CREATE INDEX "best_lists_rels_comparisons_id_idx" ON "best_lists_rels" USING btree ("comparisons_id");
  CREATE INDEX "best_lists_rels_guides_id_idx" ON "best_lists_rels" USING btree ("guides_id");
  CREATE INDEX "best_lists_rels_pages_id_idx" ON "best_lists_rels" USING btree ("pages_id");
  CREATE INDEX "_best_lists_v_rels_products_id_idx" ON "_best_lists_v_rels" USING btree ("products_id");
  CREATE INDEX "_best_lists_v_rels_best_lists_id_idx" ON "_best_lists_v_rels" USING btree ("best_lists_id");
  CREATE INDEX "_best_lists_v_rels_comparisons_id_idx" ON "_best_lists_v_rels" USING btree ("comparisons_id");
  CREATE INDEX "_best_lists_v_rels_guides_id_idx" ON "_best_lists_v_rels" USING btree ("guides_id");
  CREATE INDEX "_best_lists_v_rels_pages_id_idx" ON "_best_lists_v_rels" USING btree ("pages_id");
  CREATE INDEX "guides_rels_products_id_idx" ON "guides_rels" USING btree ("products_id");
  CREATE INDEX "guides_rels_best_lists_id_idx" ON "guides_rels" USING btree ("best_lists_id");
  CREATE INDEX "guides_rels_comparisons_id_idx" ON "guides_rels" USING btree ("comparisons_id");
  CREATE INDEX "guides_rels_guides_id_idx" ON "guides_rels" USING btree ("guides_id");
  CREATE INDEX "guides_rels_pages_id_idx" ON "guides_rels" USING btree ("pages_id");
  CREATE INDEX "_guides_v_rels_products_id_idx" ON "_guides_v_rels" USING btree ("products_id");
  CREATE INDEX "_guides_v_rels_best_lists_id_idx" ON "_guides_v_rels" USING btree ("best_lists_id");
  CREATE INDEX "_guides_v_rels_comparisons_id_idx" ON "_guides_v_rels" USING btree ("comparisons_id");
  CREATE INDEX "_guides_v_rels_guides_id_idx" ON "_guides_v_rels" USING btree ("guides_id");
  CREATE INDEX "_guides_v_rels_pages_id_idx" ON "_guides_v_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "pages_rels_best_lists_id_idx" ON "pages_rels" USING btree ("best_lists_id");
  CREATE INDEX "pages_rels_comparisons_id_idx" ON "pages_rels" USING btree ("comparisons_id");
  CREATE INDEX "pages_rels_guides_id_idx" ON "pages_rels" USING btree ("guides_id");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_rels_best_lists_id_idx" ON "_pages_v_rels" USING btree ("best_lists_id");
  CREATE INDEX "_pages_v_rels_comparisons_id_idx" ON "_pages_v_rels" USING btree ("comparisons_id");
  CREATE INDEX "_pages_v_rels_guides_id_idx" ON "_pages_v_rels" USING btree ("guides_id");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v_version_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "aspects_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_blocked_paths" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "categories_same_as" CASCADE;
  DROP TABLE "_categories_v_version_same_as" CASCADE;
  DROP TABLE "aspects_same_as" CASCADE;
  DROP TABLE "users_same_as" CASCADE;
  DROP TABLE "page_texts" CASCADE;
  DROP TABLE "site_settings_blocked_paths" CASCADE;
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_products_fk";
  
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_best_lists_fk";
  
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_comparisons_fk";
  
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_guides_fk";
  
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_pages_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_products_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_best_lists_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_comparisons_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_guides_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_pages_fk";
  
  ALTER TABLE "best_lists_rels" DROP CONSTRAINT "best_lists_rels_products_fk";
  
  ALTER TABLE "best_lists_rels" DROP CONSTRAINT "best_lists_rels_best_lists_fk";
  
  ALTER TABLE "best_lists_rels" DROP CONSTRAINT "best_lists_rels_comparisons_fk";
  
  ALTER TABLE "best_lists_rels" DROP CONSTRAINT "best_lists_rels_guides_fk";
  
  ALTER TABLE "best_lists_rels" DROP CONSTRAINT "best_lists_rels_pages_fk";
  
  ALTER TABLE "_best_lists_v_rels" DROP CONSTRAINT "_best_lists_v_rels_products_fk";
  
  ALTER TABLE "_best_lists_v_rels" DROP CONSTRAINT "_best_lists_v_rels_best_lists_fk";
  
  ALTER TABLE "_best_lists_v_rels" DROP CONSTRAINT "_best_lists_v_rels_comparisons_fk";
  
  ALTER TABLE "_best_lists_v_rels" DROP CONSTRAINT "_best_lists_v_rels_guides_fk";
  
  ALTER TABLE "_best_lists_v_rels" DROP CONSTRAINT "_best_lists_v_rels_pages_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_products_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_best_lists_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_comparisons_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_guides_fk";
  
  ALTER TABLE "guides_rels" DROP CONSTRAINT "guides_rels_pages_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_products_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_best_lists_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_comparisons_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_guides_fk";
  
  ALTER TABLE "_guides_v_rels" DROP CONSTRAINT "_guides_v_rels_pages_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_products_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_best_lists_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_comparisons_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_guides_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_pages_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_products_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_best_lists_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_comparisons_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_guides_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_pages_fk";
  
  ALTER TABLE "redirects" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "redirects" ALTER COLUMN "type" SET DEFAULT '301'::text;
  DROP TYPE "public"."enum_redirects_type";
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  ALTER TABLE "redirects" ALTER COLUMN "type" SET DEFAULT '301'::"public"."enum_redirects_type";
  ALTER TABLE "redirects" ALTER COLUMN "type" SET DATA TYPE "public"."enum_redirects_type" USING "type"::"public"."enum_redirects_type";
  DROP INDEX "products_rels_products_id_idx";
  DROP INDEX "products_rels_best_lists_id_idx";
  DROP INDEX "products_rels_comparisons_id_idx";
  DROP INDEX "products_rels_guides_id_idx";
  DROP INDEX "products_rels_pages_id_idx";
  DROP INDEX "_products_v_rels_products_id_idx";
  DROP INDEX "_products_v_rels_best_lists_id_idx";
  DROP INDEX "_products_v_rels_comparisons_id_idx";
  DROP INDEX "_products_v_rels_guides_id_idx";
  DROP INDEX "_products_v_rels_pages_id_idx";
  DROP INDEX "best_lists_rels_products_id_idx";
  DROP INDEX "best_lists_rels_best_lists_id_idx";
  DROP INDEX "best_lists_rels_comparisons_id_idx";
  DROP INDEX "best_lists_rels_guides_id_idx";
  DROP INDEX "best_lists_rels_pages_id_idx";
  DROP INDEX "_best_lists_v_rels_products_id_idx";
  DROP INDEX "_best_lists_v_rels_best_lists_id_idx";
  DROP INDEX "_best_lists_v_rels_comparisons_id_idx";
  DROP INDEX "_best_lists_v_rels_guides_id_idx";
  DROP INDEX "_best_lists_v_rels_pages_id_idx";
  DROP INDEX "guides_rels_products_id_idx";
  DROP INDEX "guides_rels_best_lists_id_idx";
  DROP INDEX "guides_rels_comparisons_id_idx";
  DROP INDEX "guides_rels_guides_id_idx";
  DROP INDEX "guides_rels_pages_id_idx";
  DROP INDEX "_guides_v_rels_products_id_idx";
  DROP INDEX "_guides_v_rels_best_lists_id_idx";
  DROP INDEX "_guides_v_rels_comparisons_id_idx";
  DROP INDEX "_guides_v_rels_guides_id_idx";
  DROP INDEX "_guides_v_rels_pages_id_idx";
  DROP INDEX "pages_rels_products_id_idx";
  DROP INDEX "pages_rels_best_lists_id_idx";
  DROP INDEX "pages_rels_comparisons_id_idx";
  DROP INDEX "pages_rels_guides_id_idx";
  DROP INDEX "pages_rels_pages_id_idx";
  DROP INDEX "_pages_v_rels_products_id_idx";
  DROP INDEX "_pages_v_rels_best_lists_id_idx";
  DROP INDEX "_pages_v_rels_comparisons_id_idx";
  DROP INDEX "_pages_v_rels_guides_id_idx";
  DROP INDEX "_pages_v_rels_pages_id_idx";
  ALTER TABLE "products_rels" DROP COLUMN "products_id";
  ALTER TABLE "products_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "products_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "products_rels" DROP COLUMN "guides_id";
  ALTER TABLE "products_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "_products_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "best_lists_rels" DROP COLUMN "products_id";
  ALTER TABLE "best_lists_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "best_lists_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "best_lists_rels" DROP COLUMN "guides_id";
  ALTER TABLE "best_lists_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_best_lists_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "_best_lists_v_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "_best_lists_v_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "_best_lists_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "_best_lists_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "guides_rels" DROP COLUMN "products_id";
  ALTER TABLE "guides_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "guides_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "guides_rels" DROP COLUMN "guides_id";
  ALTER TABLE "guides_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "_guides_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "pages_rels" DROP COLUMN "products_id";
  ALTER TABLE "pages_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "pages_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "pages_rels" DROP COLUMN "guides_id";
  ALTER TABLE "pages_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "products_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "best_lists_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "comparisons_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "guides_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "navigation" DROP COLUMN "footer_right";
  ALTER TABLE "site_settings" DROP COLUMN "templates_products_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_products_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_categories_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_categories_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_brands_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_brands_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_best_lists_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_best_lists_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_comparisons_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_comparisons_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_guides_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_guides_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_tags_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_tags_description";
  ALTER TABLE "site_settings" DROP COLUMN "templates_pages_title";
  ALTER TABLE "site_settings" DROP COLUMN "templates_pages_description";
  ALTER TABLE "site_settings" DROP COLUMN "uniqueness_threshold";
  ALTER TABLE "site_settings" DROP COLUMN "block_duplicates";
  ALTER TABLE "site_settings" DROP COLUMN "allow_ai_search";
  ALTER TABLE "site_settings" DROP COLUMN "allow_ai_training";
  ALTER TABLE "site_settings" DROP COLUMN "gone_on_delete";
  ALTER TABLE "site_settings" DROP COLUMN "legal_name";
  ALTER TABLE "site_settings" DROP COLUMN "founding_date";
  ALTER TABLE "site_settings" DROP COLUMN "contact_email";`)
}
