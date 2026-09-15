-- Phase 1: businesses and products (destination + commerce layers)

create type business_category as enum (
  'activity_provider', 'restaurant', 'cafe', 'rental', 'accommodation', 'wellness', 'transport', 'shop'
);
create type subscription_plan as enum ('free', 'basic', 'pro', 'premium');

create table businesses (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  category business_category not null,
  location geography(Point, 4326),
  website text,
  booking_url text,
  phone text,
  email text,
  logo_url text,
  images text[] not null default '{}',
  opening_hours jsonb,
  featured boolean not null default false,
  verified boolean not null default false,
  subscription_plan subscription_plan not null default 'free',
  metadata jsonb not null default '{}'::jsonb,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (destination_id, slug)
);

create index businesses_destination_category_idx on businesses (destination_id, category);
create index businesses_location_gix on businesses using gist (location);

create trigger businesses_set_updated_at
  before update on businesses
  for each row execute function set_updated_at();

alter table businesses enable row level security;

create policy "businesses are publicly readable when published"
  on businesses for select
  using (status = 'published');

create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  description text,
  category text,
  price_from numeric,
  currency text default 'EUR',
  duration text,
  booking_url text,
  external_booking_provider text,
  external_product_id text,
  images text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_business_idx on products (business_id);
create index products_destination_active_idx on products (destination_id, active);

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

alter table products enable row level security;

create policy "products are publicly readable when active"
  on products for select
  using (active = true);
