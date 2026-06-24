-- SEE-38: Availability calendar from bookings + resource availability stored procedure

-- 1. Add product_id FK to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES products(id) ON DELETE SET NULL;

-- 2. Add resources JSONB to products (maps resource_variant_id → units needed per booking)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS resources jsonb NOT NULL DEFAULT '{}';

-- 3. Stored procedure: resource availability for a given date and provider
CREATE OR REPLACE FUNCTION get_resource_availability(
  p_date date,
  p_provider_id uuid
)
RETURNS TABLE (
  category_id   uuid,
  category_name text,
  variant_id    uuid,
  variant_name  text,
  total_units   integer,
  booked_units  integer
)
LANGUAGE sql STABLE
AS $$
  SELECT
    rc.id AS category_id,
    rc.name AS category_name,
    rv.id AS variant_id,
    rv.name AS variant_name,
    rv.total_units,
    COALESCE((
      SELECT SUM((prod.resources ->> rv.id::text)::integer)
      FROM bookings b
      JOIN products prod ON prod.id = b.product_id
      WHERE b.booking_date = p_date
        AND b.provider_id = p_provider_id
        AND b.status != 'cancelled'
        AND prod.resources ? rv.id::text
    ), 0)::integer AS booked_units
  FROM resource_categories rc
  JOIN resource_variants rv ON rv.category_id = rc.id
  WHERE rc.provider_id = p_provider_id
    AND rv.provider_id = p_provider_id
  ORDER BY rc.name, rv.name
$$;

