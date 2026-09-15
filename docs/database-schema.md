# Database schema

Source of truth is the SQL under `/supabase/migrations`. This document is
the human-readable reference — keep it in sync when migrations change.
All tables live in `public` unless noted. PostGIS extension required.

## Conventions

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz default now()`, `updated_at timestamptz default now()` (touched by trigger where the table is admin-editable)
- Every content table has `destination_id uuid references destinations(id)` — the multi-tenancy key.
- `status` columns use a `content_status` enum (`draft`, `published`, `archived`) unless noted.
- Geo columns use `geography(...)` (not bare `geometry`) so distance/`ST_DWithin` queries are in meters without manual SRID math.

## `destinations`

The tenant table. Everything else hangs off `destination_id`.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text | |
| slug | text unique | e.g. `tahko` |
| description | text | |
| logo_url | text | |
| primary_domain | text | for white-label / domain-based resolution |
| center_lat, center_lng | double precision | map default camera |
| default_zoom | numeric | |
| branding_config | jsonb | logo, fonts, colors, splash, map defaults |
| status | content_status | |
| created_at | timestamptz | |

## `routes`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| destination_id | uuid fk | |
| name | text | |
| slug | text | unique per destination |
| description | text | |
| activity_type | activity_type enum | hiking, mtb, gravel, cycling, skiing, snowshoeing, winter_biking, trail_running |
| difficulty | difficulty enum | easy, moderate, difficult |
| distance_km | numeric | |
| duration_minutes | integer | |
| elevation_gain | integer | meters |
| elevation_loss | integer | meters |
| geometry | geography(LineString) or geography(MultiLineString) | the route line |
| start_location | geography(Point) | |
| end_location | geography(Point) | |
| is_loop | boolean | |
| status | content_status | |
| thumbnail_url | text | |
| created_at, updated_at | timestamptz | |

`activity_type` and `difficulty` power the filter UI directly (§Filters in
architecture.md). Index `(destination_id, activity_type, difficulty)` for
the common filter query, plus a GiST index on `geometry` for map-bounds and
near-me queries.

### `route_points` (optional, not in MVP migration)

Only needed if a route needs per-point metadata (elevation profile beyond
what a line-string simplification gives you). Deferred until a real need
appears — `routes.geometry` is sufficient for MVP rendering and distance
checks.

## `points_of_interest`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| destination_id | uuid fk | |
| name | text | |
| description | text | |
| category | poi_category enum | campfire, shelter, toilet, parking, viewpoint, beach, water, restaurant, cafe, rental, accommodation, attraction, shop, emergency |
| location | geography(Point) | |
| icon | text | |
| images | text[] | |
| opening_hours | jsonb | |
| metadata | jsonb | |
| status | content_status | |

Query patterns to support (all via PostGIS, never client-side filtering of
a full table):
- within map bounds → `ST_Intersects(location, bounds_polygon)` or a
  bbox index query
- near a route → `ST_DWithin(location, route.geometry, radius_m)`
- near the user → `ST_DWithin(location, user_point, radius_m)` ordered by
  `ST_Distance`

GiST index on `location` is required, not optional — this table is read on
every map pan.

## `businesses`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| destination_id | uuid fk | |
| name | text | |
| slug | text | |
| description | text | |
| category | business_category enum | activity_provider, restaurant, cafe, rental, accommodation, wellness, transport, shop |
| location | geography(Point) | |
| website, booking_url, phone, email | text | |
| logo_url | text | |
| images | text[] | |
| opening_hours | jsonb | |
| featured | boolean | |
| verified | boolean | |
| subscription_plan | subscription_plan enum | free, basic, pro, premium — see §Commerce |
| metadata | jsonb | |
| status | content_status | |

## `products`

Experiences/services a business offers. Kept intentionally thin — this is
the local cache; a real booking flow is expected to move to MatkailuHub
(see architecture.md §9) without this table's shape changing much.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| business_id | uuid fk → businesses | |
| destination_id | uuid fk | denormalized for direct destination-scoped queries |
| name | text | |
| description | text | |
| category | text | free-form initially; consider an enum once real data exists |
| price_from | numeric | |
| currency | text | ISO 4217, e.g. `EUR` |
| duration | text | free-text or interval — display string, not computed |
| booking_url | text | MVP booking path |
| external_booking_provider | text | e.g. `matkailuhub` |
| external_product_id | text | id in the external system, once integrated |
| images | text[] | |
| active | boolean | |

Used for "services near this route" and "recommended after this route"
surfaces (architecture.md §8).

## Commerce

### `businesses.subscription_plan`

`free | basic | pro | premium` — drives what a business gets shown as
(featured placement eligibility, number of products, etc.) without needing
a separate billing table in MVP.

### `sponsored_placements`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| business_id | uuid fk | |
| destination_id | uuid fk | |
| placement_type | text | e.g. `route_nearby`, `featured_rental`, `recommended_activity` |
| start_date, end_date | date | |
| priority | integer | higher wins ties in ranking |
| budget | numeric | reporting/ops field, not enforced by app logic in MVP |

Ranking for "nearby services" = `distance × category relevance ×
sponsorship (this table) × availability`. Sponsorship is one input, not an
override — a sponsored business still has to be relevant.

## `route_conditions`

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| route_id | uuid fk → routes | |
| condition | route_condition enum | good, wet, icy, snow, closed, maintenance |
| report | text | free-text note |
| reported_at | timestamptz | |
| source | text | e.g. `destination_admin`, later `crowdsource` |

MVP: destination admins update this. Crowdsourced reporting (§28 of the
project brief) is a later phase — the schema already supports a `source`
value for it so no migration is needed when that ships.

## Search

MVP uses Postgres full-text search (a `tsvector` generated column /
trigger on `routes.name + description`, `businesses.name + description`,
`points_of_interest.name + description`) rather than a separate search
service. Meilisearch/Typesense is a deliberate later swap, not a day-one
dependency.

## Row Level Security

- All content tables: public `select` where `status = 'published'`.
- Admin writes: `destination_admin` may write rows where
  `destination_id` matches their assigned destination (via a
  `destination_admins` mapping — see `0006_rls_policies.sql`);
  `business_admin` may write their own `businesses`/`products` rows;
  `super_admin` bypasses via a role check.
- No table grants `insert`/`update`/`delete` to `anon`.

## Enums summary

| enum | values |
|---|---|
| `content_status` | draft, published, archived |
| `activity_type` | hiking, mtb, gravel, cycling, skiing, snowshoeing, winter_biking, trail_running |
| `difficulty` | easy, moderate, difficult |
| `poi_category` | campfire, shelter, toilet, parking, viewpoint, beach, water, restaurant, cafe, rental, accommodation, attraction, shop, emergency |
| `business_category` | activity_provider, restaurant, cafe, rental, accommodation, wellness, transport, shop |
| `subscription_plan` | free, basic, pro, premium |
| `route_condition` | good, wet, icy, snow, closed, maintenance |
| `user_role` | super_admin, destination_admin, business_admin, user |
