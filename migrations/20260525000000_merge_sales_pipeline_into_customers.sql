-- Migration: Merge sales_opportunities into customers table
-- Schema: seeks_and_explore_demo
-- Applied: 2026-05-25

-- 1. Add pipeline columns to customers table
ALTER TABLE seeks_and_explore_demo.customers
ADD COLUMN IF NOT EXISTS pipeline_stage text NOT NULL DEFAULT 'inquiry' CHECK (pipeline_stage IN ('inquiry', 'quoted', 'followup', 'booked', 'completed')),
ADD COLUMN IF NOT EXISTS pipeline_estimated_value numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_guests integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS pipeline_preferred_date date,
ADD COLUMN IF NOT EXISTS pipeline_notes text,
ADD COLUMN IF NOT EXISTS pipeline_position integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_product_name text;

-- 2. Migrate data from sales_opportunities to customers
-- Note: We check if the table exists first to make the migration idempotent
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'seeks_and_explore_demo' AND table_name = 'sales_opportunities') THEN
    UPDATE seeks_and_explore_demo.customers c
    SET
      pipeline_stage = so.stage,
      pipeline_estimated_value = so.estimated_value,
      pipeline_guests = so.guests,
      pipeline_preferred_date = so.preferred_date,
      pipeline_notes = so.notes,
      pipeline_position = so.position,
      pipeline_product_name = so.product_name
    FROM seeks_and_explore_demo.sales_opportunities so
    WHERE c.id = so.customer_id;

    -- 3. Drop the sales_opportunities table
    DROP TABLE seeks_and_explore_demo.sales_opportunities;
  END IF;
END $$;
