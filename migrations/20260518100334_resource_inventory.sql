-- resource_categories: per-provider inventory categories (snowmobiles, e-bikes, guides, etc.)
CREATE TABLE seeks_and_explore_demo.resource_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES seeks_and_explore_demo.providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seeks_and_explore_demo.resource_categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_resource_categories
  BEFORE UPDATE ON seeks_and_explore_demo.resource_categories
  FOR EACH ROW EXECUTE FUNCTION seeks_and_explore_demo.set_updated_at();

-- resource_variants: specific variants within a category (sport 1-seat, touring 2-seat, etc.)
CREATE TABLE seeks_and_explore_demo.resource_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES seeks_and_explore_demo.resource_categories(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES seeks_and_explore_demo.providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity_per_unit integer,
  unit_label text NOT NULL DEFAULT 'unit',
  total_units integer NOT NULL DEFAULT 0,
  buffer_units integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seeks_and_explore_demo.resource_variants ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_resource_variants
  BEFORE UPDATE ON seeks_and_explore_demo.resource_variants
  FOR EACH ROW EXECUTE FUNCTION seeks_and_explore_demo.set_updated_at();

-- RLS: resource_categories
CREATE POLICY "provider_select_resource_categories"
ON seeks_and_explore_demo.resource_categories FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_resource_categories"
ON seeks_and_explore_demo.resource_categories FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_resource_categories"
ON seeks_and_explore_demo.resource_categories FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_resource_categories"
ON seeks_and_explore_demo.resource_categories FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

-- RLS: resource_variants
CREATE POLICY "provider_select_resource_variants"
ON seeks_and_explore_demo.resource_variants FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_resource_variants"
ON seeks_and_explore_demo.resource_variants FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_resource_variants"
ON seeks_and_explore_demo.resource_variants FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_resource_variants"
ON seeks_and_explore_demo.resource_variants FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

-- Seed mock data for existing demo providers
DO $$
DECLARE
  p_id uuid;
  cat_snow uuid;
  cat_ebike uuid;
  cat_guide uuid;
BEGIN
  FOR p_id IN SELECT id FROM seeks_and_explore_demo.providers LOOP
    INSERT INTO seeks_and_explore_demo.resource_categories (provider_id, name, description)
    VALUES
      (p_id, 'Snowmobiles', 'Winter vehicles for snowmobile safaris'),
      (p_id, 'E-bikes', 'Electric bicycles for tours'),
      (p_id, 'Guides', 'Professional tour guides');

    SELECT id INTO cat_snow FROM seeks_and_explore_demo.resource_categories
      WHERE provider_id = p_id AND name = 'Snowmobiles' LIMIT 1;
    SELECT id INTO cat_ebike FROM seeks_and_explore_demo.resource_categories
      WHERE provider_id = p_id AND name = 'E-bikes' LIMIT 1;
    SELECT id INTO cat_guide FROM seeks_and_explore_demo.resource_categories
      WHERE provider_id = p_id AND name = 'Guides' LIMIT 1;

    INSERT INTO seeks_and_explore_demo.resource_variants
      (category_id, provider_id, name, capacity_per_unit, unit_label, total_units, buffer_units, status)
    VALUES
      (cat_snow, p_id, 'Sport (1-seat)', 1, 'vehicle', 5, 0, 'active'),
      (cat_snow, p_id, 'Touring (2-seat)', 2, 'vehicle', 5, 1, 'active'),
      (cat_ebike, p_id, 'Adult M/L', 1, 'bike', 10, 1, 'active'),
      (cat_guide, p_id, 'Guide', 1, 'guide', 4, 0, 'active');
  END LOOP;
END $$;
