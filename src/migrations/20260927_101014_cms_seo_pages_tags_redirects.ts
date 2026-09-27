import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__categories_v_version_app_category" AS ENUM('FinanceApplication', 'ShoppingApplication', 'LifestyleApplication', 'TravelApplication', 'HealthApplication', 'EntertainmentApplication', 'UtilitiesApplication');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_navigation_header_links_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_navigation_footer_columns_links_type" AS ENUM('page', 'custom');
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_categories_v_version_measures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"aspect_id" integer NOT NULL,
  	"deal_breaker" boolean,
  	"weight" numeric DEFAULT 1,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_categories_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_parent_id" integer,
  	"version_tagline" varchar NOT NULL,
  	"version_intro" varchar,
  	"version_value_metric_label" varchar,
  	"version_value_metric_basis" numeric,
  	"version_is_app" boolean,
  	"version_app_category" "enum__categories_v_version_app_category",
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_noindex" boolean,
  	"version_meta_canonical" varchar,
  	"version_slug" varchar NOT NULL,
  	"version_refresh_days" numeric DEFAULT 21,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_brands_v_version_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_about" varchar,
  	"version_website" varchar,
  	"version_logo_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_noindex" boolean,
  	"version_meta_canonical" varchar,
  	"version_slug" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "best_lists_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_best_lists_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "guides_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_guides_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_noindex" boolean,
  	"meta_canonical" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_intro" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_noindex" boolean,
  	"version_meta_canonical" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_noindex" boolean,
  	"meta_canonical" varchar,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_tags_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_description" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_noindex" boolean,
  	"version_meta_canonical" varchar,
  	"version_slug" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" DEFAULT '301' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"products_id" integer,
  	"categories_id" integer,
  	"brands_id" integer,
  	"best_lists_id" integer,
  	"comparisons_id" integer,
  	"guides_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_header_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"type" "enum_navigation_footer_columns_links_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_about" varchar DEFAULT 'Every review, weighed. Numbers are counted by code; every verdict is approved by a named editor.',
  	"footer_note" varchar DEFAULT 'We don''t earn affiliate commission. If that changes, every affected page will say so.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_social_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "products" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "products" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "products" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "products" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_noindex" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "version_meta_canonical" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_products_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "categories" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "categories" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "categories" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "categories" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "categories" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "categories" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "brands" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "brands" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "brands" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "brands" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "brands" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "brands" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "best_lists" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "best_lists" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "best_lists" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "best_lists" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "best_lists" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "best_lists" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_best_lists_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_best_lists_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_best_lists_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_best_lists_v" ADD COLUMN "version_meta_noindex" boolean;
  ALTER TABLE "_best_lists_v" ADD COLUMN "version_meta_canonical" varchar;
  ALTER TABLE "_best_lists_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_best_lists_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "comparisons" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "comparisons" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "comparisons" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "comparisons" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "comparisons" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "comparisons" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_comparisons_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_comparisons_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_comparisons_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_comparisons_v" ADD COLUMN "version_meta_noindex" boolean;
  ALTER TABLE "_comparisons_v" ADD COLUMN "version_meta_canonical" varchar;
  ALTER TABLE "_comparisons_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_comparisons_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "guides" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "guides" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "guides" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "guides" ADD COLUMN "meta_noindex" boolean;
  ALTER TABLE "guides" ADD COLUMN "meta_canonical" varchar;
  ALTER TABLE "guides" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_guides_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_guides_v" ADD COLUMN "version_meta_noindex" boolean;
  ALTER TABLE "_guides_v" ADD COLUMN "version_meta_canonical" varchar;
  ALTER TABLE "_guides_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_guides_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "media" ADD COLUMN "caption" varchar;
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "media" ADD COLUMN "folder_id" integer;
  ALTER TABLE "media" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_card_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_share_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_share_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_share_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_share_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_share_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_share_filename" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_folders_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "hide_from_search" boolean;
  ALTER TABLE "site_settings" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "share_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "logo_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "google_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "bing_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "twitter_handle" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "ga_measurement_id" varchar;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_version_measures" ADD CONSTRAINT "_categories_v_version_measures_aspect_id_aspects_id_fk" FOREIGN KEY ("aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_version_measures" ADD CONSTRAINT "_categories_v_version_measures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_version_faq" ADD CONSTRAINT "_categories_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_parent_id_categories_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v_version_same_as" ADD CONSTRAINT "_brands_v_version_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_brands_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists_rels" ADD CONSTRAINT "best_lists_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_best_lists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v_rels" ADD CONSTRAINT "_best_lists_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_rels" ADD CONSTRAINT "guides_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v_rels" ADD CONSTRAINT "_guides_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags" ADD CONSTRAINT "tags_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_parent_id_tags_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tags_v" ADD CONSTRAINT "_tags_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_links" ADD CONSTRAINT "navigation_header_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_header_links" ADD CONSTRAINT "navigation_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_profiles" ADD CONSTRAINT "site_settings_social_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_tags_id_idx" ON "products_rels" USING btree ("tags_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_tags_id_idx" ON "_products_v_rels" USING btree ("tags_id");
  CREATE INDEX "_categories_v_version_measures_order_idx" ON "_categories_v_version_measures" USING btree ("_order");
  CREATE INDEX "_categories_v_version_measures_parent_id_idx" ON "_categories_v_version_measures" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_version_measures_aspect_idx" ON "_categories_v_version_measures" USING btree ("aspect_id");
  CREATE INDEX "_categories_v_version_faq_order_idx" ON "_categories_v_version_faq" USING btree ("_order");
  CREATE INDEX "_categories_v_version_faq_parent_id_idx" ON "_categories_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_parent_idx" ON "_categories_v" USING btree ("version_parent_id");
  CREATE INDEX "_categories_v_version_meta_version_meta_image_idx" ON "_categories_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version_deleted_at_idx" ON "_categories_v" USING btree ("version_deleted_at");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_version_same_as_order_idx" ON "_brands_v_version_same_as" USING btree ("_order");
  CREATE INDEX "_brands_v_version_same_as_parent_id_idx" ON "_brands_v_version_same_as" USING btree ("_parent_id");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_meta_version_meta_image_idx" ON "_brands_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version_deleted_at_idx" ON "_brands_v" USING btree ("version_deleted_at");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "best_lists_rels_order_idx" ON "best_lists_rels" USING btree ("order");
  CREATE INDEX "best_lists_rels_parent_idx" ON "best_lists_rels" USING btree ("parent_id");
  CREATE INDEX "best_lists_rels_path_idx" ON "best_lists_rels" USING btree ("path");
  CREATE INDEX "best_lists_rels_tags_id_idx" ON "best_lists_rels" USING btree ("tags_id");
  CREATE INDEX "_best_lists_v_rels_order_idx" ON "_best_lists_v_rels" USING btree ("order");
  CREATE INDEX "_best_lists_v_rels_parent_idx" ON "_best_lists_v_rels" USING btree ("parent_id");
  CREATE INDEX "_best_lists_v_rels_path_idx" ON "_best_lists_v_rels" USING btree ("path");
  CREATE INDEX "_best_lists_v_rels_tags_id_idx" ON "_best_lists_v_rels" USING btree ("tags_id");
  CREATE INDEX "guides_rels_order_idx" ON "guides_rels" USING btree ("order");
  CREATE INDEX "guides_rels_parent_idx" ON "guides_rels" USING btree ("parent_id");
  CREATE INDEX "guides_rels_path_idx" ON "guides_rels" USING btree ("path");
  CREATE INDEX "guides_rels_tags_id_idx" ON "guides_rels" USING btree ("tags_id");
  CREATE INDEX "_guides_v_rels_order_idx" ON "_guides_v_rels" USING btree ("order");
  CREATE INDEX "_guides_v_rels_parent_idx" ON "_guides_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guides_v_rels_path_idx" ON "_guides_v_rels" USING btree ("path");
  CREATE INDEX "_guides_v_rels_tags_id_idx" ON "_guides_v_rels" USING btree ("tags_id");
  CREATE INDEX "pages_hero_image_idx" ON "pages" USING btree ("hero_image_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_tags_id_idx" ON "pages_rels" USING btree ("tags_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_hero_image_idx" ON "_pages_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_tags_id_idx" ON "_pages_v_rels" USING btree ("tags_id");
  CREATE INDEX "tags_meta_meta_image_idx" ON "tags" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "tags_deleted_at_idx" ON "tags" USING btree ("deleted_at");
  CREATE INDEX "_tags_v_parent_idx" ON "_tags_v" USING btree ("parent_id");
  CREATE INDEX "_tags_v_version_meta_version_meta_image_idx" ON "_tags_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_tags_v_version_version_slug_idx" ON "_tags_v" USING btree ("version_slug");
  CREATE INDEX "_tags_v_version_version_updated_at_idx" ON "_tags_v" USING btree ("version_updated_at");
  CREATE INDEX "_tags_v_version_version_created_at_idx" ON "_tags_v" USING btree ("version_created_at");
  CREATE INDEX "_tags_v_version_version_deleted_at_idx" ON "_tags_v" USING btree ("version_deleted_at");
  CREATE INDEX "_tags_v_created_at_idx" ON "_tags_v" USING btree ("created_at");
  CREATE INDEX "_tags_v_updated_at_idx" ON "_tags_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_products_id_idx" ON "redirects_rels" USING btree ("products_id");
  CREATE INDEX "redirects_rels_categories_id_idx" ON "redirects_rels" USING btree ("categories_id");
  CREATE INDEX "redirects_rels_brands_id_idx" ON "redirects_rels" USING btree ("brands_id");
  CREATE INDEX "redirects_rels_best_lists_id_idx" ON "redirects_rels" USING btree ("best_lists_id");
  CREATE INDEX "redirects_rels_comparisons_id_idx" ON "redirects_rels" USING btree ("comparisons_id");
  CREATE INDEX "redirects_rels_guides_id_idx" ON "redirects_rels" USING btree ("guides_id");
  CREATE INDEX "redirects_rels_tags_id_idx" ON "redirects_rels" USING btree ("tags_id");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "navigation_header_links_order_idx" ON "navigation_header_links" USING btree ("_order");
  CREATE INDEX "navigation_header_links_parent_id_idx" ON "navigation_header_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_links_page_idx" ON "navigation_header_links" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_page_idx" ON "navigation_footer_columns_links" USING btree ("page_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "site_settings_social_profiles_order_idx" ON "site_settings_social_profiles" USING btree ("_order");
  CREATE INDEX "site_settings_social_profiles_parent_id_idx" ON "site_settings_social_profiles" USING btree ("_parent_id");
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "best_lists" ADD CONSTRAINT "best_lists_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_best_lists_v" ADD CONSTRAINT "_best_lists_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comparisons_v" ADD CONSTRAINT "_comparisons_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "products_deleted_at_idx" ON "products" USING btree ("deleted_at");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_deleted_at_idx" ON "_products_v" USING btree ("version_deleted_at");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "categories_meta_meta_image_idx" ON "categories" USING btree ("meta_image_id");
  CREATE INDEX "categories_deleted_at_idx" ON "categories" USING btree ("deleted_at");
  CREATE INDEX "brands_meta_meta_image_idx" ON "brands" USING btree ("meta_image_id");
  CREATE INDEX "brands_deleted_at_idx" ON "brands" USING btree ("deleted_at");
  CREATE INDEX "best_lists_meta_meta_image_idx" ON "best_lists" USING btree ("meta_image_id");
  CREATE INDEX "best_lists_deleted_at_idx" ON "best_lists" USING btree ("deleted_at");
  CREATE INDEX "_best_lists_v_version_meta_version_meta_image_idx" ON "_best_lists_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_best_lists_v_version_version_deleted_at_idx" ON "_best_lists_v" USING btree ("version_deleted_at");
  CREATE INDEX "_best_lists_v_autosave_idx" ON "_best_lists_v" USING btree ("autosave");
  CREATE INDEX "comparisons_meta_meta_image_idx" ON "comparisons" USING btree ("meta_image_id");
  CREATE INDEX "comparisons_deleted_at_idx" ON "comparisons" USING btree ("deleted_at");
  CREATE INDEX "_comparisons_v_version_meta_version_meta_image_idx" ON "_comparisons_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_comparisons_v_version_version_deleted_at_idx" ON "_comparisons_v" USING btree ("version_deleted_at");
  CREATE INDEX "_comparisons_v_autosave_idx" ON "_comparisons_v" USING btree ("autosave");
  CREATE INDEX "guides_meta_meta_image_idx" ON "guides" USING btree ("meta_image_id");
  CREATE INDEX "guides_deleted_at_idx" ON "guides" USING btree ("deleted_at");
  CREATE INDEX "_guides_v_version_meta_version_meta_image_idx" ON "_guides_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_guides_v_version_version_deleted_at_idx" ON "_guides_v" USING btree ("version_deleted_at");
  CREATE INDEX "_guides_v_autosave_idx" ON "_guides_v" USING btree ("autosave");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_deleted_at_idx" ON "media" USING btree ("deleted_at");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_share_sizes_share_filename_idx" ON "media" USING btree ("sizes_share_filename");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "site_settings_share_image_idx" ON "site_settings" USING btree ("share_image_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v_version_measures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_brands_v_version_same_as" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_brands_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "best_lists_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_best_lists_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "guides_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_guides_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_tags_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_folders_folder_type" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_folders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_social_profiles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "_categories_v_version_measures" CASCADE;
  DROP TABLE "_categories_v_version_faq" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_brands_v_version_same_as" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "best_lists_rels" CASCADE;
  DROP TABLE "_best_lists_v_rels" CASCADE;
  DROP TABLE "guides_rels" CASCADE;
  DROP TABLE "_guides_v_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "_tags_v" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "navigation_header_links" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "site_settings_social_profiles" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_meta_image_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "categories" DROP CONSTRAINT "categories_meta_image_id_media_id_fk";
  
  ALTER TABLE "brands" DROP CONSTRAINT "brands_meta_image_id_media_id_fk";
  
  ALTER TABLE "best_lists" DROP CONSTRAINT "best_lists_meta_image_id_media_id_fk";
  
  ALTER TABLE "_best_lists_v" DROP CONSTRAINT "_best_lists_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "comparisons" DROP CONSTRAINT "comparisons_meta_image_id_media_id_fk";
  
  ALTER TABLE "_comparisons_v" DROP CONSTRAINT "_comparisons_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "guides" DROP CONSTRAINT "guides_meta_image_id_media_id_fk";
  
  ALTER TABLE "_guides_v" DROP CONSTRAINT "_guides_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT "media_folder_id_payload_folders_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_folders_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_share_image_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_logo_id_media_id_fk";
  
  DROP INDEX "products_meta_meta_image_idx";
  DROP INDEX "products_deleted_at_idx";
  DROP INDEX "_products_v_version_meta_version_meta_image_idx";
  DROP INDEX "_products_v_version_version_deleted_at_idx";
  DROP INDEX "_products_v_autosave_idx";
  DROP INDEX "categories_meta_meta_image_idx";
  DROP INDEX "categories_deleted_at_idx";
  DROP INDEX "brands_meta_meta_image_idx";
  DROP INDEX "brands_deleted_at_idx";
  DROP INDEX "best_lists_meta_meta_image_idx";
  DROP INDEX "best_lists_deleted_at_idx";
  DROP INDEX "_best_lists_v_version_meta_version_meta_image_idx";
  DROP INDEX "_best_lists_v_version_version_deleted_at_idx";
  DROP INDEX "_best_lists_v_autosave_idx";
  DROP INDEX "comparisons_meta_meta_image_idx";
  DROP INDEX "comparisons_deleted_at_idx";
  DROP INDEX "_comparisons_v_version_meta_version_meta_image_idx";
  DROP INDEX "_comparisons_v_version_version_deleted_at_idx";
  DROP INDEX "_comparisons_v_autosave_idx";
  DROP INDEX "guides_meta_meta_image_idx";
  DROP INDEX "guides_deleted_at_idx";
  DROP INDEX "_guides_v_version_meta_version_meta_image_idx";
  DROP INDEX "_guides_v_version_version_deleted_at_idx";
  DROP INDEX "_guides_v_autosave_idx";
  DROP INDEX "media_folder_idx";
  DROP INDEX "media_deleted_at_idx";
  DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  DROP INDEX "media_sizes_card_sizes_card_filename_idx";
  DROP INDEX "media_sizes_share_sizes_share_filename_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  DROP INDEX "payload_locked_documents_rels_payload_folders_id_idx";
  DROP INDEX "site_settings_share_image_idx";
  DROP INDEX "site_settings_logo_idx";
  ALTER TABLE "products" DROP COLUMN "meta_title";
  ALTER TABLE "products" DROP COLUMN "meta_description";
  ALTER TABLE "products" DROP COLUMN "meta_image_id";
  ALTER TABLE "products" DROP COLUMN "meta_noindex";
  ALTER TABLE "products" DROP COLUMN "meta_canonical";
  ALTER TABLE "products" DROP COLUMN "deleted_at";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "_products_v" DROP COLUMN "version_meta_canonical";
  ALTER TABLE "_products_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "_products_v" DROP COLUMN "autosave";
  ALTER TABLE "categories" DROP COLUMN "meta_title";
  ALTER TABLE "categories" DROP COLUMN "meta_description";
  ALTER TABLE "categories" DROP COLUMN "meta_image_id";
  ALTER TABLE "categories" DROP COLUMN "meta_noindex";
  ALTER TABLE "categories" DROP COLUMN "meta_canonical";
  ALTER TABLE "categories" DROP COLUMN "deleted_at";
  ALTER TABLE "brands" DROP COLUMN "meta_title";
  ALTER TABLE "brands" DROP COLUMN "meta_description";
  ALTER TABLE "brands" DROP COLUMN "meta_image_id";
  ALTER TABLE "brands" DROP COLUMN "meta_noindex";
  ALTER TABLE "brands" DROP COLUMN "meta_canonical";
  ALTER TABLE "brands" DROP COLUMN "deleted_at";
  ALTER TABLE "best_lists" DROP COLUMN "meta_title";
  ALTER TABLE "best_lists" DROP COLUMN "meta_description";
  ALTER TABLE "best_lists" DROP COLUMN "meta_image_id";
  ALTER TABLE "best_lists" DROP COLUMN "meta_noindex";
  ALTER TABLE "best_lists" DROP COLUMN "meta_canonical";
  ALTER TABLE "best_lists" DROP COLUMN "deleted_at";
  ALTER TABLE "_best_lists_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_best_lists_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_best_lists_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_best_lists_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "_best_lists_v" DROP COLUMN "version_meta_canonical";
  ALTER TABLE "_best_lists_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "_best_lists_v" DROP COLUMN "autosave";
  ALTER TABLE "comparisons" DROP COLUMN "meta_title";
  ALTER TABLE "comparisons" DROP COLUMN "meta_description";
  ALTER TABLE "comparisons" DROP COLUMN "meta_image_id";
  ALTER TABLE "comparisons" DROP COLUMN "meta_noindex";
  ALTER TABLE "comparisons" DROP COLUMN "meta_canonical";
  ALTER TABLE "comparisons" DROP COLUMN "deleted_at";
  ALTER TABLE "_comparisons_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_comparisons_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_comparisons_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_comparisons_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "_comparisons_v" DROP COLUMN "version_meta_canonical";
  ALTER TABLE "_comparisons_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "_comparisons_v" DROP COLUMN "autosave";
  ALTER TABLE "guides" DROP COLUMN "meta_title";
  ALTER TABLE "guides" DROP COLUMN "meta_description";
  ALTER TABLE "guides" DROP COLUMN "meta_image_id";
  ALTER TABLE "guides" DROP COLUMN "meta_noindex";
  ALTER TABLE "guides" DROP COLUMN "meta_canonical";
  ALTER TABLE "guides" DROP COLUMN "deleted_at";
  ALTER TABLE "_guides_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_guides_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_guides_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_guides_v" DROP COLUMN "version_meta_noindex";
  ALTER TABLE "_guides_v" DROP COLUMN "version_meta_canonical";
  ALTER TABLE "_guides_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "_guides_v" DROP COLUMN "autosave";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "media" DROP COLUMN "folder_id";
  ALTER TABLE "media" DROP COLUMN "deleted_at";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_card_url";
  ALTER TABLE "media" DROP COLUMN "sizes_card_width";
  ALTER TABLE "media" DROP COLUMN "sizes_card_height";
  ALTER TABLE "media" DROP COLUMN "sizes_card_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_card_filename";
  ALTER TABLE "media" DROP COLUMN "sizes_share_url";
  ALTER TABLE "media" DROP COLUMN "sizes_share_width";
  ALTER TABLE "media" DROP COLUMN "sizes_share_height";
  ALTER TABLE "media" DROP COLUMN "sizes_share_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_share_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_share_filename";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_folders_id";
  ALTER TABLE "site_settings" DROP COLUMN "hide_from_search";
  ALTER TABLE "site_settings" DROP COLUMN "meta_description";
  ALTER TABLE "site_settings" DROP COLUMN "share_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "logo_id";
  ALTER TABLE "site_settings" DROP COLUMN "google_verification";
  ALTER TABLE "site_settings" DROP COLUMN "bing_verification";
  ALTER TABLE "site_settings" DROP COLUMN "twitter_handle";
  ALTER TABLE "site_settings" DROP COLUMN "ga_measurement_id";
  DROP TYPE "public"."enum__categories_v_version_app_category";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_navigation_header_links_type";
  DROP TYPE "public"."enum_navigation_footer_columns_links_type";`)
}
