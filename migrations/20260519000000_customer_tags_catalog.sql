CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS customer_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  tag text NOT NULL,
  category text NOT NULL DEFAULT 'Custom',
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT customer_tags_provider_tag_unique UNIQUE (provider_id, tag)
);

CREATE INDEX IF NOT EXISTS customer_tags_provider_id_idx
  ON customer_tags (provider_id);

CREATE INDEX IF NOT EXISTS customer_tags_tag_trgm_idx
  ON customer_tags USING gin (tag gin_trgm_ops);

-- RPC: upsert a tag into the catalog (creates if new, increments usage_count if exists)
CREATE OR REPLACE FUNCTION upsert_customer_tag(
  p_provider_id uuid,
  p_tag text,
  p_category text DEFAULT 'Custom'
)
RETURNS customer_tags
LANGUAGE plpgsql
AS $$
DECLARE
  result customer_tags;
BEGIN
  INSERT INTO customer_tags (provider_id, tag, category, usage_count)
  VALUES (p_provider_id, lower(trim(p_tag)), p_category, 1)
  ON CONFLICT (provider_id, tag) DO UPDATE
    SET usage_count = customer_tags.usage_count + 1,
        category    = EXCLUDED.category
  RETURNING * INTO result;
  RETURN result;
END;
$$;

-- RPC: search tags by query, grouped by category
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "provider_all_customer_tags"
  ON customer_tags
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM provider_users pu
    WHERE pu.provider_id = customer_tags.provider_id AND pu.profile_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM provider_users pu
    WHERE pu.provider_id = customer_tags.provider_id AND pu.profile_id = auth.uid()
  ));

DROP FUNCTION IF EXISTS search_customer_tags(uuid, text);

CREATE OR REPLACE FUNCTION search_customer_tags(
  p_provider_id uuid,
  p_query text DEFAULT ''
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(grp ORDER BY grp->>'category')
  INTO result
  FROM (
    SELECT json_build_object(
      'category', category,
      'tags', json_agg(
        json_build_object('id', id, 'tag', tag, 'category', category, 'usage_count', usage_count)
        ORDER BY usage_count DESC, tag
      )
    ) AS grp
    FROM customer_tags
    WHERE provider_id = p_provider_id
      AND (p_query = '' OR tag ILIKE '%' || lower(trim(p_query)) || '%')
    GROUP BY category
  ) sub;

  RETURN COALESCE(result, '[]'::json);
END;
$$;
