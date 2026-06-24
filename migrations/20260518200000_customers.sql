-- customers: per-provider customer records
CREATE TABLE customers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  tags text[] NOT NULL DEFAULT '{}',
  total_bookings integer NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  first_booking_date date,
  last_booking_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- sales_opportunities: sales pipeline per provider
CREATE TABLE sales_opportunities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  product_name text NOT NULL,
  stage text NOT NULL DEFAULT 'inquiry' CHECK (stage IN ('inquiry', 'quoted', 'followup', 'booked', 'completed')),
  estimated_value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  guests integer NOT NULL DEFAULT 1,
  preferred_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_opportunities ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_sales_opportunities
  BEFORE UPDATE ON sales_opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: customers
CREATE POLICY "provider_select_customers"
ON customers FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = customers.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_customers"
ON customers FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = customers.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_customers"
ON customers FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = customers.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = customers.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_customers"
ON customers FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = customers.provider_id AND pu.profile_id = auth.uid()
));

-- RLS: sales_opportunities
CREATE POLICY "provider_select_sales_opportunities"
ON sales_opportunities FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = sales_opportunities.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_insert_sales_opportunities"
ON sales_opportunities FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = sales_opportunities.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_update_sales_opportunities"
ON sales_opportunities FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = sales_opportunities.provider_id AND pu.profile_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = sales_opportunities.provider_id AND pu.profile_id = auth.uid()
));

CREATE POLICY "provider_delete_sales_opportunities"
ON sales_opportunities FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM provider_users pu
  WHERE pu.provider_id = sales_opportunities.provider_id AND pu.profile_id = auth.uid()
));
