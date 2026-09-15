# Destination Outdoor Platform

A multi-tenant destination & outdoor platform: routes, POIs, local businesses,
bookable products, and (later) AI-driven recommendations — one codebase,
many destinations. **Tahko is the first tenant, not a special case.**

This lives inside the `seeksexplore` repository, alongside the existing
marketing/landing page at the repo root (`app/`, unchanged). The platform
code is additive, under `/apps`, `/packages`, `/supabase`, `/docs` — it does
not touch or depend on the landing page.

## Why this exists

The Seeks & Explore landing page targets experience/activity providers.
This platform is the consumer-facing outdoor app (mobile-first) plus the
commerce/admin layer that providers plug into — see
[architecture.md](./architecture.md) for how the two relate (Destination
Layer / Commerce Layer) and how this connects to a future MatkailuHub
booking backend.

## Tech stack

| Layer | Choice |
|---|---|
| Mobile | React Native + Expo + TypeScript + Expo Router |
| State/data | TanStack Query + Zustand |
| Styling | NativeWind |
| Admin web | Next.js + TypeScript (separate app from the landing page) |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Geo | PostGIS |
| Maps | MapLibre GL + OpenStreetMap, behind a `MapProvider` abstraction |
| AI | Provider-abstracted (`AIProvider`: OpenAI / Anthropic), called only from Edge Functions |
| Analytics | PostHog |

## Repo layout

```
/app                    existing Next.js landing page (untouched)
/apps
  /mobile                Expo app — consumer destination app
  /admin                 Next.js admin dashboard
/packages
  /ui                     shared React/React Native components
  /types                  shared TypeScript types (DB row types, API contracts)
  /api                    typed Supabase client + query/mutation hooks
  /maps                   MapProvider abstraction (MapLibre implementation first)
  /database               generated Supabase types, query helpers
  /config                 shared eslint/tsconfig/tailwind config
/supabase
  /migrations             SQL migrations (source of truth for schema)
  /functions              Edge Functions (e.g. ai-recommend-route)
  /seed                   seed data (Tahko pilot)
/docs
  architecture.md         system architecture, multi-tenancy, AI, commerce
  database-schema.md      full schema reference
```

## MVP scope (Phase 1–5 target)

1. Destination (multi-tenant model)
2. Map (MapLibre, routes + POIs)
3. Route list + detail
4. GPS location + basic on-route progress ("you are 40m off the route")
5. POIs
6. Businesses + nearby services
7. Filters (activity, distance, difficulty, duration, features)
8. Search (Postgres full-text; Meilisearch/Typesense later)
9. Admin dashboard (routes/POIs/businesses CRUD)
10. Analytics (PostHog events)

Explicitly **not** in MVP: social features, achievements, turn-by-turn
navigation, offline maps, AI chat, reviews, messaging.

## First end-to-end vertical slice

> User opens the app → sees the destination map → sees routes → opens a
> route → sees route details → taps **START ROUTE** → sees their own
> location on the route.

Everything in Phase 1 (this commit) exists to make that slice buildable:
the database schema and domain architecture come first, UI second.

## Development phases

See [architecture.md](./architecture.md#development-phases) for the full
phase breakdown (Foundation → Map → Routes → Businesses → Admin →
Commercial layer → AI).

## Status

**Phase 1 — Foundation.** This commit adds: architecture docs, full
database schema as SQL migrations, and the monorepo folder skeleton.
No UI code yet, by design (see project instructions: schema and domain
architecture must land before UI work starts).
