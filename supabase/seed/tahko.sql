-- Pilot destination seed data: Tahko
-- Run after migrations, e.g.: supabase db reset (applies migrations then this)
-- or: psql "$DATABASE_URL" -f supabase/seed/tahko.sql

insert into destinations (id, name, slug, description, center_lat, center_lng, default_zoom, branding_config, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'Tahko',
  'tahko',
  'Tahko outdoor destination — pilot tenant for the platform.',
  63.1833, 27.9667, 13,
  '{"primaryColor": "#1B4332", "accentColor": "#D9A441", "logoUrl": null}'::jsonb,
  'published'
)
on conflict (id) do nothing;

insert into routes (destination_id, name, slug, description, activity_type, difficulty, distance_km, duration_minutes, elevation_gain, elevation_loss, geometry, start_location, end_location, is_loop, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'Tahkovuori Summit Loop',
  'tahkovuori-summit-loop',
  'A moderate loop to the Tahkovuori summit with viewpoints along the way.',
  'hiking', 'moderate', 6.4, 120, 220, 220,
  geography(ST_GeomFromText('LINESTRING(27.9667 63.1833, 27.9700 63.1850, 27.9730 63.1870, 27.9667 63.1833)', 4326)),
  geography(ST_GeomFromText('POINT(27.9667 63.1833)', 4326)),
  geography(ST_GeomFromText('POINT(27.9667 63.1833)', 4326)),
  true, 'published'
)
on conflict (destination_id, slug) do nothing;

insert into points_of_interest (destination_id, name, description, category, location, status)
values
  ('00000000-0000-0000-0000-000000000001', 'Tahkovuori Viewpoint', 'Panoramic viewpoint near the summit.', 'viewpoint',
    geography(ST_GeomFromText('POINT(27.9730 63.1870)', 4326)), 'published'),
  ('00000000-0000-0000-0000-000000000001', 'Trailhead Parking', 'Main parking area at the trailhead.', 'parking',
    geography(ST_GeomFromText('POINT(27.9660 63.1830)', 4326)), 'published'),
  ('00000000-0000-0000-0000-000000000001', 'Lakeside Campfire Spot', 'Public campfire site with firewood shelter.', 'campfire',
    geography(ST_GeomFromText('POINT(27.9700 63.1850)', 4326)), 'published')
on conflict do nothing;

insert into businesses (destination_id, name, slug, description, category, location, booking_url, subscription_plan, featured, verified, status)
values (
  '00000000-0000-0000-0000-000000000001',
  'Tahko Bike Rental',
  'tahko-bike-rental',
  'MTB and gravel bike rental at the base of Tahkovuori.',
  'rental',
  geography(ST_GeomFromText('POINT(27.9650 63.1825)', 4326)),
  'https://example.com/book/tahko-bike-rental',
  'basic', true, true, 'published'
)
on conflict (destination_id, slug) do nothing;
