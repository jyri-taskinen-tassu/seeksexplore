-- Customer tags catalog table
-- Stores free-text tags used by providers for tagging customers, grouped by category.
-- Enables the Supabase RPC-backed grouped suggestions UI (SEE-44).

CREATE TABLE IF NOT EXISTS seeks_and_explore_demo.customer_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES seeks_and_explore_demo.providers(id),
  tag text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, tag)
);

-- RLS
ALTER TABLE seeks_and_explore_demo.customer_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers can manage their own tags"
  ON seeks_and_explore_demo.customer_tags
  FOR ALL
  USING (
    provider_id IN (
      SELECT pu.provider_id
      FROM seeks_and_explore_demo.provider_users pu
      WHERE pu.profile_id = auth.uid()
    )
  );

-- Seed default tags for all existing providers
INSERT INTO seeks_and_explore_demo.customer_tags (provider_id, tag, category, usage_count)
SELECT
  p.id,
  t.tag,
  t.category,
  t.usage_count
FROM seeks_and_explore_demo.providers p
CROSS JOIN (VALUES
  ('vip',          'Customer Type',  12),
  ('repeat',       'Customer Type',  28),
  ('group',        'Booking Type',   15),
  ('corporate',    'Booking Type',    7),
  ('family',       'Booking Type',   10),
  ('solo',         'Booking Type',    6),
  ('honeymoon',    'Booking Type',    3),
  ('birthday',     'Occasion',        4),
  ('anniversary',  'Occasion',        2),
  ('team-building','Occasion',        5),
  ('german',       'Language',        9),
  ('french',       'Language',        6),
  ('japanese',     'Language',        3),
  ('needs-assist', 'Accessibility',   2),
  ('wheelchair',   'Accessibility',   1),
  ('dietary-req',  'Preferences',     4),
  ('early-bird',   'Preferences',     7),
  ('late-checkout','Preferences',     2)
) AS t(tag, category, usage_count)
ON CONFLICT (provider_id, tag) DO NOTHING;

-- RPC: search customer tags grouped by category
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.search_customer_tags(
  p_provider_id uuid,
  p_query text DEFAULT ''
)
RETURNS TABLE (
  category text,
  tags jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    ct.category,
    jsonb_agg(
      jsonb_build_object(
        'id',          ct.id,
        'tag',         ct.tag,
        'category',    ct.category,
        'usage_count', ct.usage_count
      )
      ORDER BY ct.usage_count DESC, ct.tag ASC
    ) AS tags
  FROM seeks_and_explore_demo.customer_tags ct
  WHERE
    ct.provider_id = p_provider_id
    AND (p_query = '' OR ct.tag ILIKE '%' || p_query || '%')
  GROUP BY ct.category
  ORDER BY ct.category ASC;
$$;

-- RPC: upsert a customer tag (create if not exists, increment usage)
CREATE OR REPLACE FUNCTION seeks_and_explore_demo.upsert_customer_tag(
  p_provider_id uuid,
  p_tag text,
  p_category text DEFAULT 'General'
)
RETURNS seeks_and_explore_demo.customer_tags
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result seeks_and_explore_demo.customer_tags;
BEGIN
  INSERT INTO seeks_and_explore_demo.customer_tags (provider_id, tag, category, usage_count)
  VALUES (p_provider_id, lower(trim(p_tag)), p_category, 1)
  ON CONFLICT (provider_id, tag)
  DO UPDATE SET
    usage_count = seeks_and_explore_demo.customer_tags.usage_count + 1,
    updated_at  = now()
  RETURNING * INTO v_result;
  RETURN v_result;
END;
$$;
