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
  const { categories, variants, getVariantsByCategory } = useResourceInventory();
  const [selectedCategoryForRule, setSelectedCategoryForRule] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* Product name */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">
          Product name <span className="text-amber-700">*</span>
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g., Snowmobile Safari – Sport"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">
          Duration (minutes) <span className="text-amber-700">*</span>
        </label>
        <input
          type="number"
          value={draft.durationMinutes ?? ""}
          onChange={(e) => setField("durationMinutes", e.target.value ? Number(e.target.value) : null)}
          placeholder="e.g., 120"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Max guests */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">
          Max guests per departure <span className="text-amber-700">*</span>
        </label>
        <input
          type="number"
          value={draft.capacityMax ?? ""}
          onChange={(e) => setField("capacityMax", e.target.value ? Number(e.target.value) : null)}
          placeholder="e.g., 10"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">
          Location <span className="text-amber-700">*</span>
        </label>
        <input
          type="text"
          value={draft.location}
          onChange={(e) => setField("location", e.target.value)}
          placeholder="e.g., Tahko, Helsinki"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Meeting point */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">Meeting point</label>
        <input
          type="text"
          value={draft.meetingPoint}
          onChange={(e) => setField("meetingPoint", e.target.value)}
          placeholder="e.g., Safari house, 10 min before start"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Short description */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">Short description</label>
        <input
          type="text"
          value={draft.shortDescription}
          onChange={(e) => setField("shortDescription", e.target.value)}
          placeholder="Brief one-line description"
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-900">Description</label>
        <textarea
          value={draft.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={4}
          placeholder="Describe the experience, what's included, meeting point, etc."
          className="mt-2 w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      {/* Customer types & pricing */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-900">
            Customer types & pricing <span className="text-amber-700">*</span>
          </label>
          <button
            type="button"
            onClick={addCustomerType}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            + Add type
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {draft.pricingTiers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
              No customer types yet. Click "Add type" to create one.
            </div>
          ) : (
            draft.pricingTiers.map((tier) => (
              <div key={tier.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-neutral-700">Label</label>
                    <input
                      type="text"
                      value={tier.label}
                      onChange={(e) => updateCustomerType(tier.id, { label: e.target.value })}
                      placeholder="e.g., One person, Two people"
                      className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-neutral-700">Price (EUR)</label>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updateCustomerType(tier.id, { price: Number(e.target.value) || 0 })}
                      placeholder="149"
                      className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCustomerType(tier.id)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-2 text-xs text-neutral-500">
          Each pricing tier defines a customer type and price. Resource rules can be added separately.
        </div>
      </div>

      {/* Resource requirements (optional) */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4">
          <div className="text-sm font-medium text-neutral-900">Resource requirements (optional)</div>
          <div className="mt-1 text-sm text-neutral-600">
            Select resource variants from your inventory that this product requires per booking.
          </div>
        </div>

        <div className="space-y-4">
          {/* Add new requirement */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-3">
              <label className="block text-xs font-medium text-neutral-700 mb-2">
                Select resource variant
              </label>
              <select
                value={selectedCategoryForRule || ""}
                onChange={(e) => setSelectedCategoryForRule(e.target.value || null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategoryForRule && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Variant
                </label>
                <select
                  id="variant-select"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  onChange={(e) => {
                    const variantId = e.target.value;
                    if (!variantId) return;
                    const variant = variants.find((v) => v.id === variantId);
                    if (!variant) return;

                    const category = categories.find((c) => c.id === variant.categoryId);
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
                    const select = document.getElementById("variant-select") as HTMLSelectElement;
                    if (select) select.value = "";
                  }}
                >
                  <option value="">Select variant...</option>
                  {getVariantsByCategory(selectedCategoryForRule).map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name} ({getAvailableUnits(variant)} available)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Existing requirements */}
          {draft.resourceRules.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-neutral-700">Required resources per booking:</div>
              {draft.resourceRules.map((rule) => {
                const variant = variants.find((v) => v.id === rule.variantId);
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900">
                        {rule.variantLabel || variant?.name || "Unknown variant"}
                      </div>
                      <div className="mt-1 text-xs text-neutral-600">
                        {rule.capacityPerUnit ? `${rule.capacityPerUnit} ppl / unit` : "1 ppl / unit"} •{" "}
                        {rule.unitsPerBooking || 1} unit(s) per booking
                        {variant && (
                          <span className="ml-2">
                            ({getAvailableUnits(variant)} available in inventory)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        className="w-20 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeResourceRule(rule.id)}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {draft.resourceRules.length === 0 && (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
              No resource requirements yet. Select a variant above to add one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
