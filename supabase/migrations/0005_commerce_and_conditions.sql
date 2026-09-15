-- Phase 1: sponsored placements (monetisation) and route conditions (safety)

create table sponsored_placements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  destination_id uuid not null references destinations(id) on delete cascade,
  placement_type text not null,
  start_date date not null,
  end_date date not null,
  priority integer not null default 0,
  budget numeric,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index sponsored_placements_active_idx
  on sponsored_placements (destination_id, placement_type, start_date, end_date);

alter table sponsored_placements enable row level security;
-- No public select policy: sponsored placements are read server-side (ranking logic),
-- not exposed directly to the client. Admin/service-role access only.

create type route_condition as enum ('good', 'wet', 'icy', 'snow', 'closed', 'maintenance');

create table route_conditions (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes(id) on delete cascade,
  condition route_condition not null,
  report text,
  reported_at timestamptz not null default now(),
  source text not null default 'destination_admin'
);

create index route_conditions_route_idx on route_conditions (route_id, reported_at desc);

alter table route_conditions enable row level security;

create policy "route conditions are publicly readable"
  on route_conditions for select
  using (true);
