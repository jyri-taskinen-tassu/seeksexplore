-- Phase 1: user roles + admin write policies
--
-- profiles.role drives super_admin checks; destination_admins / business_admins
-- map an authenticated user to the scope they may write to.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

create or replace function is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'super_admin'
  );
$$;

create table destination_admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  destination_id uuid not null references destinations(id) on delete cascade,
  primary key (user_id, destination_id)
);

alter table destination_admins enable row level security;

create or replace function is_destination_admin(target_destination_id uuid)
returns boolean
language sql
stable
as $$
  select is_super_admin() or exists (
    select 1 from destination_admins
    where user_id = auth.uid() and destination_id = target_destination_id
  );
$$;

create table business_admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  primary key (user_id, business_id)
);

alter table business_admins enable row level security;

create or replace function is_business_admin(target_business_id uuid)
returns boolean
language sql
stable
as $$
  select is_super_admin() or exists (
    select 1 from business_admins
    where user_id = auth.uid() and business_id = target_business_id
  );
$$;

-- Destination-scoped content: destination_admin (or super_admin) may write.
create policy "destination admins manage destinations"
  on destinations for all
  using (is_destination_admin(id))
  with check (is_destination_admin(id));

create policy "destination admins manage routes"
  on routes for all
  using (is_destination_admin(destination_id))
  with check (is_destination_admin(destination_id));

create policy "destination admins manage POIs"
  on points_of_interest for all
  using (is_destination_admin(destination_id))
  with check (is_destination_admin(destination_id));

create policy "destination admins manage route conditions"
  on route_conditions for insert
  with check (is_destination_admin((select destination_id from routes where id = route_id)));

create policy "destination admins manage sponsored placements"
  on sponsored_placements for all
  using (is_destination_admin(destination_id))
  with check (is_destination_admin(destination_id));

-- Business-scoped content: business_admin (own business) or destination_admin (whole destination).
create policy "business or destination admins manage businesses"
  on businesses for all
  using (is_business_admin(id) or is_destination_admin(destination_id))
  with check (is_business_admin(id) or is_destination_admin(destination_id));

create policy "business or destination admins manage products"
  on products for all
  using (is_business_admin(business_id) or is_destination_admin(destination_id))
  with check (is_business_admin(business_id) or is_destination_admin(destination_id));
