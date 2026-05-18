"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

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
  capacityPerUnit?: number;
  unitLabel: "unit" | "vehicle" | "bike" | "seat" | "guide" | "canoe" | "kayak";
  totalUnits: number;
  bufferUnits: number;
  status: "active" | "maintenance";
};

export function getAvailableUnits(variant: ResourceVariant): number {
  if (variant.status === "maintenance") return 0;
  return Math.max(0, variant.totalUnits - variant.bufferUnits);
}

// DB row mappers
function dbRowToCategory(row: Record<string, unknown>): ResourceCategory {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? undefined,
  };
}

function dbRowToVariant(row: Record<string, unknown>): ResourceVariant {
  return {
    id: row.id as string,
    categoryId: row.category_id as string,
    name: row.name as string,
    capacityPerUnit: (row.capacity_per_unit as number | null) ?? undefined,
    unitLabel: row.unit_label as ResourceVariant["unitLabel"],
    totalUnits: row.total_units as number,
    bufferUnits: row.buffer_units as number,
    status: row.status as "active" | "maintenance",
  };
}

// Context type
type ResourceInventoryContextType = {
  categories: ResourceCategory[];
  variants: ResourceVariant[];
  loading: boolean;
  addCategory: (category: ResourceCategory) => Promise<void>;
  updateCategory: (
    id: string,
    updates: Partial<ResourceCategory>,
  ) => Promise<void>;
  addVariant: (variant: ResourceVariant) => Promise<void>;
  updateVariant: (
    id: string,
    updates: Partial<ResourceVariant>,
  ) => Promise<void>;
  deleteVariant: (id: string) => Promise<void>;
  toggleMaintenance: (id: string) => Promise<void>;
  getVariantsByCategory: (categoryId: string) => ResourceVariant[];
  getVariantById: (id: string) => ResourceVariant | undefined;
};

const ResourceInventoryContext = createContext<
  ResourceInventoryContextType | undefined
>(undefined);

export function ResourceInventoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [variants, setVariants] = useState<ResourceVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: pu } = await supabase
        .schema(SCHEMA)
        .from("provider_users")
        .select("provider_id")
        .eq("profile_id", user.id)
        .single();

      if (!pu) {
        setLoading(false);
        return;
      }

      const pid = (pu as { provider_id: string }).provider_id;
      setProviderId(pid);

      const [{ data: cats }, { data: vars }] = await Promise.all([
        supabase
          .schema(SCHEMA)
          .from("resource_categories")
          .select("*")
          .eq("provider_id", pid)
          .order("created_at"),
        supabase
          .schema(SCHEMA)
          .from("resource_variants")
          .select("*")
          .eq("provider_id", pid)
          .order("created_at"),
      ]);

      setCategories((cats ?? []).map(dbRowToCategory));
      setVariants((vars ?? []).map(dbRowToVariant));
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCategory = useCallback(
    async (category: ResourceCategory) => {
      if (!providerId) return;
      await supabase
        .schema(SCHEMA)
        .from("resource_categories")
        .insert({
          id: category.id,
          provider_id: providerId,
          name: category.name,
          description: category.description ?? null,
        });
      setCategories((prev) => [...prev, category]);
    },
    [providerId, supabase],
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<ResourceCategory>) => {
      await supabase
        .schema(SCHEMA)
        .from("resource_categories")
        .update({
          ...(updates.name !== undefined && { name: updates.name }),
          ...(updates.description !== undefined && {
            description: updates.description,
          }),
        })
        .eq("id", id);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
    },
    [supabase],
  );

  const addVariant = useCallback(
    async (variant: ResourceVariant) => {
      if (!providerId) return;
      await supabase
        .schema(SCHEMA)
        .from("resource_variants")
        .insert({
          id: variant.id,
          category_id: variant.categoryId,
          provider_id: providerId,
          name: variant.name,
          capacity_per_unit: variant.capacityPerUnit ?? null,
          unit_label: variant.unitLabel,
          total_units: variant.totalUnits,
          buffer_units: variant.bufferUnits,
          status: variant.status,
        });
      setVariants((prev) => [...prev, variant]);
    },
    [providerId, supabase],
  );

  const updateVariant = useCallback(
    async (id: string, updates: Partial<ResourceVariant>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.capacityPerUnit !== undefined)
        dbUpdates.capacity_per_unit = updates.capacityPerUnit;
      if (updates.unitLabel !== undefined)
        dbUpdates.unit_label = updates.unitLabel;
      if (updates.totalUnits !== undefined)
        dbUpdates.total_units = updates.totalUnits;
      if (updates.bufferUnits !== undefined)
        dbUpdates.buffer_units = updates.bufferUnits;
      if (updates.status !== undefined) dbUpdates.status = updates.status;

      await supabase
        .schema(SCHEMA)
        .from("resource_variants")
        .update(dbUpdates)
        .eq("id", id);
      setVariants((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v)),
      );
    },
    [supabase],
  );

  const deleteVariant = useCallback(
    async (id: string) => {
      await supabase
        .schema(SCHEMA)
        .from("resource_variants")
        .delete()
        .eq("id", id);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    },
    [supabase],
  );

  const toggleMaintenance = useCallback(
    async (id: string) => {
      setVariants((prev) => {
        const variant = prev.find((v) => v.id === id);
        if (!variant) return prev;
        const newStatus =
          variant.status === "active" ? "maintenance" : "active";
        supabase
          .schema(SCHEMA)
          .from("resource_variants")
          .update({ status: newStatus })
          .eq("id", id)
          .then(() => {});
        return prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v));
      });
    },
    [supabase],
  );

  const getVariantsByCategory = useCallback(
    (categoryId: string) => variants.filter((v) => v.categoryId === categoryId),
    [variants],
  );

  const getVariantById = useCallback(
    (id: string) => variants.find((v) => v.id === id),
    [variants],
  );

  return (
    <ResourceInventoryContext.Provider
      value={{
        categories,
        variants,
        loading,
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

export function useResourceInventory() {
  const context = useContext(ResourceInventoryContext);
  if (context === undefined) {
    throw new Error(
      "useResourceInventory must be used within a ResourceInventoryProvider",
    );
  }
  return context;
}
