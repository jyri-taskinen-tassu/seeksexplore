-- Migration: Add stripe_payment_intent_id to bookings table
-- Schema: seeks_and_explore_demo
-- Applied: 2026-06-24

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
