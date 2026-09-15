-- Phase 1: points of interest

create type poi_category as enum (
  'campfire', 'shelter', 'toilet', 'parking', 'viewpoint', 'beach', 'water',
  'restaurant', 'cafe', 'rental', 'accommodation', 'attraction', 'shop', 'emergency'
);

create table points_of_interest (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  description text,
  category poi_category not null,
  location geography(Point, 4326) not null,
  icon text,
  images text[] not null default '{}',
  opening_hours jsonb,
  metadata jsonb not null default '{}'::jsonb,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index poi_destination_category_idx on points_of_interest (destination_id, category);
create index poi_location_gix on points_of_interest using gist (location);

create trigger poi_set_updated_at
  before update on points_of_interest
  for each row execute function set_updated_at();

alter table points_of_interest enable row level security;

create policy "POIs are publicly readable when published"
  on points_of_interest for select
  using (status = 'published');
