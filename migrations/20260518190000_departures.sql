-- Migration: departures table DDL baseline
-- Schema: seeks_and_explore_demo
-- Applied: 2026-05-18
-- Note: Table already exists in production with 40 seeded rows.
-- This file records the DDL for repo history.

CREATE TABLE IF NOT EXISTS departures (
  id               uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id      uuid        NOT NULL,
  product_id       uuid,
  title            text        NOT NULL,
  departure_date   date        NOT NULL,
  start_time       time        NOT NULL,
  duration_minutes integer,
  guest_capacity   integer,
  guests_booked    integer     NOT NULL DEFAULT 0,
  status           text        NOT NULL DEFAULT 'scheduled',
  guide_name       text,
  notes            text,
  resources        jsonb       NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Index for provider+date range queries
CREATE INDEX IF NOT EXISTS departures_provider_date_idx
  ON departures (provider_id, departure_date);

-- Resource JSONB shape (for reference):
-- {
--   "snowmobiles": { "sport_1seat": 2, "sport_2seat": 1, "touring_1seat": 2, "touring_2seat": 3 },
--   "ebikes":      { "standard": 5 },
--   "guides":      2
-- }
