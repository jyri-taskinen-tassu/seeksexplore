import { create } from 'zustand';
import type { Destination } from '../types/database';

interface DestinationState {
  activeDestination: Destination | null;
  setActiveDestination: (destination: Destination) => void;
}

/**
 * The single active destination for this app session/build (see
 * docs/architecture.md §3 — a white-label build is scoped to one
 * destination_id; a multi-destination build would resolve this at launch
 * instead of hardcoding it, which is why it's state and not a constant).
 */
export const useDestinationStore = create<DestinationState>((set) => ({
  activeDestination: null,
  setActiveDestination: (destination) => set({ activeDestination: destination }),
}));
