"use client";

import React, { useState } from "react";
import { useProductDraft } from "@/lib/productStore";
import type { PricingTier, ResourceRule } from "@/lib/productStore";
import { useResourceInventory, getAvailableUnits } from "@/lib/resourceStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function ProductForm() {
  const {
    draft,
    setField,
    addPricingTier,
    updatePricingTier,
    removePricingTier,
    addResourceRule,
    updateResourceRule,
    removeResourceRule,
  } = useProductDraft();
  const {
    categories,
    variants,
    loading: resourcesLoading,
    getVariantsByCategory,
  } = useResourceInventory();
  const [selectedCategoryForRule, setSelectedCategoryForRule] = useState<
    string | null
  >(null);

  function addCustomerType() {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      label: "",
      price: 0,
    };
    addPricingTier(newTier);
  }

  function removeCustomerType(id: string) {
    removePricingTier(id);
  }

  function updateCustomerType(id: string, updates: Partial<PricingTier>) {
    updatePricingTier(id, updates);
  }

  return (
    <div className="space-y-10">
      {/* Product name */}
      <div>
        <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
          Product name <span className="text-[var(--terracotta)]">*</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g., Snowmobile Safari – Sport"
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-sub)]/30 focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Duration */}
        <div>
          <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
            Duration (minutes) <span className="text-[var(--terracotta)]">*</span>
          </label>
          <input
            type="number"
            value={draft.durationMinutes ?? ""}
            onChange={(e) =>
              setField(
                "durationMinutes",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            placeholder="e.g., 120"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm font-bold"
          />
        </div>

        {/* Max guests */}
        <div>
          <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
            Max guests per departure <span className="text-[var(--terracotta)]">*</span>
          </label>
          <input
            type="number"
            value={draft.capacityMax ?? ""}
            onChange={(e) =>
              setField(
                "capacityMax",
                e.target.value ? Number(e.target.value) : null,
              )
            }
            placeholder="e.g., 10"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm font-bold"
          />
        </div>
      </div>

      {/* Location info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[var(--line)]">
        <div>
          <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
            Location <span className="text-[var(--terracotta)]">*</span>
          </label>
          <input
            type="text"
            value={draft.location}
            onChange={(e) => setField("location", e.target.value)}
            placeholder="e.g., Tahko, Helsinki"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
            Meeting point
          </label>
          <input
            type="text"
            value={draft.meetingPoint}
            onChange={(e) => setField("meetingPoint", e.target.value)}
            placeholder="e.g., Safari house, 10 min before start"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm"
          />
        </div>
      </div>

      {/* Descriptions */}
      <div className="pt-8 border-t border-[var(--line)] space-y-8">
        <div>
          <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
            Short description
          </label>
          <input
            type="text"
            value={draft.shortDescription}
            onChange={(e) => setField("shortDescription", e.target.value)}
            placeholder="Brief one-line description"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
            Full Description
          </label>
          <textarea
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={5}
            placeholder="Describe the experience, what's included, etc."
            className="w-full resize-none rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Customer types & pricing */}
      <div className="pt-8 border-t border-[var(--line)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--green-900)] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--terracotta)] rounded-full" />
            Pricing Tiers
          </h2>
          <button
            type="button"
            onClick={addCustomerType}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--green-900)] hover:bg-[var(--cream-50)] transition-colors shadow-sm"
          >
            + ADD TIER
          </button>
        </div>
        <div className="space-y-4">
          {draft.pricingTiers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--cream-50)]/30 p-12 text-center text-sm text-[var(--ink-sub)] italic opacity-50">
              No customer types yet. Click &ldquo;Add type&rdquo; to create one.
            </div>
          ) : (
            draft.pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm hover:border-[var(--green-800)]/30 transition-all"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-end">
                  <div className="md:col-span-6">
                    <label className="block text-[10px] font-bold text-[var(--ink-sub)] mb-1.5 uppercase tracking-widest opacity-60">
                      Tier Label
                    </label>
                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) =>
                        updateCustomerType(tier.id, { label: e.target.value })
                      }
                      placeholder="e.g., Adult, Child"
                      className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream-50)]/30 px-4 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-[var(--ink-sub)] mb-1.5 uppercase tracking-widest opacity-60">
                      Price (EUR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-sub)] font-bold">€</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) =>
                          updateCustomerType(tier.id, {
                            price: Number(e.target.value) || 0,
                          })
                        }
                        placeholder="149"
                        className="w-full rounded-xl border border-[var(--line)] bg-[var(--cream-50)]/30 pl-8 pr-4 py-2.5 text-sm text-[var(--ink)] font-bold focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => removeCustomerType(tier.id)}
                      className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-[10px] font-medium text-[var(--ink-sub)] uppercase tracking-tight opacity-50">
          Each pricing tier defines a customer type and price. Resource rules
          can be added separately.
        </div>
      </div>

      {/* Resource requirements (optional) */}
      <div className="pt-8 border-t border-[var(--line)]">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[var(--green-900)] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--terracotta)] rounded-full" />
            Inventory Rules
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-sub)]">
            Select resource variants that this product requires per booking.
          </p>
        </div>

        <div className="space-y-6">
          {/* Add new requirement */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-100)]/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
                  Select Category
                </label>
                <select
                  value={selectedCategoryForRule || ""}
                  onChange={(e) =>
                    setSelectedCategoryForRule(e.target.value || null)
                  }
                  disabled={resourcesLoading}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] disabled:bg-neutral-100 font-medium"
                >
                  <option value="">
                    {resourcesLoading
                      ? "Loading resources…"
                      : "Choose a category..."}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryForRule && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="block text-xs font-bold text-[var(--green-900)] mb-2 uppercase tracking-wider opacity-70">
                    Choose Variant
                  </label>
                  <select
                    id="variant-select"
                    className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] font-medium"
                    onChange={(e) => {
                      const variantId = e.target.value;
                      if (!variantId) return;
                      const variant = variants.find((v) => v.id === variantId);
                      if (!variant) return;

                      const category = categories.find(
                        (c) => c.id === variant.categoryId,
                      );
                      const newRule: ResourceRule = {
                        id: `rule-${Date.now()}`,
                        resourceType:
                          category?.name.toLowerCase().includes("snowmobile") ||
                          category?.name.toLowerCase().includes("vehicle")
                            ? "snowmobiles"
                            : category?.name.toLowerCase().includes("bike")
                              ? "ebikes"
                              : category?.name.toLowerCase().includes("guide")
                                ? "guides_only"
                                : "other",
                        variantId: variant.id,
                        variantLabel: variant.name,
                        capacityPerUnit: variant.capacityPerUnit || 1,
                        unitsPerBooking: 1,
                      };
                      addResourceRule(newRule);
                      setSelectedCategoryForRule(null);
                      // Reset select
                      const select = document.getElementById(
                        "variant-select",
                      ) as HTMLSelectElement;
                      if (select) select.value = "";
                    }}
                  >
                    <option value="">Select variant...</option>
                    {getVariantsByCategory(selectedCategoryForRule).map(
                      (variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name} ({getAvailableUnits(variant)} available)
                        </option>
                      ),
                    )}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Existing requirements */}
          {draft.resourceRules.length > 0 && (
            <div className="space-y-4">
              <div className="text-[10px] font-black text-[var(--ink-sub)] uppercase tracking-[0.2em] opacity-40">
                Active Requirements
              </div>
              {draft.resourceRules.map((rule) => {
                const variant = variants.find((v) => v.id === rule.variantId);
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm group hover:border-[var(--green-800)]/30 transition-all"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[var(--green-900)]">
                        {rule.variantLabel ||
                          variant?.name ||
                          "Unknown variant"}
                      </div>
                      <div className="mt-1 text-xs text-[var(--ink-sub)] font-medium">
                        {rule.capacityPerUnit
                          ? `${rule.capacityPerUnit} pax / unit`
                          : "1 pax / unit"}{" "}
                        <span className="mx-2 opacity-30">·</span> {rule.unitsPerBooking || 1} unit(s) required
                        {variant && (
                          <span className="ml-3 italic opacity-60">
                            ({getAvailableUnits(variant)} available)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--ink-sub)] mb-1 opacity-50">Quantity</label>
                        <input
                          type="number"
                          value={rule.unitsPerBooking || 1}
                          onChange={(e) => {
                            const units = Number(e.target.value) || 1;
                            updateResourceRule(rule.id, {
                              unitsPerBooking: units,
                            });
                          }}
                          min="1"
                          className="w-20 rounded-xl border border-[var(--line)] bg-[var(--cream-50)]/50 px-3 py-1.5 text-sm font-bold text-[var(--green-900)] focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResourceRule(rule.id)}
                        className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="Remove requirement"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H5c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {draft.resourceRules.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--cream-50)]/30 p-12 text-center text-sm text-[var(--ink-sub)] italic opacity-50">
              No resource requirements yet. Select a variant above to add one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
