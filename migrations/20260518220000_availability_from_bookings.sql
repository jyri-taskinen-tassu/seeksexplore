-- SEE-38: Availability calendar from bookings + resource availability stored procedure

-- 1. Add product_id FK to bookings
ALTER TABLE seeks_and_explore_demo.bookings
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES seeks_and_explore_demo.products(id) ON DELETE SET NULL;

-- 2. Add resources JSONB to products (maps resource_variant_id → units needed per booking)
ALTER TABLE seeks_and_explore_demo.products
  ADD COLUMN IF NOT EXISTS resources jsonb NOT NULL DEFAULT '{}';

-- 3. Stored procedure: resource availability for a given date and provider
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.get_resource_availability(
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
      FROM seeks_and_explore_demo.bookings b
      JOIN seeks_and_explore_demo.products prod ON prod.id = b.product_id
      WHERE b.booking_date = p_date
        AND b.provider_id = p_provider_id
        AND b.status != 'cancelled'
        AND prod.resources ? rv.id::text
    ), 0)::integer AS booked_units
  FROM seeks_and_explore_demo.resource_categories rc
  JOIN seeks_and_explore_demo.resource_variants rv ON rv.category_id = rc.id
  WHERE rc.provider_id = p_provider_id
    AND rv.provider_id = p_provider_id
  ORDER BY rc.name, rv.name
$$;

-- 4. Seed Tahko: update Campfire safari with guide resource
UPDATE seeks_and_explore_demo.products
SET resources = '{"8b8e2525-7892-422a-be07-39bebe3ebbd6": 1}'
WHERE id = '287422af-7939-4583-9d00-ed47a54e5568';

-- 5. Seed Tahko: Snowmobile Safari product
INSERT INTO seeks_and_explore_demo.products (id, provider_id, type, capacity_max, duration_hours, duration_minutes, resources)
VALUES (
  'aaaaaaaa-0001-4000-a000-000000000001',
  '45ba17b9-21ec-4193-a2ca-9bb4bc9ce808',
  'safari', 8, 2, 0,
  '{"f130ac6a-c247-41bf-a107-83d2a57491c1": 2, "8b8e2525-7892-422a-be07-39bebe3ebbd6": 1}'
) ON CONFLICT (id) DO UPDATE SET resources = EXCLUDED.resources;

INSERT INTO seeks_and_explore_demo.product_information (product_id, language, name, description)
VALUES (
  'aaaaaaaa-0001-4000-a000-000000000001', 'en',
  'Snowmobile Safari',
  'Guided snowmobile tour through the winter landscape of Tahko.'
) ON CONFLICT (id) DO NOTHING;

-- 6. Seed Tahko: E-bike Tour product
INSERT INTO seeks_and_explore_demo.products (id, provider_id, type, capacity_max, duration_hours, duration_minutes, resources)
VALUES (
  'aaaaaaaa-0002-4000-a000-000000000002',
  '45ba17b9-21ec-4193-a2ca-9bb4bc9ce808',
  'tour', 4, 3, 0,
  '{"2c36f775-4830-4a0a-b822-f528e180229e": 4, "8b8e2525-7892-422a-be07-39bebe3ebbd6": 1}'
) ON CONFLICT (id) DO UPDATE SET resources = EXCLUDED.resources;

INSERT INTO seeks_and_explore_demo.product_information (product_id, language, name, description)
VALUES (
  'aaaaaaaa-0002-4000-a000-000000000002', 'en',
  'E-bike Tour',
  'Explore Tahko trails on electric bikes with a local guide.'
) ON CONFLICT (id) DO NOTHING;

-- 7. Seed bookings (clean + realistic data with conflict scenarios)
DELETE FROM seeks_and_explore_demo.bookings
WHERE provider_id = '45ba17b9-21ec-4193-a2ca-9bb4bc9ce808';

INSERT INTO seeks_and_explore_demo.bookings
  (provider_id, product_id, customer_name, customer_email, product_name, booking_date, booking_time, guests, status, total_price, currency)
VALUES
  -- 2026-05-19: Normal (4 SM Sport + 3 Guides — all OK)
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Anna Smith','anna@example.com','Snowmobile Safari','2026-05-19','09:00',2,'confirmed',120,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Bob Jones','bob@example.com','Snowmobile Safari','2026-05-19','11:00',4,'confirmed',240,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','287422af-7939-4583-9d00-ed47a54e5568','Carol White','carol@example.com','Campfire safari - 2 hours','2026-05-19','14:00',8,'confirmed',320,'EUR'),
  -- 2026-05-20: SM conflict (6 SM Sport used, 5 available)
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','David Brown','david@example.com','Snowmobile Safari','2026-05-20','09:00',2,'confirmed',120,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Eva Wilson','eva@example.com','Snowmobile Safari','2026-05-20','11:00',2,'confirmed',120,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Frank Miller','frank@example.com','Snowmobile Safari','2026-05-20','13:00',2,'confirmed',120,'EUR'),
  -- 2026-05-21: E-bikes (8 E-bikes + 3 Guides — all OK)
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0002-4000-a000-000000000002','Grace Lee','grace@example.com','E-bike Tour','2026-05-21','10:00',4,'confirmed',160,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0002-4000-a000-000000000002','Harry Chen','harry@example.com','E-bike Tour','2026-05-21','14:00',4,'confirmed',160,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','287422af-7939-4583-9d00-ed47a54e5568','Iris Park','iris@example.com','Campfire safari - 2 hours','2026-05-21','16:00',12,'pending',0,'EUR'),
  -- 2026-05-22: Mixed, no conflicts
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Jack Taylor','jack@example.com','Snowmobile Safari','2026-05-22','09:00',4,'confirmed',240,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0002-4000-a000-000000000002','Kim Nguyen','kim@example.com','E-bike Tour','2026-05-22','13:00',4,'confirmed',160,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','287422af-7939-4583-9d00-ed47a54e5568','Liam Davis','liam@example.com','Campfire safari - 2 hours','2026-05-22','15:00',20,'confirmed',600,'EUR'),
  -- 2026-05-24: SM + Guide conflict (6 SM Sport + 5 Guides — both over capacity)
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Mike Ross','mike@example.com','Snowmobile Safari','2026-05-24','08:00',2,'pending',120,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Nina Ford','nina@example.com','Snowmobile Safari','2026-05-24','10:00',2,'confirmed',120,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0001-4000-a000-000000000001','Oscar Hunt','oscar@example.com','Snowmobile Safari','2026-05-24','12:00',2,'confirmed',120,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','287422af-7939-4583-9d00-ed47a54e5568','Paula Reid','paula@example.com','Campfire safari - 2 hours','2026-05-24','14:00',15,'confirmed',450,'EUR'),
  ('45ba17b9-21ec-4193-a2ca-9bb4bc9ce808','aaaaaaaa-0002-4000-a000-000000000002','Quinn Adams','quinn@example.com','E-bike Tour','2026-05-24','16:00',4,'confirmed',160,'EUR');
