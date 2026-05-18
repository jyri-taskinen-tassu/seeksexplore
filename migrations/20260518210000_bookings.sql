-- bookings table
CREATE TABLE seeks_and_explore_demo.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES seeks_and_explore_demo.providers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  product_name text NOT NULL,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  total_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  notes text,
  cancelled_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE seeks_and_explore_demo.bookings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON seeks_and_explore_demo.bookings
  FOR EACH ROW EXECUTE FUNCTION seeks_and_explore_demo.set_updated_at();

-- RLS policies (same pattern as resource_categories)
CREATE POLICY "provider_select_bookings"
ON seeks_and_explore_demo.bookings FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = bookings.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_bookings"
ON seeks_and_explore_demo.bookings FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = bookings.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_bookings"
ON seeks_and_explore_demo.bookings FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = bookings.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = bookings.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_bookings"
ON seeks_and_explore_demo.bookings FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM seeks_and_explore_demo.provider_users pu
  WHERE pu.provider_id = bookings.provider_id AND pu.profile_id = auth.uid()
));
