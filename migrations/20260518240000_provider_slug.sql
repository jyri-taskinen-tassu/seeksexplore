-- Add provider_slug to providers table and add public RLS policies for booking flow

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS provider_slug TEXT;

-- Unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'providers_provider_slug_key'
  ) THEN
    ALTER TABLE providers
      ADD CONSTRAINT providers_provider_slug_key UNIQUE (provider_slug);
  END IF;
END$$;

-- Backfill slugs: lowercase, spaces → dashes, strip non-alphanumeric/dash
UPDATE providers
SET provider_slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(COALESCE(business_name, official_name, 'provider'), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE provider_slug IS NULL;

-- Public read: providers (by slug for booking page)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'seeks_and_explore_demo' AND tablename = 'providers' AND policyname = 'anon_select_providers'
  ) THEN
    CREATE POLICY "anon_select_providers"
      ON providers FOR SELECT USING (true);
  END IF;
END$$;

-- Public read: products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'seeks_and_explore_demo' AND tablename = 'products' AND policyname = 'anon_select_products'
  ) THEN
    CREATE POLICY "anon_select_products"
      ON products FOR SELECT USING (true);
  END IF;
END$$;

-- Public read: product_information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'seeks_and_explore_demo' AND tablename = 'product_information' AND policyname = 'anon_select_product_information'
  ) THEN
    CREATE POLICY "anon_select_product_information"
      ON product_information FOR SELECT USING (true);
  END IF;
END$$;

-- Public read: product_images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'seeks_and_explore_demo' AND tablename = 'product_images' AND policyname = 'anon_select_product_images'
  ) THEN
    CREATE POLICY "anon_select_product_images"
      ON product_images FOR SELECT USING (true);
  END IF;
END$$;

-- Public read: product_tags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'seeks_and_explore_demo' AND tablename = 'product_tags' AND policyname = 'anon_select_product_tags'
  ) THEN
    CREATE POLICY "anon_select_product_tags"
      ON product_tags FOR SELECT USING (true);
  END IF;
END$$;
