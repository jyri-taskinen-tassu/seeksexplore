-- ============================================================
-- Initial migration: seeks_and_explore_demo schema
-- Captures schema state as-is from Supabase project emam-dev
-- ============================================================

-- ------------------------------------------------------------
-- Schema
-- ------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS seeks_and_explore_demo;

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
CREATE TYPE seeks_and_explore_demo.user_role AS ENUM ('admin', 'provider');

-- ------------------------------------------------------------
-- Functions (no-dep first)
-- ------------------------------------------------------------

-- Trigger helper: auto-set updated_at
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Role lookup for RLS policies (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.get_my_role()
  RETURNS seeks_and_explore_demo.user_role
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
AS $$
  SELECT role FROM seeks_and_explore_demo.profiles WHERE id = auth.uid();
$$;

-- Create/promote a user to admin
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.create_admin(target_email text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No auth user with email: %', target_email;
  END IF;
  INSERT INTO seeks_and_explore_demo.profiles (id, role, email)
  VALUES (target_id, 'admin', target_email)
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
END;
$$;

-- Link a provider user to a provider
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.create_provider_profile(
  p_user_id   uuid,
  p_email     text,
  p_provider_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
BEGIN
  INSERT INTO seeks_and_explore_demo.profiles (id, role, email)
  VALUES (p_user_id, 'provider', p_email)
  ON CONFLICT (id) DO UPDATE SET role = 'provider', updated_at = now();

  INSERT INTO seeks_and_explore_demo.provider_users (profile_id, provider_id)
  VALUES (p_user_id, p_provider_id)
  ON CONFLICT (profile_id) DO NOTHING;
END;
$$;

-- ------------------------------------------------------------
-- Tables (dependency order)
-- ------------------------------------------------------------

-- profiles: one row per auth user
CREATE TABLE seeks_and_explore_demo.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role        seeks_and_explore_demo.user_role NOT NULL DEFAULT 'provider',
  full_name   text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- providers: experience operator companies
CREATE TABLE seeks_and_explore_demo.providers (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bf_company_id         uuid        UNIQUE,
  bf_business_entity_id uuid,
  official_name         text        NOT NULL,
  business_name         text,
  description           text,
  website_url           text,
  webshop_url           text,
  logo_url              text,
  logo_thumbnail_url    text,
  email                 text,
  phone                 text,
  street_name           text,
  city                  text,
  postal_code           text,
  location_lat          numeric,
  location_lng          numeric,
  social_links          jsonb       DEFAULT '{}'::jsonb,
  imported_at           timestamptz DEFAULT now(),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- provider_users: many-to-one profile → provider
CREATE TABLE seeks_and_explore_demo.provider_users (
  profile_id  uuid        PRIMARY KEY REFERENCES seeks_and_explore_demo.profiles (id) ON DELETE CASCADE,
  provider_id uuid        NOT NULL REFERENCES seeks_and_explore_demo.providers (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- products: experiences/activities
CREATE TABLE seeks_and_explore_demo.products (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id      uuid        NOT NULL REFERENCES seeks_and_explore_demo.providers (id) ON DELETE CASCADE,
  bf_product_id    uuid        UNIQUE,
  type             text,
  accessible       boolean,
  external_source  text,
  url_primary      text,
  webshop_url_primary text,
  price_from       numeric,
  price_to         numeric,
  pricing_unit     text,
  duration_days    integer,
  duration_hours   integer,
  duration_minutes integer,
  capacity_min     integer,
  capacity_max     integer,
  street_name      text,
  city             text,
  postal_code      text,
  location_lat     numeric,
  location_lng     numeric,
  available_months text[],
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- product_information: localised name/description per language
CREATE TABLE seeks_and_explore_demo.product_information (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES seeks_and_explore_demo.products (id) ON DELETE CASCADE,
  language    text        NOT NULL,
  name        text,
  description text,
  url         text,
  webshop_url text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, language)
);

-- product_images
CREATE TABLE seeks_and_explore_demo.product_images (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid        NOT NULL REFERENCES seeks_and_explore_demo.products (id) ON DELETE CASCADE,
  large_url      text        NOT NULL,
  thumbnail_url  text,
  original_url   text,
  alt_text       text,
  copyright      text,
  is_cover       boolean     DEFAULT false,
  orientation    text,
  order_index    integer,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- product_tags
CREATE TABLE seeks_and_explore_demo.product_tags (
  id             uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid  NOT NULL REFERENCES seeks_and_explore_demo.products (id) ON DELETE CASCADE,
  tag            text  NOT NULL,
  category_group text,
  UNIQUE (product_id, tag)
);

-- product_target_groups
CREATE TABLE seeks_and_explore_demo.product_target_groups (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid  NOT NULL REFERENCES seeks_and_explore_demo.products (id) ON DELETE CASCADE,
  target_group text  NOT NULL,
  UNIQUE (product_id, target_group)
);

-- product_certificates
CREATE TABLE seeks_and_explore_demo.product_certificates (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid  NOT NULL REFERENCES seeks_and_explore_demo.products (id) ON DELETE CASCADE,
  name        text  NOT NULL,
  description text,
  logo_url    text,
  website_url text
);

-- product_availability: date/time slots
CREATE TABLE seeks_and_explore_demo.product_availability (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid    NOT NULL REFERENCES seeks_and_explore_demo.products (id) ON DELETE CASCADE,
  start_date     date,
  end_date       date,
  start_time     timetz,
  end_time       timetz,
  doors_open_at  timetz,
  nr_of_tickets  integer
);

-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON seeks_and_explore_demo.profiles
  FOR EACH ROW EXECUTE FUNCTION seeks_and_explore_demo.set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON seeks_and_explore_demo.providers
  FOR EACH ROW EXECUTE FUNCTION seeks_and_explore_demo.set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON seeks_and_explore_demo.products
  FOR EACH ROW EXECUTE FUNCTION seeks_and_explore_demo.set_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE seeks_and_explore_demo.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.providers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.provider_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.product_information  ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.product_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.product_target_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.product_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeks_and_explore_demo.product_availability ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY own_profile_select ON seeks_and_explore_demo.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY admin_all_profiles ON seeks_and_explore_demo.profiles
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- providers policies
CREATE POLICY provider_own_company ON seeks_and_explore_demo.providers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM seeks_and_explore_demo.provider_users pu
      WHERE pu.provider_id = providers.id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all_providers ON seeks_and_explore_demo.providers
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- provider_users policies
CREATE POLICY provider_own_link ON seeks_and_explore_demo.provider_users
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY admin_all_provider_users ON seeks_and_explore_demo.provider_users
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- products policies
CREATE POLICY provider_own_products ON seeks_and_explore_demo.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM seeks_and_explore_demo.provider_users pu
      WHERE pu.provider_id = products.provider_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all_products ON seeks_and_explore_demo.products
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- product_information policies
CREATE POLICY provider_select ON seeks_and_explore_demo.product_information
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM seeks_and_explore_demo.products p
      JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_information.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON seeks_and_explore_demo.product_information
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- product_images policies
CREATE POLICY provider_select ON seeks_and_explore_demo.product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM seeks_and_explore_demo.products p
      JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_images.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON seeks_and_explore_demo.product_images
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- product_tags policies
CREATE POLICY provider_select ON seeks_and_explore_demo.product_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM seeks_and_explore_demo.products p
      JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_tags.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON seeks_and_explore_demo.product_tags
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- product_target_groups policies
CREATE POLICY provider_select ON seeks_and_explore_demo.product_target_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM seeks_and_explore_demo.products p
      JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_target_groups.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON seeks_and_explore_demo.product_target_groups
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- product_certificates policies
CREATE POLICY provider_select ON seeks_and_explore_demo.product_certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM seeks_and_explore_demo.products p
      JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_certificates.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON seeks_and_explore_demo.product_certificates
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);

-- product_availability policies
CREATE POLICY provider_select ON seeks_and_explore_demo.product_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM seeks_and_explore_demo.products p
      JOIN seeks_and_explore_demo.provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_availability.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON seeks_and_explore_demo.product_availability
  FOR ALL USING (seeks_and_explore_demo.get_my_role() = 'admin'::seeks_and_explore_demo.user_role);
