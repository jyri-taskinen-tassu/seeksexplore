-- Add position column to sales_opportunities for drag-and-drop ordering within pipeline stages
ALTER TABLE sales_opportunities
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Backfill: assign per-stage positions ordered by created_at
UPDATE sales_opportunities so
SET position = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY stage ORDER BY created_at ASC) - 1 AS rn
  FROM sales_opportunities
) sub
WHERE so.id = sub.id;
