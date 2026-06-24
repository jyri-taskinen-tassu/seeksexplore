-- ============================================================
-- Initial migration: seeks_and_explore_demo schema
-- Captures schema state as-is from Supabase project emam-dev
-- ============================================================

-- ------------------------------------------------------------
-- Schema
-- ------------------------------------------------------------
-- Schema seeks_and_explore_demo creation removed (assuming public schema)

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'provider');
  END IF;
END$$;

-- ------------------------------------------------------------
-- Tables (dependency order)
-- ------------------------------------------------------------

-- profiles: one row per auth user
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'provider',
  full_name   text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Automatically create a profile for new users signing up
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, full_name)
  VALUES (
    new.id,
    'provider',
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- providers: experience operator companies
CREATE TABLE IF NOT EXISTS providers (
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
CREATE TABLE IF NOT EXISTS provider_users (
  profile_id  uuid        PRIMARY KEY REFERENCES profiles (id) ON DELETE CASCADE,
  provider_id uuid        NOT NULL REFERENCES providers (id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- products: experiences/activities
CREATE TABLE IF NOT EXISTS products (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id      uuid        NOT NULL REFERENCES providers (id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS product_information (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  language    text        NOT NULL,
  name        text,
  description text,
  url         text,
  webshop_url text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, language)
);

-- product_images
CREATE TABLE IF NOT EXISTS product_images (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS product_tags (
  id             uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid  NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  tag            text  NOT NULL,
  category_group text,
  UNIQUE (product_id, tag)
);

-- product_target_groups
CREATE TABLE IF NOT EXISTS product_target_groups (
  id           uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid  NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  target_group text  NOT NULL,
  UNIQUE (product_id, target_group)
);

-- product_certificates
CREATE TABLE IF NOT EXISTS product_certificates (
  id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid  NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  name        text  NOT NULL,
  description text,
  logo_url    text,
  website_url text
);

-- product_availability: date/time slots
CREATE TABLE IF NOT EXISTS product_availability (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid    NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  start_date     date,
  end_date       date,
  start_time     timetz,
  end_time       timetz,
  doors_open_at  timetz,
  nr_of_tickets  integer
);


-- ------------------------------------------------------------
-- Functions (no-dep first)
-- ------------------------------------------------------------

-- Trigger helper: auto-set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Role lookup for RLS policies (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION get_my_role()
  RETURNS user_role
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Create/promote a user to admin
CREATE OR REPLACE FUNCTION create_admin(target_email text)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
DECLARE
  target_id uuid;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'No auth user with email: %', target_email;
  END IF;
  INSERT INTO profiles (id, role, email)
  VALUES (target_id, 'admin', target_email)
  ON CONFLICT (id) DO UPDATE SET role = 'admin', updated_at = now();
END;
$$;

-- Link a provider user to a provider
CREATE OR REPLACE FUNCTION create_provider_profile(
  p_user_id   uuid,
  p_email     text,
  p_provider_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO profiles (id, role, email)
  VALUES (p_user_id, 'provider', p_email)
  ON CONFLICT (id) DO UPDATE SET role = 'provider', updated_at = now();

  INSERT INTO provider_users (profile_id, provider_id)
  VALUES (p_user_id, p_provider_id)
  ON CONFLICT (profile_id) DO NOTHING;
END;
$$;

-- ------------------------------------------------------------
-- Triggers
-- ------------------------------------------------------------
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_information  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_target_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_availability ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY own_profile_select ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY admin_all_profiles ON profiles
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- providers policies
CREATE POLICY provider_own_company ON providers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_users pu
      WHERE pu.provider_id = providers.id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all_providers ON providers
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- provider_users policies
CREATE POLICY provider_own_link ON provider_users
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY admin_all_provider_users ON provider_users
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- products policies
CREATE POLICY provider_own_products ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM provider_users pu
      WHERE pu.provider_id = products.provider_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all_products ON products
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- product_information policies
CREATE POLICY provider_select ON product_information
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_information.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON product_information
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- product_images policies
CREATE POLICY provider_select ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_images.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON product_images
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- product_tags policies
CREATE POLICY provider_select ON product_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_tags.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON product_tags
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- product_target_groups policies
CREATE POLICY provider_select ON product_target_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_target_groups.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON product_target_groups
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- product_certificates policies
CREATE POLICY provider_select ON product_certificates
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_certificates.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON product_certificates
  FOR ALL USING (get_my_role() = 'admin'::user_role);

-- product_availability policies
CREATE POLICY provider_select ON product_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM products p
      JOIN provider_users pu ON pu.provider_id = p.provider_id
      WHERE p.id = product_availability.product_id AND pu.profile_id = auth.uid()
    )
  );

CREATE POLICY admin_all ON product_availability
  FOR ALL USING (get_my_role() = 'admin'::user_role);
