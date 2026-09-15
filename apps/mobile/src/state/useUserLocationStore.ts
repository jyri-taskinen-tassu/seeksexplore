import { create } from 'zustand';
import type { GeoPoint } from '../types/database';

interface UserLocationState {
  location: (GeoPoint & { heading: number | null; accuracy: number | null }) | null;
  followUser: boolean;
  setLocation: (location: UserLocationState['location']) => void;
  setFollowUser: (follow: boolean) => void;
}

/**
 * Local-first per docs/architecture.md §7/§11 — the user's live location is
 * never streamed to the server in MVP, it only lives here for map rendering
 * and the off-route check.
 */
export const useUserLocationStore = create<UserLocationState>((set) => ({
  location: null,
  followUser: true,
  setLocation: (location) => set({ location }),
  setFollowUser: (follow) => set({ followUser: follow }),
}));
