# apps/mobile — Destination Outdoor App

Expo + TypeScript + Expo Router consumer app. See `../../docs/architecture.md`
for the full picture and `../../docs/database-schema.md` for what the app
reads/writes.

## Status: Phase 2 (Map) scaffold

Implemented:

- Expo Router navigation: bottom tabs (Home, Map, Explore, Saved, Profile) +
  a route detail screen (`app/route/[slug].tsx`)
- `MapProvider` abstraction (`src/lib/maps/MapProvider.tsx`) wrapping
  `@maplibre/maplibre-react-native` — screens never import MapLibre directly
- Supabase client + TanStack Query hooks (`src/api/`) reading from the
  `api_routes` / `api_points_of_interest` views (GeoJSON-shaped geometry —
  see `/supabase/migrations/0008_api_geojson_views.sql`)
- Zustand stores for the active destination and (local-first) user location
- `distanceFromRoute` / off-route detection (`src/lib/geo.ts`, 50m threshold
  per docs/architecture.md §7)
- Home → route list → route detail → **START ROUTE** → live position on the
  route: the first end-to-end vertical slice from the project brief

Not implemented yet: search/filters (Explore tab is a placeholder — Phase
3), auth/saved routes (Phase 3+), businesses/nearby services (Phase 4).

## Before you run it

1. Copy `.env.example` to `.env.local` and fill in
   `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` once a
   Supabase project is linked (see `/docs`). Without these the app renders
   but shows "Supabase is not configured yet" instead of content.
2. **MapLibre requires a custom dev client, not Expo Go** — it's a native
   module. Run `npx expo prebuild` then `npx expo run:ios` / `npx expo
   run:android` (or build a dev client via EAS) to see the Map tab and
   route-detail map preview render. `npm start` + Expo Go will run
   everything except those two screens.

## Commands

```bash
npm install
npm run typecheck   # tsc --noEmit
npm start           # Expo Go — everything except MapLibre screens
npx expo prebuild && npx expo run:ios   # full app, including the map
```

## Verified so far (this environment has no iOS/Android simulator)

- `npm run typecheck` — clean
- `npx expo export --platform ios` — bundles cleanly (1700+ modules, no
  errors)

Not verified: actual on-device/simulator rendering. Test on a real device
or simulator before treating any screen as done — a clean bundle proves the
code is wired correctly, not that the UI looks or behaves right.
