import React from 'react';
import { View, Text } from 'react-native';
import type { GeoPoint } from '../../types/database';

/**
 * Web fallback for the MapProvider seam (see MapProvider.native.tsx).
 * @maplibre/maplibre-react-native is native-only — it calls
 * codegenNativeComponent at import time, which throws immediately on
 * react-native-web instead of just failing to render. Metro resolves this
 * file instead of MapProvider.native.tsx when bundling for web (platform
 * extension resolution), so the rest of the app (Home, Explore, route
 * details minus the map preview) stays usable in a browser for early demos,
 * per docs/architecture.md — the real map only renders in the native app.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

function Placeholder({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-4">
      <Text className="text-center text-gray-500">{label}</Text>
    </View>
  );
}

export function MapView({ style }: { children?: React.ReactNode; style?: object }) {
  return (
    <View style={style ?? { flex: 1 }}>
      <Placeholder label="Map preview is available in the iOS/Android app (MapLibre is a native module)." />
    </View>
  );
}

export function MapCamera(_props: { center?: GeoPoint; zoomLevel?: number; followUser?: boolean }) {
  return null;
}

export function UserLocationMarker() {
  return null;
}

export function RouteLine(_props: { id: string; geometry: GeoJSON.MultiLineString; color?: string; widthPx?: number }) {
  return null;
}

export function PoiMarker(_props: { id: string; location: GeoPoint; onPress?: () => void; children: React.ReactElement }) {
  return null;
}
