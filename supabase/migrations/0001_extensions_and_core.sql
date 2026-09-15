-- Phase 1: extensions, shared enums, destinations (the multi-tenant root table)

create extension if not exists postgis;
create extension if not exists pg_trgm;

create type content_status as enum ('draft', 'published', 'archived');
create type user_role as enum ('super_admin', 'destination_admin', 'business_admin', 'user');

create table destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  primary_domain text,
  center_lat double precision,
  center_lng double precision,
  default_zoom numeric default 12,
  branding_config jsonb not null default '{}'::jsonb,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

comment on table destinations is 'Tenant root. Every content table hangs off destination_id.';

-- touched_at trigger helper, reused by every admin-editable table
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table destinations enable row level security;

create policy "destinations are publicly readable when published"
  on destinations for select
  using (status = 'published');
