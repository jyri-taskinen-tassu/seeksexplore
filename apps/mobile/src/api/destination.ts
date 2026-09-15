import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_DESTINATION } from '../lib/mockData';
import type { Destination } from '../types/database';

/**
 * The destination slug for this build. A white-label build pins this at
 * build time; a multi-destination build would resolve it from domain/config
 * at launch instead (see docs/architecture.md §3).
 */
export const ACTIVE_DESTINATION_SLUG = process.env.EXPO_PUBLIC_DESTINATION_SLUG ?? 'tahko';

async function fetchDestination(slug: string): Promise<Destination | null> {
  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as Destination | null;
}

export function useActiveDestination() {
  return useQuery({
    queryKey: ['destination', ACTIVE_DESTINATION_SLUG],
    queryFn: () =>
      isSupabaseConfigured ? fetchDestination(ACTIVE_DESTINATION_SLUG) : Promise.resolve(MOCK_DESTINATION),
  });
}
