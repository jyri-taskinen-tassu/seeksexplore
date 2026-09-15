import type { Destination, Route, PointOfInterest } from '../types/database';

/**
 * Demo content mirroring /supabase/seed/tahko.sql, used only when Supabase
 * isn't configured (see isSupabaseConfigured in ./supabase.ts) so the app
 * has something to show for early demos/web testing before a live project
 * is linked. Never used once EXPO_PUBLIC_SUPABASE_URL is set.
 */

export const MOCK_DESTINATION: Destination = {
  id: 'mock-tahko',
  name: 'Tahko',
  slug: 'tahko',
  description: 'Tahko outdoor destination — pilot tenant for the platform.',
  logo_url: null,
  primary_domain: null,
  center_lat: 63.1833,
  center_lng: 27.9667,
  default_zoom: 13,
  branding_config: { primaryColor: '#1B4332', accentColor: '#D9A441' },
  status: 'published',
};

export const MOCK_ROUTES: Route[] = [
  {
    id: 'mock-route-1',
    destination_id: MOCK_DESTINATION.id,
    name: 'Tahkovuori Summit Loop',
    slug: 'tahkovuori-summit-loop',
    description: 'A moderate loop to the Tahkovuori summit with viewpoints along the way.',
    activity_type: 'hiking',
    difficulty: 'moderate',
    distance_km: 6.4,
    duration_minutes: 120,
    elevation_gain: 220,
    elevation_loss: 220,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [27.9667, 63.1833],
          [27.97, 63.185],
          [27.973, 63.187],
          [27.9667, 63.1833],
        ],
      ],
    },
    start_location: { lng: 27.9667, lat: 63.1833 },
    end_location: { lng: 27.9667, lat: 63.1833 },
    is_loop: true,
    status: 'published',
    thumbnail_url: null,
  },
  {
    id: 'mock-route-2',
    destination_id: MOCK_DESTINATION.id,
    name: 'Lakeside Gravel Ride',
    slug: 'lakeside-gravel-ride',
    description: 'An easy gravel ride along the lakeshore, great for families.',
    activity_type: 'gravel',
    difficulty: 'easy',
    distance_km: 12.1,
    duration_minutes: 60,
    elevation_gain: 40,
    elevation_loss: 40,
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [27.96, 63.18],
          [27.965, 63.182],
          [27.97, 63.184],
        ],
      ],
    },
    start_location: { lng: 27.96, lat: 63.18 },
    end_location: { lng: 27.97, lat: 63.184 },
    is_loop: false,
    status: 'published',
    thumbnail_url: null,
  },
];

export const MOCK_POIS: PointOfInterest[] = [
  {
    id: 'mock-poi-1',
    destination_id: MOCK_DESTINATION.id,
    name: 'Tahkovuori Viewpoint',
    description: 'Panoramic viewpoint near the summit.',
    category: 'viewpoint',
    location: { lng: 27.973, lat: 63.187 },
    icon: null,
    images: [],
    status: 'published',
  },
  {
    id: 'mock-poi-2',
    destination_id: MOCK_DESTINATION.id,
    name: 'Lakeside Campfire Spot',
    description: 'Public campfire site with firewood shelter.',
    category: 'campfire',
    location: { lng: 27.97, lat: 63.185 },
    icon: null,
    images: [],
    status: 'published',
  },
];
