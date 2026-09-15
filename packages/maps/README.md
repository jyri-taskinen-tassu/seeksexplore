# packages/maps

The `MapProvider` abstraction (see `../../docs/architecture.md` §4) —
markers, layers, camera, user location, line rendering — implemented first
against MapLibre GL + OpenStreetMap tiles. Screens depend on this
interface, never on MapLibre directly, so the underlying map SDK (e.g.
Mapbox) can be swapped later without touching screen code. Not
implemented yet — this is Phase 2 work.
