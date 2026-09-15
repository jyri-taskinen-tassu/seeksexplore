import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Route, RouteFilters } from '../types/database';

async function fetchRoutes(destinationId: string, filters: RouteFilters): Promise<Route[]> {
  let query = supabase
    .from('api_routes')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('status', 'published');

  if (filters.activityType) query = query.eq('activity_type', filters.activityType);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.minDistanceKm != null) query = query.gte('distance_km', filters.minDistanceKm);
  if (filters.maxDistanceKm != null) query = query.lte('distance_km', filters.maxDistanceKm);

  const { data, error } = await query.order('name');
  if (error) throw error;
  return data as Route[];
}

export function useRoutes(destinationId: string | undefined, filters: RouteFilters = {}) {
  return useQuery({
    queryKey: ['routes', destinationId, filters],
    queryFn: () => fetchRoutes(destinationId as string, filters),
    enabled: Boolean(destinationId),
  });
}

async function fetchRouteBySlug(destinationId: string, slug: string): Promise<Route | null> {
  const { data, error } = await supabase
    .from('api_routes')
    .select('*')
    .eq('destination_id', destinationId)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as Route | null;
}

export function useRoute(destinationId: string | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ['route', destinationId, slug],
    queryFn: () => fetchRouteBySlug(destinationId as string, slug as string),
    enabled: Boolean(destinationId && slug),
  });
}
