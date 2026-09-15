import type { GeoPoint } from '../types/database';

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in meters. Fine at trail scale; not for long-range geodesy. */
export function haversineDistanceM(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Perpendicular distance in meters from `point` to the segment a→b. */
function distanceToSegmentM(point: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  // Local equirectangular projection is accurate enough at trail scale
  // (segments a few hundred meters long) and much cheaper than exact
  // geodesic segment math.
  const lat0 = toRad(a.lat);
  const project = (p: GeoPoint) => ({
    x: toRad(p.lng) * Math.cos(lat0) * EARTH_RADIUS_M,
    y: toRad(p.lat) * EARTH_RADIUS_M,
  });

  const pA = project(a);
  const pB = project(b);
  const pP = project(point);

  const abx = pB.x - pA.x;
  const aby = pB.y - pA.y;
  const lenSq = abx * abx + aby * aby;

  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((pP.x - pA.x) * abx + (pP.y - pA.y) * aby) / lenSq));
  const closest = { x: pA.x + t * abx, y: pA.y + t * aby };

  return Math.hypot(pP.x - closest.x, pP.y - closest.y);
}

/**
 * Shortest distance in meters from `userLocation` to a route's geometry
 * (GeoJSON MultiLineString). Used to detect when a user has left the route
 * (see docs/architecture.md §7 — off-route threshold is 50m).
 */
export function distanceFromRoute(
  userLocation: GeoPoint,
  routeGeometry: GeoJSON.MultiLineString,
): number {
  let min = Infinity;

  for (const line of routeGeometry.coordinates) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lngA, latA] = line[i];
      const [lngB, latB] = line[i + 1];
      const d = distanceToSegmentM(userLocation, { lat: latA, lng: lngA }, { lat: latB, lng: lngB });
      if (d < min) min = d;
    }
  }

  return min;
}

export const OFF_ROUTE_THRESHOLD_M = 50;

export function isOffRoute(userLocation: GeoPoint, routeGeometry: GeoJSON.MultiLineString): boolean {
  return distanceFromRoute(userLocation, routeGeometry) > OFF_ROUTE_THRESHOLD_M;
}
