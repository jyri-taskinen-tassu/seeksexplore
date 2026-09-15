import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PointOfInterest } from '../types/database';

async function fetchPoisForDestination(destinationId: string): Promise<PointOfInterest[]> {
  const { data, error } = await supabase
    .from('api_points_of_interest')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('status', 'published');

  if (error) throw error;
  return data as PointOfInterest[];
}

/**
 * All published POIs for a destination. Fine for a single-destination MVP
 * dataset; once a destination has enough POIs that this is wasteful, switch
 * to a map-bounds or ST_DWithin-scoped RPC instead of adding client-side
 * filtering here (see docs/database-schema.md — the near-route/near-user
 * query patterns are meant to be server-side).
 */
export function usePois(destinationId: string | undefined) {
  return useQuery({
    queryKey: ['pois', destinationId],
    queryFn: () => fetchPoisForDestination(destinationId as string),
    enabled: Boolean(destinationId),
  });
}
