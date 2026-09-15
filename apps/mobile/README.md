# apps/mobile — Destination Outdoor App

Expo + TypeScript + Expo Router consumer app. See `../../docs/architecture.md`
for the full picture and `../../docs/database-schema.md` for what the app
reads/writes.

## Status: Phase 2 (Map) scaffold

Implemented:

- Expo Router navigation: bottom tabs (Home, Map, Explore, Saved, Profile) +
  a route detail screen (`app/route/[slug].tsx`)
- `MapProvider` abstraction — `src/lib/maps/MapProvider.native.tsx` wraps
  `@maplibre/maplibre-react-native` for iOS/Android;
  `MapProvider.web.tsx` is a placeholder for the browser (MapLibre's React
  Native binding is native-only — it crashes on react-native-web). Screens
  import `'../../src/lib/maps/MapProvider'` with no extension; Metro
  resolves the right file per platform.
- Supabase client + TanStack Query hooks (`src/api/`) reading from the
  `api_routes` / `api_points_of_interest` views (GeoJSON-shaped geometry —
  see `/supabase/migrations/0008_api_geojson_views.sql`)
- **Demo mode**: when Supabase isn't configured, every hook falls back to
  fixture data (`src/lib/mockData.ts`, mirroring the Tahko seed) instead of
  an empty/broken screen, with an amber "Demo data" banner on Home/Map so
  it's never mistaken for the real thing. Lets you run and click through
  the app before a Supabase project exists.
- Zustand stores for the active destination (loaded once at the root layout
  — `app/_layout.tsx` — so a deep link straight into `/route/[slug]` works,
  not just navigating there from Home) and (local-first) user location
- `distanceFromRoute` / off-route detection (`src/lib/geo.ts`, 50m threshold
  per docs/architecture.md §7)
- Home → route list → route detail → **START ROUTE** → live position on the
  route: the first end-to-end vertical slice from the project brief

Not implemented yet: search/filters (Explore tab is a placeholder — Phase
3), auth/saved routes (Phase 3+), businesses/nearby services (Phase 4).

## Running it before Apple/Google developer accounts exist

You can run and click through the app in a browser right now — no
Supabase, no Apple/Google account needed:

```bash
npm install
npm start -- --web
```

This runs everything except the two map screens (native-only, see above);
those show a "map preview is in the native app" placeholder instead of
crashing. Demo mode (see above) means Home/route-detail/etc. show populated
fixture content, not empty states, until Supabase is linked.

For the full app including the real map, MapLibre needs a **custom dev
client**, not Expo Go — it's a native module:

```bash
npx expo prebuild && npx expo run:ios      # or run:android
```

`run:ios`/`run:android` still need Xcode/Android Studio locally, but not an
Apple/Google *developer account* — that's only required for TestFlight/Play
builds and store submission, not for running on a simulator or a
USB-connected device.

## Before you connect Supabase

Copy `.env.example` to `.env.local` and fill in
`EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` once a project
is linked (see `/docs`). Until then the app runs in demo mode (above).

## Commands

```bash
npm install
npm run typecheck   # tsc --noEmit
npm start -- --web  # browser — everything except the two map screens
npm start           # Expo Go — same coverage as web
npx expo prebuild && npx expo run:ios   # full app, including the map
```

## Verified so far (this environment has no iOS/Android simulator)

- `npm run typecheck` — clean
- `npx expo export --platform ios` — bundles cleanly (1700+ modules, no
  errors)
- `npx expo export --platform web` — bundles cleanly
- Ran the web build in a headless browser (Playwright) and screenshotted
  Home, Map, Explore, and a route-detail deep link: no console errors, demo
  data renders, the map placeholder shows correctly instead of crashing

Not verified: iOS/Android simulator or device rendering, or the actual
native MapLibre map (web can only prove the placeholder path). Test on a
real device or simulator before treating the Map tab as done.
