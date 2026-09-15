-- Phase 1: routes

create type activity_type as enum (
  'hiking', 'mtb', 'gravel', 'cycling', 'skiing', 'snowshoeing', 'winter_biking', 'trail_running'
);
create type difficulty as enum ('easy', 'moderate', 'difficult');

create table routes (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  activity_type activity_type not null,
  difficulty difficulty not null,
  distance_km numeric,
  duration_minutes integer,
  elevation_gain integer,
  elevation_loss integer,
  geometry geography(MultiLineString, 4326) not null,
  start_location geography(Point, 4326),
  end_location geography(Point, 4326),
  is_loop boolean not null default false,
  status content_status not null default 'draft',
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, slug)
);

create index routes_destination_filter_idx on routes (destination_id, activity_type, difficulty);
create index routes_geometry_gix on routes using gist (geometry);

create trigger routes_set_updated_at
  before update on routes
  for each row execute function set_updated_at();

alter table routes enable row level security;

create policy "routes are publicly readable when published"
  on routes for select
  using (status = 'published');
