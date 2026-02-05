"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

/**
 * Resource Inventory Store
 * Manages provider's resource inventory (snowmobiles, e-bikes, guides, etc.)
 * Uses React Context + reducer pattern (in-memory, no database).
 */

// Types
export type ResourceCategory = {
  id: string;
  name: string;
  description?: string;
};

export type ResourceVariant = {
  id: string;
  categoryId: string;
  name: string;
  capacityPerUnit?: number; // e.g., 1 for sport, 2 for touring
  unitLabel: "unit" | "vehicle" | "bike" | "seat" | "guide" | "canoe" | "kayak";
  totalUnits: number;
  bufferUnits: number;
  status: "active" | "maintenance";
};

// Computed helper
export function getAvailableUnits(variant: ResourceVariant): number {
  if (variant.status === "maintenance") return 0;
  return Math.max(0, variant.totalUnits - variant.bufferUnits);
}

// Store state
type ResourceInventoryState = {
  categories: ResourceCategory[];
  variants: ResourceVariant[];
};

// Actions
type ResourceInventoryAction =
  | { type: "ADD_CATEGORY"; category: ResourceCategory }
  | { type: "UPDATE_CATEGORY"; id: string; updates: Partial<ResourceCategory> }
  | { type: "ADD_VARIANT"; variant: ResourceVariant }
  | { type: "UPDATE_VARIANT"; id: string; updates: Partial<ResourceVariant> }
  | { type: "DELETE_VARIANT"; id: string }
  | { type: "TOGGLE_MAINTENANCE"; id: string };

// Mock initial data for Finnish safari operator
const MOCK_CATEGORIES: ResourceCategory[] = [
  {
    id: "cat-snowmobiles",
    name: "Snowmobiles",
    description: "Winter vehicles for snowmobile safaris",
  },
  {
    id: "cat-ebikes",
    name: "E-bikes",
    description: "Electric bicycles for tours",
  },
  {
    id: "cat-guides",
    name: "Guides",
    description: "Professional tour guides",
  },
];

const MOCK_VARIANTS: ResourceVariant[] = [
  // Snowmobiles
  {
    id: "var-sport",
    categoryId: "cat-snowmobiles",
    name: "Sport (1-seat)",
    capacityPerUnit: 1,
    unitLabel: "vehicle",
    totalUnits: 5,
    bufferUnits: 0,
    status: "active",
  },
  {
    id: "var-touring",
    categoryId: "cat-snowmobiles",
    name: "Touring (2-seat)",
    capacityPerUnit: 2,
    unitLabel: "vehicle",
    totalUnits: 5,
    bufferUnits: 1,
    status: "active",
  },
  // E-bikes
  {
    id: "var-ebike-adult",
    categoryId: "cat-ebikes",
    name: "Adult M/L",
    capacityPerUnit: 1,
    unitLabel: "bike",
    totalUnits: 10,
    bufferUnits: 1,
    status: "active",
  },
  // Guides
  {
    id: "var-guide",
    categoryId: "cat-guides",
    name: "Guide",
    capacityPerUnit: 1,
    unitLabel: "guide",
    totalUnits: 4,
    bufferUnits: 0,
    status: "active",
  },
];

// Reducer
function resourceInventoryReducer(
  state: ResourceInventoryState,
  action: ResourceInventoryAction
): ResourceInventoryState {
  switch (action.type) {
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.category],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.id ? { ...cat, ...action.updates } : cat
        ),
      };

    case "ADD_VARIANT":
      return {
        ...state,
        variants: [...state.variants, action.variant],
      };

    case "UPDATE_VARIANT":
      return {
        ...state,
        variants: state.variants.map((variant) =>
          variant.id === action.id ? { ...variant, ...action.updates } : variant
        ),
      };

    case "DELETE_VARIANT":
      return {
        ...state,
        variants: state.variants.filter((variant) => variant.id !== action.id),
      };

    case "TOGGLE_MAINTENANCE":
      return {
        ...state,
        variants: state.variants.map((variant) =>
          variant.id === action.id
            ? {
                ...variant,
                status: variant.status === "active" ? "maintenance" : "active",
              }
            : variant
        ),
      };

    default:
      return state;
  }
}

// Context
type ResourceInventoryContextType = {
  categories: ResourceCategory[];
  variants: ResourceVariant[];
  addCategory: (category: ResourceCategory) => void;
  updateCategory: (id: string, updates: Partial<ResourceCategory>) => void;
  addVariant: (variant: ResourceVariant) => void;
  updateVariant: (id: string, updates: Partial<ResourceVariant>) => void;
  deleteVariant: (id: string) => void;
  toggleMaintenance: (id: string) => void;
  getVariantsByCategory: (categoryId: string) => ResourceVariant[];
  getVariantById: (id: string) => ResourceVariant | undefined;
};

const ResourceInventoryContext = createContext<ResourceInventoryContextType | undefined>(undefined);

// Provider component
export function ResourceInventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resourceInventoryReducer, {
    categories: MOCK_CATEGORIES,
    variants: MOCK_VARIANTS,
  });

  const addCategory = useCallback((category: ResourceCategory) => {
    dispatch({ type: "ADD_CATEGORY", category });
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<ResourceCategory>) => {
    dispatch({ type: "UPDATE_CATEGORY", id, updates });
  }, []);

  const addVariant = useCallback((variant: ResourceVariant) => {
    dispatch({ type: "ADD_VARIANT", variant });
  }, []);

  const updateVariant = useCallback((id: string, updates: Partial<ResourceVariant>) => {
    dispatch({ type: "UPDATE_VARIANT", id, updates });
  }, []);

  const deleteVariant = useCallback((id: string) => {
    dispatch({ type: "DELETE_VARIANT", id });
  }, []);

  const toggleMaintenance = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_MAINTENANCE", id });
  }, []);

  const getVariantsByCategory = useCallback(
    (categoryId: string) => {
      return state.variants.filter((variant) => variant.categoryId === categoryId);
    },
    [state.variants]
  );

  const getVariantById = useCallback(
    (id: string) => {
      return state.variants.find((variant) => variant.id === id);
    },
    [state.variants]
  );

  return (
    <ResourceInventoryContext.Provider
      value={{
        categories: state.categories,
        variants: state.variants,
        addCategory,
        updateCategory,
        addVariant,
        updateVariant,
        deleteVariant,
        toggleMaintenance,
        getVariantsByCategory,
        getVariantById,
      }}
    >
      {children}
    </ResourceInventoryContext.Provider>
  );
}

// Hook
export function useResourceInventory() {
  const context = useContext(ResourceInventoryContext);
  if (context === undefined) {
    throw new Error("useResourceInventory must be used within a ResourceInventoryProvider");
  }
  return context;
}
