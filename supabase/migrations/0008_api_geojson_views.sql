-- API-facing views: expose PostGIS geography columns as GeoJSON so the
-- mobile/admin clients can consume them directly over PostgREST without a
-- client-side WKB parser. security_invoker means each view runs with the
-- caller's privileges, so it inherits the base table's RLS policies rather
-- than needing its own.

create view api_routes
  with (security_invoker = true) as
select
  id,
  destination_id,
  name,
  slug,
  description,
  activity_type,
  difficulty,
  distance_km,
  duration_minutes,
  elevation_gain,
  elevation_loss,
  ST_AsGeoJSON(geometry)::json as geometry,
  ST_AsGeoJSON(start_location)::json as start_location,
  ST_AsGeoJSON(end_location)::json as end_location,
  is_loop,
  status,
  thumbnail_url
from routes;

create view api_points_of_interest
  with (security_invoker = true) as
select
  id,
  destination_id,
  name,
  description,
  category,
  ST_AsGeoJSON(location)::json as location,
  icon,
  images,
  opening_hours,
  status
from points_of_interest;

create view api_businesses
  with (security_invoker = true) as
select
  id,
  destination_id,
  name,
  slug,
  description,
  category,
  ST_AsGeoJSON(location)::json as location,
  website,
  booking_url,
  phone,
  email,
  logo_url,
  images,
  opening_hours,
  featured,
  verified,
  status
from businesses;
