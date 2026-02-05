"use client";

import React, { useState } from "react";
import {
  useResourceInventory,
  getAvailableUnits,
  type ResourceCategory,
  type ResourceVariant,
} from "@/lib/resourceStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProviderResourcesPage() {
  const {
    categories,
    variants,
    addCategory,
    updateCategory,
    addVariant,
    updateVariant,
    deleteVariant,
    toggleMaintenance,
    getVariantsByCategory,
  } = useResourceInventory();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories[0]?.id || null
  );
  const [editingVariant, setEditingVariant] = useState<ResourceVariant | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const categoryVariants = selectedCategoryId
    ? getVariantsByCategory(selectedCategoryId)
    : [];

  function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const newCategory: ResourceCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
    };
    addCategory(newCategory);
    setNewCategoryName("");
    setIsAddingCategory(false);
    setSelectedCategoryId(newCategory.id);
  }

  function handleAddVariant() {
    if (!selectedCategoryId) return;
    const newVariant: ResourceVariant = {
      id: `var-${Date.now()}`,
      categoryId: selectedCategoryId,
      name: "",
      unitLabel: "unit",
      totalUnits: 0,
      bufferUnits: 0,
      status: "active",
    };
    addVariant(newVariant);
    setEditingVariant(newVariant);
    setIsAddingVariant(false);
  }

  function handleSaveVariant(variant: ResourceVariant) {
    if (variant.id.startsWith("var-") && !variants.find((v) => v.id === variant.id)) {
      // New variant
      addVariant(variant);
    } else {
      // Update existing
      updateVariant(variant.id, variant);
    }
    setEditingVariant(null);
  }

  function handleDeleteVariant(id: string) {
    if (confirm("Are you sure you want to delete this variant?")) {
      deleteVariant(id);
    }
  }

    return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div>
            <div className="text-lg font-medium text-neutral-900">Resources</div>
            <div className="text-sm text-neutral-500">
              Manage your inventory: vehicles, equipment, guides
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Categories */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-neutral-900">Categories</div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  + Add
                </button>
              </div>

              {isAddingCategory && (
                <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCategory();
                      if (e.key === "Escape") {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cx(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      selectedCategoryId === category.id
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-50 text-neutral-900 hover:bg-neutral-100"
                    )}
                  >
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="mt-0.5 text-xs opacity-70">{category.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Category detail with variants */}
          <section className="lg:col-span-2">
            {selectedCategory ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      {selectedCategory.name}
                    </div>
                    {selectedCategory.description && (
                      <div className="mt-1 text-sm text-neutral-600">
                        {selectedCategory.description}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    + Add variant
                  </button>
                </div>

                {categoryVariants.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                    <div className="text-sm text-neutral-500">
                      No variants yet. Click "Add variant" to create one.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="rounded-lg border border-neutral-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-neutral-900">
                                {variant.name}
                              </div>
                              <span
                                className={cx(
                                  "rounded-full border px-2 py-0.5 text-xs",
                                  variant.status === "active"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700"
                                )}
                              >
                                {variant.status === "active" ? "OK" : "Maintenance"}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-neutral-500">Capacity:</span>{" "}
                                <span className="font-medium text-neutral-900">
                                  {variant.capacityPerUnit
                                    ? `${variant.capacityPerUnit} ppl / ${variant.unitLabel}`
                                    : `1 ppl / ${variant.unitLabel}`}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-500">Total units:</span>{" "}
                                <span className="font-medium text-neutral-900">
                                  {variant.totalUnits}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-500">Buffer:</span>{" "}
                                <span className="font-medium text-neutral-900">
                                  {variant.bufferUnits}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-500">Available:</span>{" "}
                                <span className="font-medium text-emerald-700">
                                  {getAvailableUnits(variant)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingVariant(variant)}
                              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleMaintenance(variant.id)}
                              className={cx(
                                "rounded-lg border px-3 py-1.5 text-xs font-medium",
                                variant.status === "active"
                                  ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              )}
                            >
                              {variant.status === "active" ? "Set maintenance" : "Set active"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                <div className="text-sm text-neutral-500">
                  Select a category to view variants, or create a new category.
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Edit variant slide-over */}
      {editingVariant && (
        <VariantEditor
          variant={editingVariant}
          onSave={handleSaveVariant}
          onClose={() => setEditingVariant(null)}
        />
      )}

    </div>
  );
}

// Maintenance Modal Component
function MaintenanceModal({
  variant,
  value,
  onChange,
  onSave,
  onClose,
}: {
  variant: ResourceVariant;
  value: string;
  onChange: (value: string) => void;
  onSave: (units: number) => void;
  onClose: () => void;
}) {
  const numValue = Number(value) || 0;
  const maxUnits = variant.totalUnits;
  const isValid = numValue >= 0 && numValue <= maxUnits;

  function handleSave() {
    if (isValid) {
      onSave(numValue);
    }
  }

  // Close on ESC
  React.useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-neutral-900">Set maintenance units</div>
            <div className="mt-1 text-xs text-neutral-600">{variant.name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-2">
              How many units are under maintenance?
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              min="0"
              max={maxUnits}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
              autoFocus
            />
            <div className="mt-2 text-xs text-neutral-500">
              Range: 0 to {maxUnits} (total units).
            </div>
            {!isValid && (
              <div className="mt-2 text-xs text-red-600">
                Please enter a number between 0 and {maxUnits}.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-neutral-500">Total units:</span>{" "}
                <span className="font-medium text-neutral-900">{variant.totalUnits}</span>
              </div>
              <div>
                <span className="text-neutral-500">Buffer:</span>{" "}
                <span className="font-medium text-neutral-900">{variant.bufferUnits}</span>
              </div>
              <div>
                <span className="text-neutral-500">Maintenance:</span>{" "}
                <span className="font-medium text-neutral-900">{numValue}</span>
              </div>
              <div>
                <span className="text-neutral-500">Available:</span>{" "}
                <span className="font-medium text-emerald-700">
                  {Math.max(0, variant.totalUnits - variant.bufferUnits - numValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={cx(
              "rounded-lg px-4 py-2 text-sm font-medium",
              isValid
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Variant Editor Component
function VariantEditor({
  variant,
  onSave,
  onClose,
}: {
  variant: ResourceVariant;
  onSave: (variant: ResourceVariant) => void;
  onClose: () => void;
}) {
  const [edited, setEdited] = useState<ResourceVariant>(variant);

  const unitLabels: ResourceVariant["unitLabel"][] = [
    "unit",
    "vehicle",
    "bike",
    "seat",
    "guide",
    "canoe",
    "kayak",
  ];

  function handleSave() {
    if (!edited.name.trim()) {
      alert("Variant name is required");
      return;
    }
    onSave(edited);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-900">
            {variant.id.startsWith("var-") && !variant.name ? "Add variant" : "Edit variant"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Variant name <span className="text-amber-700">*</span>
            </label>
            <input
              type="text"
              value={edited.name}
              onChange={(e) => setEdited({ ...edited, name: e.target.value })}
              placeholder="e.g., Sport (1-seat)"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Capacity per unit (people)
            </label>
            <input
              type="number"
              value={edited.capacityPerUnit ?? ""}
              onChange={(e) =>
                setEdited({
                  ...edited,
                  capacityPerUnit: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="e.g., 1 or 2"
              min="1"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
            <div className="mt-1 text-xs text-neutral-500">
              How many people can use this unit? Leave empty if not applicable.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Unit label
            </label>
            <select
              value={edited.unitLabel}
              onChange={(e) =>
                setEdited({ ...edited, unitLabel: e.target.value as ResourceVariant["unitLabel"] })
              }
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              {unitLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Total units
              </label>
              <input
                type="number"
                value={edited.totalUnits}
                onChange={(e) =>
                  setEdited({ ...edited, totalUnits: Number(e.target.value) || 0 })
                }
                min="0"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Buffer units
              </label>
              <input
                type="number"
                value={edited.bufferUnits}
                onChange={(e) =>
                  setEdited({ ...edited, bufferUnits: Number(e.target.value) || 0 })
                }
                min="0"
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>

        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save
          </button>
        </div>
      </div>
      </div>
    );
  }
  