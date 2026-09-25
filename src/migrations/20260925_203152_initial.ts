import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_claims_sentiment" AS ENUM('positive', 'negative');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_claims_sentiment" AS ENUM('positive', 'negative');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categories_app_category" AS ENUM('FinanceApplication', 'ShoppingApplication', 'LifestyleApplication', 'TravelApplication', 'HealthApplication', 'EntertainmentApplication', 'UtilitiesApplication');
  CREATE TYPE "public"."enum_best_lists_rank_by" AS ENUM('satisfaction', 'fewest-problems');
  CREATE TYPE "public"."enum_best_lists_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__best_lists_v_version_rank_by" AS ENUM('satisfaction', 'fewest-problems');
  CREATE TYPE "public"."enum__best_lists_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_comparisons_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__comparisons_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_guides_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guides_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_review_requests_status" AS ENUM('new', 'queued', 'added', 'declined');
  CREATE TYPE "public"."enum_sources_kind" AS ENUM('marketplace', 'brand-store', 'app-store', 'community', 'video');
  CREATE TYPE "public"."enum_reviews_sentiment" AS ENUM('positive', 'neutral', 'negative');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "products_claims" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sentiment" "enum_products_claims_sentiment",
  	"aspect_id" integer,
  	"text" varchar
  );
  
  CREATE TABLE "products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "products_offers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source_id" integer,
  	"price" numeric,
  	"mrp" numeric,
  	"in_stock" boolean DEFAULT true,
  	"url" varchar,
  	"checked_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_platform_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source_id" integer,
  	"rating" numeric,
  	"total" numeric
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_name" varchar,
  	"brand_id" integer,
  	"category_id" integer,
  	"variant" varchar,
  	"sample" boolean,
  	"answer" varchar,
  	"verdict_body" varchar,
  	"value_quantity" numeric DEFAULT 0,
  	"flipkart_url" varchar,
  	"play_store_id" varchar,
  	"app_store_id" varchar,
  	"reddit_phrases" varchar,
  	"data_updated_at" timestamp(3) with time zone,
  	"slug" varchar,
  	"author_id" integer,
  	"approved_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_products_v_version_claims" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sentiment" "enum__products_v_version_claims_sentiment",
  	"aspect_id" integer,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_offers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_id" integer,
  	"price" numeric,
  	"mrp" numeric,
  	"in_stock" boolean DEFAULT true,
  	"url" varchar,
  	"checked_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_platform_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_id" integer,
  	"rating" numeric,
  	"total" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_short_name" varchar,
  	"version_brand_id" integer,
  	"version_category_id" integer,
  	"version_variant" varchar,
  	"version_sample" boolean,
  	"version_answer" varchar,
  	"version_verdict_body" varchar,
  	"version_value_quantity" numeric DEFAULT 0,
  	"version_flipkart_url" varchar,
  	"version_play_store_id" varchar,
  	"version_app_store_id" varchar,
  	"version_reddit_phrases" varchar,
  	"version_data_updated_at" timestamp(3) with time zone,
  	"version_slug" varchar,
  	"version_author_id" integer,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categories_measures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"aspect_id" integer NOT NULL,
  	"deal_breaker" boolean,
  	"weight" numeric DEFAULT 1
  );
  
  CREATE TABLE "categories_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"parent_id" integer,
  	"tagline" varchar NOT NULL,
  	"intro" varchar,
  	"value_metric_label" varchar,
  	"value_metric_basis" numeric,
  	"is_app" boolean,
  	"app_category" "enum_categories_app_category",
  	"slug" varchar NOT NULL,
  	"refresh_days" numeric DEFAULT 21,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "brands_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "brands" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"about" varchar,
  	"website" varchar,
  	"logo_id" integer,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "best_lists_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "best_lists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"category_id" integer,
  	"qualifier" varchar,
  	"intro" varchar,
  	"rank_by" "enum_best_lists_rank_by" DEFAULT 'satisfaction',
  	"aspect_id" integer,
  	"max_price" numeric,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_best_lists_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_best_lists_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_best_lists_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_category_id" integer,
  	"version_qualifier" varchar,
  	"version_intro" varchar,
  	"version_rank_by" "enum__best_lists_v_version_rank_by" DEFAULT 'satisfaction',
  	"version_aspect_id" integer,
  	"version_max_price" numeric,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__best_lists_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "comparisons_pick_if" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"text" varchar
  );
  
  CREATE TABLE "comparisons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"judgement" varchar,
  	"category_id" integer,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_comparisons_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "comparisons_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_comparisons_v_version_pick_if" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_comparisons_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_judgement" varchar,
  	"version_category_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__comparisons_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_comparisons_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "guides_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "guides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"aspect_id" integer,
  	"section_id" integer,
  	"explainer" varchar,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_guides_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_guides_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guides_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_aspect_id" integer,
  	"version_section_id" integer,
  	"version_explainer" varchar,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guides_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "review_requests_subscribers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "review_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"query" varchar NOT NULL,
  	"product_url" varchar,
  	"product_id" integer,
  	"notes" varchar,
  	"status" "enum_review_requests_status" DEFAULT 'new' NOT NULL,
  	"request_count" numeric DEFAULT 1 NOT NULL,
  	"last_requested_at" timestamp(3) with time zone,
  	"normalized_query" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "aspects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"question" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_sources_kind" NOT NULL,
  	"weight" numeric DEFAULT 1 NOT NULL,
  	"has_ratings" boolean DEFAULT true,
  	"collection" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hidden" boolean,
  	"product_id" integer NOT NULL,
  	"body" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"rating" numeric,
  	"sentiment" "enum_reviews_sentiment",
  	"author" varchar,
  	"date" timestamp(3) with time zone,
  	"verified" boolean,
  	"credibility" numeric,
  	"url" varchar,
  	"aspects" jsonb,
  	"original" jsonb,
  	"external_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"role" "enum_users_role" DEFAULT 'editor',
  	"job_title" varchar DEFAULT 'Editor',
  	"bio" varchar,
  	"credentials" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"categories_id" integer,
  	"brands_id" integer,
  	"best_lists_id" integer,
  	"comparisons_id" integer,
  	"guides_id" integer,
  	"review_requests_id" integer,
  	"aspects_id" integer,
  	"sources_id" integer,
  	"reviews_id" integer,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_banner" boolean DEFAULT true,
  	"banner_text" varchar DEFAULT 'Development build — products marked Sample are fictional. Real products stay hidden until an editor publishes them.',
  	"hero_eyebrow" varchar DEFAULT 'Reviews from everywhere · one honest answer',
  	"hero_title" varchar DEFAULT 'Should you buy it? Every review, weighed.',
  	"hero_text" varchar DEFAULT 'We read every review of a product across Amazon, Flipkart, Reddit and the app stores, set aside the ones that look fake, count what people actually say — and give you a straight answer.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "scoring_rules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"buy_score" numeric DEFAULT 7.5 NOT NULL,
  	"caveats_score" numeric DEFAULT 6 NOT NULL,
  	"deal_breaker_problem_rate" numeric DEFAULT 0.2 NOT NULL,
  	"notable_con_problem_rate" numeric DEFAULT 0.1 NOT NULL,
  	"min_reviews_high" numeric DEFAULT 80 NOT NULL,
  	"min_reviews_medium" numeric DEFAULT 40 NOT NULL,
  	"min_mentions_per_aspect" numeric DEFAULT 5 NOT NULL,
  	"min_evidence_per_claim" numeric DEFAULT 2 NOT NULL,
  	"suspicious_below" numeric DEFAULT 0.3 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "catalog_state" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products_claims" ADD CONSTRAINT "products_claims_aspect_id_aspects_id_fk" FOREIGN KEY ("aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_claims" ADD CONSTRAINT "products_claims_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_offers" ADD CONSTRAINT "products_offers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_offers" ADD CONSTRAINT "products_offers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_platform_stats" ADD CONSTRAINT "products_platform_stats_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_platform_stats" ADD CONSTRAINT "products_platform_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_claims" ADD CONSTRAINT "_products_v_version_claims_aspect_id_aspects_id_fk" FOREIGN KEY ("aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_claims" ADD CONSTRAINT "_products_v_version_claims_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_offers" ADD CONSTRAINT "_products_v_version_offers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_offers" ADD CONSTRAINT "_products_v_version_offers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_platform_stats" ADD CONSTRAINT "_products_v_version_platform_stats_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_platform_stats" ADD CONSTRAINT "_products_v_version_platform_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_measures" ADD CONSTRAINT "categories_measures_aspect_id_aspects_id_fk" FOREIGN KEY ("aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_measures" ADD CONSTRAINT "categories_measures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_faq" ADD CONSTRAINT "categories_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "brands_same_as" ADD CONSTRAINT "brands_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "brands" ADD CONSTRAINT "brands_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "best_lists_faq" ADD CONSTRAINT "best_lists_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "best_lists" ADD CONSTRAINT "best_lists_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "best_lists" ADD CONSTRAINT "best_lists_aspect_id_aspects_id_fk" FOREIGN KEY ("aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_best_lists_v_version_faq" ADD CONSTRAINT "_best_lists_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_best_lists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_best_lists_v" ADD CONSTRAINT "_best_lists_v_parent_id_best_lists_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."best_lists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_best_lists_v" ADD CONSTRAINT "_best_lists_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_best_lists_v" ADD CONSTRAINT "_best_lists_v_version_aspect_id_aspects_id_fk" FOREIGN KEY ("version_aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comparisons_pick_if" ADD CONSTRAINT "comparisons_pick_if_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comparisons_pick_if" ADD CONSTRAINT "comparisons_pick_if_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comparisons_rels" ADD CONSTRAINT "comparisons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "comparisons_rels" ADD CONSTRAINT "comparisons_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_comparisons_v_version_pick_if" ADD CONSTRAINT "_comparisons_v_version_pick_if_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comparisons_v_version_pick_if" ADD CONSTRAINT "_comparisons_v_version_pick_if_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_comparisons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_comparisons_v" ADD CONSTRAINT "_comparisons_v_parent_id_comparisons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comparisons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comparisons_v" ADD CONSTRAINT "_comparisons_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_comparisons_v_rels" ADD CONSTRAINT "_comparisons_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_comparisons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_comparisons_v_rels" ADD CONSTRAINT "_comparisons_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides_faq" ADD CONSTRAINT "guides_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_aspect_id_aspects_id_fk" FOREIGN KEY ("aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guides" ADD CONSTRAINT "guides_section_id_categories_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v_version_faq" ADD CONSTRAINT "_guides_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guides_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_parent_id_guides_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guides"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_aspect_id_aspects_id_fk" FOREIGN KEY ("version_aspect_id") REFERENCES "public"."aspects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guides_v" ADD CONSTRAINT "_guides_v_version_section_id_categories_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "review_requests_subscribers" ADD CONSTRAINT "review_requests_subscribers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."review_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_best_lists_fk" FOREIGN KEY ("best_lists_id") REFERENCES "public"."best_lists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comparisons_fk" FOREIGN KEY ("comparisons_id") REFERENCES "public"."comparisons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guides_fk" FOREIGN KEY ("guides_id") REFERENCES "public"."guides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_review_requests_fk" FOREIGN KEY ("review_requests_id") REFERENCES "public"."review_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_aspects_fk" FOREIGN KEY ("aspects_id") REFERENCES "public"."aspects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_steps" ADD CONSTRAINT "site_settings_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_claims_order_idx" ON "products_claims" USING btree ("_order");
  CREATE INDEX "products_claims_parent_id_idx" ON "products_claims" USING btree ("_parent_id");
  CREATE INDEX "products_claims_aspect_idx" ON "products_claims" USING btree ("aspect_id");
  CREATE INDEX "products_faq_order_idx" ON "products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "products_faq" USING btree ("_parent_id");
  CREATE INDEX "products_offers_order_idx" ON "products_offers" USING btree ("_order");
  CREATE INDEX "products_offers_parent_id_idx" ON "products_offers" USING btree ("_parent_id");
  CREATE INDEX "products_offers_source_idx" ON "products_offers" USING btree ("source_id");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_platform_stats_order_idx" ON "products_platform_stats" USING btree ("_order");
  CREATE INDEX "products_platform_stats_parent_id_idx" ON "products_platform_stats" USING btree ("_parent_id");
  CREATE INDEX "products_platform_stats_source_idx" ON "products_platform_stats" USING btree ("source_id");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_author_idx" ON "products" USING btree ("author_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "_products_v_version_claims_order_idx" ON "_products_v_version_claims" USING btree ("_order");
  CREATE INDEX "_products_v_version_claims_parent_id_idx" ON "_products_v_version_claims" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_claims_aspect_idx" ON "_products_v_version_claims" USING btree ("aspect_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_offers_order_idx" ON "_products_v_version_offers" USING btree ("_order");
  CREATE INDEX "_products_v_version_offers_parent_id_idx" ON "_products_v_version_offers" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_offers_source_idx" ON "_products_v_version_offers" USING btree ("source_id");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_platform_stats_order_idx" ON "_products_v_version_platform_stats" USING btree ("_order");
  CREATE INDEX "_products_v_version_platform_stats_parent_id_idx" ON "_products_v_version_platform_stats" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_platform_stats_source_idx" ON "_products_v_version_platform_stats" USING btree ("source_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_category_idx" ON "_products_v" USING btree ("version_category_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_author_idx" ON "_products_v" USING btree ("version_author_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "categories_measures_order_idx" ON "categories_measures" USING btree ("_order");
  CREATE INDEX "categories_measures_parent_id_idx" ON "categories_measures" USING btree ("_parent_id");
  CREATE INDEX "categories_measures_aspect_idx" ON "categories_measures" USING btree ("aspect_id");
  CREATE INDEX "categories_faq_order_idx" ON "categories_faq" USING btree ("_order");
  CREATE INDEX "categories_faq_parent_id_idx" ON "categories_faq" USING btree ("_parent_id");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "brands_same_as_order_idx" ON "brands_same_as" USING btree ("_order");
  CREATE INDEX "brands_same_as_parent_id_idx" ON "brands_same_as" USING btree ("_parent_id");
  CREATE INDEX "brands_logo_idx" ON "brands" USING btree ("logo_id");
  CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug");
  CREATE INDEX "brands_updated_at_idx" ON "brands" USING btree ("updated_at");
  CREATE INDEX "brands_created_at_idx" ON "brands" USING btree ("created_at");
  CREATE INDEX "best_lists_faq_order_idx" ON "best_lists_faq" USING btree ("_order");
  CREATE INDEX "best_lists_faq_parent_id_idx" ON "best_lists_faq" USING btree ("_parent_id");
  CREATE INDEX "best_lists_category_idx" ON "best_lists" USING btree ("category_id");
  CREATE INDEX "best_lists_aspect_idx" ON "best_lists" USING btree ("aspect_id");
  CREATE UNIQUE INDEX "best_lists_slug_idx" ON "best_lists" USING btree ("slug");
  CREATE INDEX "best_lists_updated_at_idx" ON "best_lists" USING btree ("updated_at");
  CREATE INDEX "best_lists_created_at_idx" ON "best_lists" USING btree ("created_at");
  CREATE INDEX "best_lists__status_idx" ON "best_lists" USING btree ("_status");
  CREATE INDEX "_best_lists_v_version_faq_order_idx" ON "_best_lists_v_version_faq" USING btree ("_order");
  CREATE INDEX "_best_lists_v_version_faq_parent_id_idx" ON "_best_lists_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_best_lists_v_parent_idx" ON "_best_lists_v" USING btree ("parent_id");
  CREATE INDEX "_best_lists_v_version_version_category_idx" ON "_best_lists_v" USING btree ("version_category_id");
  CREATE INDEX "_best_lists_v_version_version_aspect_idx" ON "_best_lists_v" USING btree ("version_aspect_id");
  CREATE INDEX "_best_lists_v_version_version_slug_idx" ON "_best_lists_v" USING btree ("version_slug");
  CREATE INDEX "_best_lists_v_version_version_updated_at_idx" ON "_best_lists_v" USING btree ("version_updated_at");
  CREATE INDEX "_best_lists_v_version_version_created_at_idx" ON "_best_lists_v" USING btree ("version_created_at");
  CREATE INDEX "_best_lists_v_version_version__status_idx" ON "_best_lists_v" USING btree ("version__status");
  CREATE INDEX "_best_lists_v_created_at_idx" ON "_best_lists_v" USING btree ("created_at");
  CREATE INDEX "_best_lists_v_updated_at_idx" ON "_best_lists_v" USING btree ("updated_at");
  CREATE INDEX "_best_lists_v_latest_idx" ON "_best_lists_v" USING btree ("latest");
  CREATE INDEX "comparisons_pick_if_order_idx" ON "comparisons_pick_if" USING btree ("_order");
  CREATE INDEX "comparisons_pick_if_parent_id_idx" ON "comparisons_pick_if" USING btree ("_parent_id");
  CREATE INDEX "comparisons_pick_if_product_idx" ON "comparisons_pick_if" USING btree ("product_id");
  CREATE INDEX "comparisons_category_idx" ON "comparisons" USING btree ("category_id");
  CREATE UNIQUE INDEX "comparisons_slug_idx" ON "comparisons" USING btree ("slug");
  CREATE INDEX "comparisons_updated_at_idx" ON "comparisons" USING btree ("updated_at");
  CREATE INDEX "comparisons_created_at_idx" ON "comparisons" USING btree ("created_at");
  CREATE INDEX "comparisons__status_idx" ON "comparisons" USING btree ("_status");
  CREATE INDEX "comparisons_rels_order_idx" ON "comparisons_rels" USING btree ("order");
  CREATE INDEX "comparisons_rels_parent_idx" ON "comparisons_rels" USING btree ("parent_id");
  CREATE INDEX "comparisons_rels_path_idx" ON "comparisons_rels" USING btree ("path");
  CREATE INDEX "comparisons_rels_products_id_idx" ON "comparisons_rels" USING btree ("products_id");
  CREATE INDEX "_comparisons_v_version_pick_if_order_idx" ON "_comparisons_v_version_pick_if" USING btree ("_order");
  CREATE INDEX "_comparisons_v_version_pick_if_parent_id_idx" ON "_comparisons_v_version_pick_if" USING btree ("_parent_id");
  CREATE INDEX "_comparisons_v_version_pick_if_product_idx" ON "_comparisons_v_version_pick_if" USING btree ("product_id");
  CREATE INDEX "_comparisons_v_parent_idx" ON "_comparisons_v" USING btree ("parent_id");
  CREATE INDEX "_comparisons_v_version_version_category_idx" ON "_comparisons_v" USING btree ("version_category_id");
  CREATE INDEX "_comparisons_v_version_version_slug_idx" ON "_comparisons_v" USING btree ("version_slug");
  CREATE INDEX "_comparisons_v_version_version_updated_at_idx" ON "_comparisons_v" USING btree ("version_updated_at");
  CREATE INDEX "_comparisons_v_version_version_created_at_idx" ON "_comparisons_v" USING btree ("version_created_at");
  CREATE INDEX "_comparisons_v_version_version__status_idx" ON "_comparisons_v" USING btree ("version__status");
  CREATE INDEX "_comparisons_v_created_at_idx" ON "_comparisons_v" USING btree ("created_at");
  CREATE INDEX "_comparisons_v_updated_at_idx" ON "_comparisons_v" USING btree ("updated_at");
  CREATE INDEX "_comparisons_v_latest_idx" ON "_comparisons_v" USING btree ("latest");
  CREATE INDEX "_comparisons_v_rels_order_idx" ON "_comparisons_v_rels" USING btree ("order");
  CREATE INDEX "_comparisons_v_rels_parent_idx" ON "_comparisons_v_rels" USING btree ("parent_id");
  CREATE INDEX "_comparisons_v_rels_path_idx" ON "_comparisons_v_rels" USING btree ("path");
  CREATE INDEX "_comparisons_v_rels_products_id_idx" ON "_comparisons_v_rels" USING btree ("products_id");
  CREATE INDEX "guides_faq_order_idx" ON "guides_faq" USING btree ("_order");
  CREATE INDEX "guides_faq_parent_id_idx" ON "guides_faq" USING btree ("_parent_id");
  CREATE INDEX "guides_aspect_idx" ON "guides" USING btree ("aspect_id");
  CREATE INDEX "guides_section_idx" ON "guides" USING btree ("section_id");
  CREATE UNIQUE INDEX "guides_slug_idx" ON "guides" USING btree ("slug");
  CREATE INDEX "guides_updated_at_idx" ON "guides" USING btree ("updated_at");
  CREATE INDEX "guides_created_at_idx" ON "guides" USING btree ("created_at");
  CREATE INDEX "guides__status_idx" ON "guides" USING btree ("_status");
  CREATE INDEX "_guides_v_version_faq_order_idx" ON "_guides_v_version_faq" USING btree ("_order");
  CREATE INDEX "_guides_v_version_faq_parent_id_idx" ON "_guides_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_guides_v_parent_idx" ON "_guides_v" USING btree ("parent_id");
  CREATE INDEX "_guides_v_version_version_aspect_idx" ON "_guides_v" USING btree ("version_aspect_id");
  CREATE INDEX "_guides_v_version_version_section_idx" ON "_guides_v" USING btree ("version_section_id");
  CREATE INDEX "_guides_v_version_version_slug_idx" ON "_guides_v" USING btree ("version_slug");
  CREATE INDEX "_guides_v_version_version_updated_at_idx" ON "_guides_v" USING btree ("version_updated_at");
  CREATE INDEX "_guides_v_version_version_created_at_idx" ON "_guides_v" USING btree ("version_created_at");
  CREATE INDEX "_guides_v_version_version__status_idx" ON "_guides_v" USING btree ("version__status");
  CREATE INDEX "_guides_v_created_at_idx" ON "_guides_v" USING btree ("created_at");
  CREATE INDEX "_guides_v_updated_at_idx" ON "_guides_v" USING btree ("updated_at");
  CREATE INDEX "_guides_v_latest_idx" ON "_guides_v" USING btree ("latest");
  CREATE INDEX "review_requests_subscribers_order_idx" ON "review_requests_subscribers" USING btree ("_order");
  CREATE INDEX "review_requests_subscribers_parent_id_idx" ON "review_requests_subscribers" USING btree ("_parent_id");
  CREATE INDEX "review_requests_product_idx" ON "review_requests" USING btree ("product_id");
  CREATE INDEX "review_requests_normalized_query_idx" ON "review_requests" USING btree ("normalized_query");
  CREATE INDEX "review_requests_updated_at_idx" ON "review_requests" USING btree ("updated_at");
  CREATE INDEX "review_requests_created_at_idx" ON "review_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "aspects_slug_idx" ON "aspects" USING btree ("slug");
  CREATE INDEX "aspects_updated_at_idx" ON "aspects" USING btree ("updated_at");
  CREATE INDEX "aspects_created_at_idx" ON "aspects" USING btree ("created_at");
  CREATE UNIQUE INDEX "sources_slug_idx" ON "sources" USING btree ("slug");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "reviews_product_idx" ON "reviews" USING btree ("product_id");
  CREATE INDEX "reviews_source_idx" ON "reviews" USING btree ("source");
  CREATE UNIQUE INDEX "reviews_external_id_idx" ON "reviews" USING btree ("external_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "users_slug_idx" ON "users" USING btree ("slug");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_brands_id_idx" ON "payload_locked_documents_rels" USING btree ("brands_id");
  CREATE INDEX "payload_locked_documents_rels_best_lists_id_idx" ON "payload_locked_documents_rels" USING btree ("best_lists_id");
  CREATE INDEX "payload_locked_documents_rels_comparisons_id_idx" ON "payload_locked_documents_rels" USING btree ("comparisons_id");
  CREATE INDEX "payload_locked_documents_rels_guides_id_idx" ON "payload_locked_documents_rels" USING btree ("guides_id");
  CREATE INDEX "payload_locked_documents_rels_review_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("review_requests_id");
  CREATE INDEX "payload_locked_documents_rels_aspects_id_idx" ON "payload_locked_documents_rels" USING btree ("aspects_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_steps_order_idx" ON "site_settings_steps" USING btree ("_order");
  CREATE INDEX "site_settings_steps_parent_id_idx" ON "site_settings_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_claims" CASCADE;
  DROP TABLE "products_faq" CASCADE;
  DROP TABLE "products_offers" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_platform_stats" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "_products_v_version_claims" CASCADE;
  DROP TABLE "_products_v_version_faq" CASCADE;
  DROP TABLE "_products_v_version_offers" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_platform_stats" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "categories_measures" CASCADE;
  DROP TABLE "categories_faq" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "brands_same_as" CASCADE;
  DROP TABLE "brands" CASCADE;
  DROP TABLE "best_lists_faq" CASCADE;
  DROP TABLE "best_lists" CASCADE;
  DROP TABLE "_best_lists_v_version_faq" CASCADE;
  DROP TABLE "_best_lists_v" CASCADE;
  DROP TABLE "comparisons_pick_if" CASCADE;
  DROP TABLE "comparisons" CASCADE;
  DROP TABLE "comparisons_rels" CASCADE;
  DROP TABLE "_comparisons_v_version_pick_if" CASCADE;
  DROP TABLE "_comparisons_v" CASCADE;
  DROP TABLE "_comparisons_v_rels" CASCADE;
  DROP TABLE "guides_faq" CASCADE;
  DROP TABLE "guides" CASCADE;
  DROP TABLE "_guides_v_version_faq" CASCADE;
  DROP TABLE "_guides_v" CASCADE;
  DROP TABLE "review_requests_subscribers" CASCADE;
  DROP TABLE "review_requests" CASCADE;
  DROP TABLE "aspects" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_steps" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "scoring_rules" CASCADE;
  DROP TABLE "catalog_state" CASCADE;
  DROP TYPE "public"."enum_products_claims_sentiment";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_claims_sentiment";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_categories_app_category";
  DROP TYPE "public"."enum_best_lists_rank_by";
  DROP TYPE "public"."enum_best_lists_status";
  DROP TYPE "public"."enum__best_lists_v_version_rank_by";
  DROP TYPE "public"."enum__best_lists_v_version_status";
  DROP TYPE "public"."enum_comparisons_status";
  DROP TYPE "public"."enum__comparisons_v_version_status";
  DROP TYPE "public"."enum_guides_status";
  DROP TYPE "public"."enum__guides_v_version_status";
  DROP TYPE "public"."enum_review_requests_status";
  DROP TYPE "public"."enum_sources_kind";
  DROP TYPE "public"."enum_reviews_sentiment";
  DROP TYPE "public"."enum_users_role";`)
}
