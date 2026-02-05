"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

/**
 * Product Draft Store
 * Centralized state management for product drafts across provider routes.
 * Uses React Context + reducer pattern (no external dependencies).
 */

// Types
export type PricingTier = {
  id: string;
  label: string;
  price: number;
};

export type ResourceRule = {
  id: string;
  resourceType: "snowmobiles" | "ebikes" | "guides_only" | "other";
  variantId?: string; // ID from resource inventory
  variantLabel?: string;
  capacityPerUnit: number;
  unitsPerBooking?: number; // Required units per booking (MVP: use this)
  requiredUnitsPerBooking?: number; // Alias for unitsPerBooking for clarity
};

export type ProductDraft = {
  // Basic fields (required by user)
  title: string;
  shortDescription: string;
  description: string;
  location: string;
  durationMinutes: number | null;
  meetingPoint: string;

  // Extended fields (for compatibility with existing pages)
  categoryMain: "Outdoor" | "Indoor" | "";
  categorySub: string;
  locationName: string;
  address: string;
  priceFrom: number | null;
  currency: "EUR" | "SEK" | "NOK" | "DKK";
  capacityMode: "per_departure" | "per_resource";
  capacityMax: number | null;
  language: string[];
  included: string;
  notIncluded: string;
  requirements: string;
  cancellationPolicyTemplate: "Flexible" | "Standard" | "Strict" | "";
  coverImageNote: string;
  availabilityRule: string;
  resourcesNote: string;

  // Resources (optional)
  requiresResources: boolean;
  resourceType?: "snowmobiles" | "ebikes" | "guides_only" | "other";
  snowmobiles?: {
    sport: { total: number; outOfService: number };
    touring: { total: number; outOfService: number };
  };
  ebikes?: {
    sizes: Record<"S" | "M" | "L" | "XL" | "XXL", { total: number; outOfService: number }>;
  };
  guidesPerDeparture?: number;

  // Pricing (new structure)
  pricingTiers: PricingTier[];

  // Legacy pricing (for compatibility)
  pricingOptions?: Array<{ id: string; name: string; price: number; consumesResource?: "snowmobile" | "guide"; variant?: "sport" | "touring" }>;
  exampleBooking?: Record<string, number>;

  // Resource rules (new structure)
  resourceRules: ResourceRule[];
};

// Store state
type ProductDraftState = {
  draft: ProductDraft;
};

// Actions
type ProductDraftAction =
  | { type: "SET_FIELD"; key: keyof ProductDraft; value: any }
  | { type: "SET_DRAFT"; partial: Partial<ProductDraft> }
  | { type: "RESET_DRAFT" }
  | { type: "ADD_PRICING_TIER"; tier: PricingTier }
  | { type: "UPDATE_PRICING_TIER"; id: string; updates: Partial<PricingTier> }
  | { type: "REMOVE_PRICING_TIER"; id: string }
  | { type: "ADD_RESOURCE_RULE"; rule: ResourceRule }
  | { type: "UPDATE_RESOURCE_RULE"; id: string; updates: Partial<ResourceRule> }
  | { type: "REMOVE_RESOURCE_RULE"; id: string };

// Initial draft
const INITIAL_DRAFT: ProductDraft = {
  title: "",
  shortDescription: "",
  description: "",
  location: "",
  durationMinutes: null,
  meetingPoint: "",
  categoryMain: "",
  categorySub: "",
  locationName: "",
  address: "",
  priceFrom: null,
  currency: "EUR",
  capacityMode: "per_departure",
  capacityMax: null,
  language: ["FI", "EN"],
  included: "",
  notIncluded: "",
  requirements: "",
  cancellationPolicyTemplate: "",
  coverImageNote: "",
  availabilityRule: "Fixed departures (MVP) — you can add times after publishing.",
  resourcesNote: "MVP: attach resources later in Availability/Departures (guides, snowmobiles, e-bikes).",
  requiresResources: false,
  pricingTiers: [],
  pricingOptions: [],
  resourceRules: [],
};

// Reducer
function productDraftReducer(
  state: ProductDraftState,
  action: ProductDraftAction
): ProductDraftState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        draft: {
          ...state.draft,
          [action.key]: action.value,
        },
      };

    case "SET_DRAFT":
      return {
        ...state,
        draft: {
          ...state.draft,
          ...action.partial,
        },
      };

    case "RESET_DRAFT":
      return {
        draft: INITIAL_DRAFT,
      };

    case "ADD_PRICING_TIER":
      return {
        ...state,
        draft: {
          ...state.draft,
          pricingTiers: [...state.draft.pricingTiers, action.tier],
        },
      };

    case "UPDATE_PRICING_TIER":
      return {
        ...state,
        draft: {
          ...state.draft,
          pricingTiers: state.draft.pricingTiers.map((tier) =>
            tier.id === action.id ? { ...tier, ...action.updates } : tier
          ),
        },
      };

    case "REMOVE_PRICING_TIER":
      return {
        ...state,
        draft: {
          ...state.draft,
          pricingTiers: state.draft.pricingTiers.filter((tier) => tier.id !== action.id),
        },
      };

    case "ADD_RESOURCE_RULE":
      return {
        ...state,
        draft: {
          ...state.draft,
          resourceRules: [...state.draft.resourceRules, action.rule],
        },
      };

    case "UPDATE_RESOURCE_RULE":
      return {
        ...state,
        draft: {
          ...state.draft,
          resourceRules: state.draft.resourceRules.map((rule) =>
            rule.id === action.id ? { ...rule, ...action.updates } : rule
          ),
        },
      };

    case "REMOVE_RESOURCE_RULE":
      return {
        ...state,
        draft: {
          ...state.draft,
          resourceRules: state.draft.resourceRules.filter((rule) => rule.id !== action.id),
        },
      };

    default:
      return state;
  }
}

// Context
type ProductDraftContextType = {
  draft: ProductDraft;
  setField: <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => void;
  setDraft: (partial: Partial<ProductDraft>) => void;
  resetDraft: () => void;
  addPricingTier: (tier: PricingTier) => void;
  updatePricingTier: (id: string, updates: Partial<PricingTier>) => void;
  removePricingTier: (id: string) => void;
  addResourceRule: (rule: ResourceRule) => void;
  updateResourceRule: (id: string, updates: Partial<ResourceRule>) => void;
  removeResourceRule: (id: string) => void;
};

const ProductDraftContext = createContext<ProductDraftContextType | undefined>(undefined);

// Provider component
export function ProductDraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productDraftReducer, {
    draft: INITIAL_DRAFT,
  });

  const setField = useCallback(function<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]): void {
    dispatch({ type: "SET_FIELD", key, value });
  }, []);

  const setDraft = useCallback((partial: Partial<ProductDraft>) => {
    dispatch({ type: "SET_DRAFT", partial });
  }, []);

  const resetDraft = useCallback(() => {
    dispatch({ type: "RESET_DRAFT" });
  }, []);

  const addPricingTier = useCallback((tier: PricingTier) => {
    dispatch({ type: "ADD_PRICING_TIER", tier });
  }, []);

  const updatePricingTier = useCallback((id: string, updates: Partial<PricingTier>) => {
    dispatch({ type: "UPDATE_PRICING_TIER", id, updates });
  }, []);

  const removePricingTier = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PRICING_TIER", id });
  }, []);

  const addResourceRule = useCallback((rule: ResourceRule) => {
    dispatch({ type: "ADD_RESOURCE_RULE", rule });
  }, []);

  const updateResourceRule = useCallback((id: string, updates: Partial<ResourceRule>) => {
    dispatch({ type: "UPDATE_RESOURCE_RULE", id, updates });
  }, []);

  const removeResourceRule = useCallback((id: string) => {
    dispatch({ type: "REMOVE_RESOURCE_RULE", id });
  }, []);

  return (
    <ProductDraftContext.Provider
      value={{
        draft: state.draft,
        setField,
        setDraft,
        resetDraft,
        addPricingTier,
        updatePricingTier,
        removePricingTier,
        addResourceRule,
        updateResourceRule,
        removeResourceRule,
      }}
    >
      {children}
    </ProductDraftContext.Provider>
  );
}

// Hook
export function useProductDraft() {
  const context = useContext(ProductDraftContext);
  if (context === undefined) {
    throw new Error("useProductDraft must be used within a ProductDraftProvider");
  }
  return context;
}
