import React from 'react';
import { Map, Camera, UserLocation, GeoJSONSource, Layer, Marker } from '@maplibre/maplibre-react-native';
import type { GeoPoint } from '../../types/database';

/**
 * Everything screens need from "the map" goes through this module — never
 * import @maplibre/maplibre-react-native directly outside this file. That
 * keeps the map SDK swappable (see docs/architecture.md §4) behind a single
 * seam: <MapView>, <MapCamera>, <UserLocationMarker>, <RouteLine>, <PoiMarker>.
 *
 * MapLibre ships no default tile style — a style URL must be configured.
 * MAP_STYLE_URL below points at OpenFreeMap's public "liberty" style
 * (OSM-based, no API key required) as a working default; swap for a
 * self-hosted or destination-specific style before production launch.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export function MapView({ children, style }: { children?: React.ReactNode; style?: object }) {
  return (
    <Map mapStyle={MAP_STYLE_URL} style={style ?? { flex: 1 }}>
      {children}
    </Map>
  );
}

export function MapCamera({
  center,
  zoomLevel = 13,
  followUser = false,
}: {
  center?: GeoPoint;
  zoomLevel?: number;
  followUser?: boolean;
}) {
  return (
    <Camera
      center={center ? [center.lng, center.lat] : undefined}
      zoom={zoomLevel}
      trackUserLocation={followUser ? 'default' : undefined}
      easing="fly"
    />
  );
}

export function UserLocationMarker() {
  return <UserLocation animated accuracy />;
}

export function RouteLine({
  id,
  geometry,
  color = '#1B4332',
  widthPx = 4,
}: {
  id: string;
  geometry: GeoJSON.MultiLineString;
  color?: string;
  widthPx?: number;
}) {
  return (
    <GeoJSONSource id={`route-source-${id}`} data={geometry}>
      <Layer
        id={`route-line-${id}`}
        type="line"
        source={`route-source-${id}`}
        layout={{ 'line-cap': 'round', 'line-join': 'round' }}
        paint={{ 'line-color': color, 'line-width': widthPx }}
      />
    </GeoJSONSource>
  );
}

export function PoiMarker({
  id,
  location,
  onPress,
  children,
}: {
  id: string;
  location: GeoPoint;
  onPress?: () => void;
  children: React.ReactElement;
}) {
  return (
    <Marker id={id} lngLat={[location.lng, location.lat]} onPress={onPress}>
      {children}
    </Marker>
  );
}
