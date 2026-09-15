# Architecture — Destination Outdoor Platform

## 1. Core principle

This is not a Tahko app. It is a **destination outdoor platform**; Tahko is
the first tenant. Every table, every abstraction, every UI screen must work
for a second and third destination (Koli, Ruka, Levi, Saariselkä, ...)
without a code fork — new destinations are added primarily through database
configuration (a `destinations` row + branding config), not new code.

## 2. High-level system

```
Mobile App (Expo / React Native)
        │
        ▼
Supabase (Auth, Postgres+PostGIS, Storage, Edge Functions)
        │
        ▼
Content: Destinations, Routes, POIs, Businesses
        │
        ▼
Commerce Layer (Products, Sponsored Placements)
        │
        ▼
Booking integrations (external link → MatkailuHub API later)
        │
        ▼
AI Recommendation Layer (Edge Function, provider-abstracted)
```

Admin dashboard (Next.js) talks to the same Supabase project, scoped by
role (see §6).

## 3. Multi-tenancy

Every content table carries `destination_id`. There is exactly one
Supabase project / schema serving all destinations; tenancy is a foreign
key + Row Level Security, not separate databases or separate deployments.

`destinations.branding_config` (jsonb) carries logo, fonts, colors, splash
screen, map center/zoom defaults — the app reads this at boot to
"skin" itself for the active destination. The active destination is
resolved from app config / domain at launch (white-label builds map one
Expo app build to one `destination_id` + branding bundle; the admin and API
stay destination-agnostic).

Adding "Koli" as a tenant = insert one `destinations` row + branding
config + content rows. No new app build is strictly required if the app
supports destination switching; a dedicated white-label build is a
packaging choice, not an architecture requirement.

## 4. Map abstraction

`MapProvider` is an interface in `packages/maps` wrapping the map SDK
(markers, layers, camera, user location, line rendering). The first (only)
implementation is MapLibre GL + OpenStreetMap tiles. Screens and business
logic depend on `MapProvider`, never on MapLibre directly, so Mapbox (or
another provider) can be swapped in later without touching screen code.

## 5. Data layer

- Postgres via Supabase, PostGIS for all geo data.
- `routes.geometry`: `LineString`/`MultiLineString` (PostGIS `geometry` or
  `geography` type — see database-schema.md for the concrete choice per
  column).
- `points_of_interest.location`, `businesses.location`: PostGIS `Point`.
- Proximity queries (POIs near a route, businesses near the user) use
  PostGIS `ST_DWithin` / `ST_Distance` — never client-side haversine over
  full table scans.
- RLS: public read for published content (`status = 'published'`),
  writes gated by role (§6). No table is writable by the anonymous/public
  role.

## 6. Roles & auth

Supabase Auth. Roles: `super_admin` (platform), `destination_admin` (one
destination), `business_admin` (one business), `user` (consumer, optional).

The consumer app **must work fully without login** in MVP — routes, map,
POIs, businesses, search, filters are all public reads. Auth is only
required for: admin dashboards, and later for favourites/saved
routes/reviews.

## 7. Route tracking (MVP scope)

No turn-by-turn navigation in v1. What ships:

- show user location (Expo Location, local-first — not streamed to the
  server in MVP)
- show the route geometry
- show progress along the route and remaining distance
- `distanceFromRoute(userLocation, routeGeometry)` — if the user is more
  than 50m from the route line, surface "You've left the route."

This is intentionally the smallest useful version of navigation; full
turn-by-turn is a later phase, not MVP.

## 8. Commerce layer

Businesses and products are first-class content, scoped to a destination.
Relevance for "services near this route/POI" is computed from:
`distance` × `category relevance` × `sponsorship` × `availability`
(AI-based ranking is a later phase, not MVP). Monetisation hooks
(`businesses.subscription_plan`, `sponsored_placements`) exist in the
schema from day one so pricing/packaging work doesn't require a schema
migration later — see database-schema.md §Commerce.

## 9. MatkailuHub integration (future)

The platform must not assume all commercial data lives in its own
database. `businesses`/`products` are the local cache/source of truth for
MVP; the architecture allows a later swap or augmentation where
`products`/`availability`/`bookings` are served by a MatkailuHub API
instead:

```
Destination App (consumer)
        │
        ▼
MatkailuHub API — businesses / products / availability / bookings
```

MVP booking is simply `business.booking_url` (external link). Booking API
integration and Stripe/payment flow are later phases — do not build them
into MVP.

## 10. AI recommendation layer

AI is **not** a load-bearing MVP dependency — the app must be fully usable
with zero AI calls. When built (Phase 7), it is a separate service, not
logic embedded in the mobile client:

```
Mobile → Supabase Edge Function → LLM API → response
```

- The LLM never invents routes. Pipeline: user query → filter real routes
  from the database (destination, activity, duration, difficulty,
  features) → retrieval → LLM ranks/explains from that candidate set →
  response references only existing `route_id`s.
- `AIProvider` interface in the Edge Function with `OpenAIProvider` /
  `AnthropicProvider` implementations, so the model can change without
  touching call sites.
- API keys live only in Edge Function environment, never in the client.

## 11. Weather & safety

`WeatherProvider` abstraction (OpenWeather / WeatherAPI first, Foreca
later) — same pattern as `MapProvider` and `AIProvider`: an interface in
the shared layer, one concrete implementation to start.

Safety is a product requirement, not just a legal footnote: route detail
screens show a standard disclaimer (conditions change, user is responsible
for their own safety, weather can change). `route_conditions` (see
database-schema.md) lets destination admins flag a route `wet` / `icy` /
`snow` / `closed` / `maintenance`; crowdsourced reporting is a later
phase. An emergency-info screen (GPS coordinates, local emergency number,
nearest trailhead/road) is a later phase, not MVP, but the location data
it needs is already available from Expo Location.

## 12. Analytics

PostHog. Every funnel-relevant action is an event:
`app_open`, `map_open`, `route_view`, `route_start`, `route_complete`,
`business_view`, `booking_click`, `product_view`, `search`, `ai_query`.
These are the events product/commercial decisions (§8, §9) will be made
from, so they ship from Phase 1 of the *app* work, not bolted on later.

## 13. Coding principles

- TypeScript strict mode, no unexplained `any`.
- Feature-based structure inside each app; business logic separated from
  UI; API access separated from components.
- Zod validation at every API boundary (Edge Functions, admin API routes).
- All schema changes are migrations under `/supabase/migrations` — never
  hand-edited in the Supabase dashboard for anything beyond local
  experimentation.
- Centralized error handling and logging (shared helper in
  `packages/config`, not ad hoc per screen).

## 14. Development phases

1. **Foundation** — monorepo, Expo project, Next.js admin, Supabase,
   database schema, auth, destination model. *(this commit covers the
   schema/docs/skeleton portion of this phase)*
2. **Map** — MapLibre, user location, routes, POIs, map filters.
3. **Routes** — list, detail, start route, progress tracking, off-route
   warning.
4. **Businesses** — businesses, services, nearby recommendations, booking
   links.
5. **Admin** — routes/POI/business CRUD, destination settings.
6. **Commercial layer** — paid business tiers, sponsored placement,
   analytics, conversion tracking.
7. **AI** — natural language route search, AI route recommendation, AI
   destination guide.

## 15. Commercial vision (why the layering matters)

```
Outdoor Layer        Routes, Maps, POIs, Navigation
        │
        ▼
Destination Layer     Businesses, Activities, Restaurants, Accommodation, Events
        │
        ▼
Commerce Layer         Availability, Bookings, Payments, Recommendations, AI, Marketplace
```

The long-term product goal: a user finds *where to go* → *what to do* →
*what to buy* → and can buy it in the same app. Every architectural choice
above (multi-tenancy, commerce schema from day one, MatkailuHub-shaped
integration seam, AI as an add-on not a dependency) exists to make that
path reachable without a rewrite.
