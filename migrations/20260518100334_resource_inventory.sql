-- resource_categories: per-provider inventory categories (snowmobiles, e-bikes, guides, etc.)
CREATE TABLE resource_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_resource_categories
  BEFORE UPDATE ON resource_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- resource_variants: specific variants within a category (sport 1-seat, touring 2-seat, etc.)
CREATE TABLE resource_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES resource_categories(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity_per_unit integer,
  unit_label text NOT NULL DEFAULT 'unit',
  total_units integer NOT NULL DEFAULT 0,
  buffer_units integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resource_variants ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_resource_variants
  BEFORE UPDATE ON resource_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: resource_categories
CREATE POLICY "provider_select_resource_categories"
ON resource_categories FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_resource_categories"
ON resource_categories FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_resource_categories"
ON resource_categories FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_resource_categories"
ON resource_categories FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_categories.provider_id AND pu.profile_id = auth.uid()
));

-- RLS: resource_variants
CREATE POLICY "provider_select_resource_variants"
ON resource_variants FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_resource_variants"
ON resource_variants FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_resource_variants"
ON resource_variants FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_resource_variants"
ON resource_variants FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = resource_variants.provider_id AND pu.profile_id = auth.uid()
));
