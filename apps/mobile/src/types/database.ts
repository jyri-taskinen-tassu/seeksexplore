// Mirrors /supabase/migrations. Hand-written for MVP; once a live Supabase
// project exists, regenerate with `supabase gen types typescript` and this
// file can be replaced (see ../../../packages/database/README.md).

export type ContentStatus = 'draft' | 'published' | 'archived';

export type ActivityType =
  | 'hiking'
  | 'mtb'
  | 'gravel'
  | 'cycling'
  | 'skiing'
  | 'snowshoeing'
  | 'winter_biking'
  | 'trail_running';

export type Difficulty = 'easy' | 'moderate' | 'difficult';

export type PoiCategory =
  | 'campfire'
  | 'shelter'
  | 'toilet'
  | 'parking'
  | 'viewpoint'
  | 'beach'
  | 'water'
  | 'restaurant'
  | 'cafe'
  | 'rental'
  | 'accommodation'
  | 'attraction'
  | 'shop'
  | 'emergency';

export type BusinessCategory =
  | 'activity_provider'
  | 'restaurant'
  | 'cafe'
  | 'rental'
  | 'accommodation'
  | 'wellness'
  | 'transport'
  | 'shop';

export type RouteCondition = 'good' | 'wet' | 'icy' | 'snow' | 'closed' | 'maintenance';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_domain: string | null;
  center_lat: number | null;
  center_lng: number | null;
  default_zoom: number | null;
  branding_config: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string | null;
    [key: string]: unknown;
  };
  status: ContentStatus;
}

export interface Route {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  description: string | null;
  activity_type: ActivityType;
  difficulty: Difficulty;
  distance_km: number | null;
  duration_minutes: number | null;
  elevation_gain: number | null;
  elevation_loss: number | null;
  /** GeoJSON MultiLineString, as returned by PostGIS `ST_AsGeoJSON`. */
  geometry: GeoJSON.MultiLineString;
  start_location: GeoPoint | null;
  end_location: GeoPoint | null;
  is_loop: boolean;
  status: ContentStatus;
  thumbnail_url: string | null;
}

export interface PointOfInterest {
  id: string;
  destination_id: string;
  name: string;
  description: string | null;
  category: PoiCategory;
  location: GeoPoint;
  icon: string | null;
  images: string[];
  status: ContentStatus;
}

export interface Business {
  id: string;
  destination_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: BusinessCategory;
  location: GeoPoint | null;
  website: string | null;
  booking_url: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  images: string[];
  featured: boolean;
  verified: boolean;
  status: ContentStatus;
}

export interface Product {
  id: string;
  business_id: string;
  destination_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_from: number | null;
  currency: string;
  duration: string | null;
  booking_url: string | null;
  images: string[];
  active: boolean;
}

export interface RouteFilters {
  activityType?: ActivityType;
  difficulty?: Difficulty;
  maxDistanceKm?: number;
  minDistanceKm?: number;
}
