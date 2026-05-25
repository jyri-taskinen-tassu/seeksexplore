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
    loading,
    addCategory,
    updateCategory,
    addVariant,
    updateVariant,
    deleteVariant,
    toggleMaintenance,
    getVariantsByCategory,
  } = useResourceInventory();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [editingVariant, setEditingVariant] = useState<ResourceVariant | null>(
    null,
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Select first category once loaded
  React.useEffect(() => {
    if (!loading && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [loading, categories, selectedCategoryId]);

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId,
  );
  const categoryVariants = selectedCategoryId
    ? getVariantsByCategory(selectedCategoryId)
    : [];

  function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const newCategory: ResourceCategory = {
      id: crypto.randomUUID(),
      name: newCategoryName.trim(),
    };
    addCategory(newCategory);
    setNewCategoryName("");
    setIsAddingCategory(false);
    setSelectedCategoryId(newCategory.id);
  }

  function handleAddVariant() {
    if (!selectedCategoryId) return;
    setEditingVariant({
      id: crypto.randomUUID(),
      categoryId: selectedCategoryId,
      name: "",
      unitLabel: "unit",
      totalUnits: 0,
      bufferUnits: 0,
      status: "active",
    });
  }

  function handleSaveVariant(variant: ResourceVariant) {
    if (variants.find((v) => v.id === variant.id)) {
      updateVariant(variant.id, variant);
    } else {
      addVariant(variant);
    }
    setEditingVariant(null);
  }

  function handleDeleteVariant(id: string) {
    if (confirm("Are you sure you want to delete this variant?")) {
      deleteVariant(id);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-50)]">
        <div className="text-sm text-[var(--ink-sub)] opacity-50 animate-pulse">Loading resources…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Header */}
      <header className="border-b border-[var(--line)] bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-[var(--green-900)]">
              Resources
            </div>
            <div className="text-sm text-[var(--ink-sub)]">
              Manage your inventory: vehicles, equipment, guides
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Categories */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-[var(--green-900)] uppercase tracking-widest opacity-70">
                  Categories
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--green-900)] hover:bg-[var(--cream-50)] transition-colors"
                >
                  + Add
                </button>
              </div>

              {isAddingCategory && (
                <div className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--cream-50)]/50 p-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
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
                      className="rounded-lg bg-[var(--green-900)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                      }}
                      className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
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
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-all",
                      selectedCategoryId === category.id
                        ? "bg-[var(--green-900)] text-white shadow-sm"
                        : "bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
                    )}
                  >
                    <div className="font-semibold">{category.name}</div>
                    {category.description && (
                      <div className={cx("mt-0.5 text-xs", selectedCategoryId === category.id ? "opacity-70" : "text-[var(--ink-sub)]")}>
                        {category.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Category detail with variants */}
          <section className="lg:col-span-2">
            {selectedCategory ? (
              <div className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8 border-b border-[var(--line)] pb-6">
                  <div>
                    <div className="text-xl font-bold text-[var(--green-900)]">
                      {selectedCategory.name}
                    </div>
                    {selectedCategory.description && (
                      <div className="mt-1 text-sm text-[var(--ink-sub)]">
                        {selectedCategory.description}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-900)] transition-colors shadow-sm"
                  >
                    + Add variant
                  </button>
                </div>

                {categoryVariants.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--cream-50)]/30 p-12 text-center">
                    <div className="text-sm text-[var(--ink-sub)] italic opacity-50">
                      No variants yet. Click &ldquo;Add variant&rdquo; to create
                      one.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className="rounded-xl border border-[var(--line)] bg-white p-5 hover:border-[var(--green-800)]/30 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-base font-bold text-[var(--green-900)]">
                                {variant.name}
                              </div>
                              <span
                                className={cx(
                                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                                  variant.status === "active"
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : "bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)] ring-[var(--terracotta)]/20",
                                )}
                              >
                                {variant.status === "active"
                                  ? "OK"
                                  : "Maintenance"}
                              </span>
                            </div>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <div className="text-[var(--ink-sub)] mb-1 uppercase tracking-widest text-[9px] font-bold opacity-60">Capacity</div>
                                <div className="font-semibold text-[var(--ink)]">
                                  {variant.capacityPerUnit
                                    ? `${variant.capacityPerUnit} pax / ${variant.unitLabel}`
                                    : `1 pax / ${variant.unitLabel}`}
                                </div>
                              </div>
                              <div>
                                <div className="text-[var(--ink-sub)] mb-1 uppercase tracking-widest text-[9px] font-bold opacity-60">Total units</div>
                                <div className="font-semibold text-[var(--ink)]">
                                  {variant.totalUnits}
                                </div>
                              </div>
                              <div>
                                <div className="text-[var(--ink-sub)] mb-1 uppercase tracking-widest text-[9px] font-bold opacity-60">Buffer</div>
                                <div className="font-semibold text-[var(--ink)]">
                                  {variant.bufferUnits}
                                </div>
                              </div>
                              <div>
                                <div className="text-[var(--ink-sub)] mb-1 uppercase tracking-widest text-[9px] font-bold opacity-60">Available</div>
                                <div className="font-bold text-emerald-700">
                                  {getAvailableUnits(variant)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditingVariant(variant)}
                              className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--cream-50)]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleMaintenance(variant.id)}
                              className={cx(
                                "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                                variant.status === "active"
                                  ? "border-[var(--terracotta)]/30 bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)] hover:bg-[var(--terracotta)]/10"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                              )}
                            >
                              {variant.status === "active"
                                ? "Maintenance"
                                : "Set active"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(variant.id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
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
              <div className="rounded-xl border border-[var(--line)] bg-white p-12 text-center shadow-sm">
                <div className="text-sm text-[var(--ink-sub)] italic opacity-50">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-[var(--green-900)]">
              Set maintenance units
            </div>
            <div className="mt-1 text-xs text-[var(--ink-sub)] opacity-70">{variant.name}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-sub)] hover:text-[var(--green-900)] transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--green-900)] mb-2 opacity-70">
              How many units are under maintenance?
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              min="0"
              max={maxUnits}
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
              autoFocus
            />
            <div className="mt-2 text-[10px] text-[var(--ink-sub)] opacity-50">
              Range: 0 to {maxUnits} (total units).
            </div>
            {!isValid && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                Please enter a number between 0 and {maxUnits}.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--line)] bg-[var(--cream-50)]/50 p-4 text-xs">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <span className="text-[var(--ink-sub)] opacity-60">Total units:</span>{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {variant.totalUnits}
                </span>
              </div>
              <div>
                <span className="text-[var(--ink-sub)] opacity-60">Buffer:</span>{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {variant.bufferUnits}
                </span>
              </div>
              <div>
                <span className="text-[var(--ink-sub)] opacity-60">Maintenance:</span>{" "}
                <span className="font-bold text-[var(--terracotta-dark)]">{numValue}</span>
              </div>
              <div>
                <span className="text-[var(--ink-sub)] opacity-60">Available:</span>{" "}
                <span className="font-bold text-emerald-700">
                  {Math.max(
                    0,
                    variant.totalUnits - variant.bufferUnits - numValue,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={cx(
              "rounded-lg px-6 py-2 text-sm font-bold shadow-sm transition-all",
              isValid
                ? "bg-[var(--green-900)] text-white hover:opacity-90"
                : "cursor-not-allowed bg-neutral-200 text-neutral-500 shadow-none",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-lg font-bold text-[var(--green-900)]">
            {variant.id.startsWith("var-") && !variant.name
              ? "Add variant"
              : "Edit variant"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-sub)] hover:text-[var(--green-900)] transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--green-900)] mb-1.5 opacity-70">
              Variant name <span className="text-[var(--terracotta)]">*</span>
            </label>
            <input
              type="text"
              value={edited.name}
              onChange={(e) => setEdited({ ...edited, name: e.target.value })}
              placeholder="e.g., Sport (1-seat)"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--green-900)] mb-1.5 opacity-70">
              Capacity per unit (people)
            </label>
            <input
              type="number"
              value={edited.capacityPerUnit ?? ""}
              onChange={(e) =>
                setEdited({
                  ...edited,
                  capacityPerUnit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="e.g., 1 or 2"
              min="1"
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
            />
            <div className="mt-1.5 text-[10px] text-[var(--ink-sub)] opacity-50 italic">
              How many people can use this unit? Leave empty if not applicable.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--green-900)] mb-1.5 opacity-70">
              Unit label
            </label>
            <select
              value={edited.unitLabel}
              onChange={(e) =>
                setEdited({
                  ...edited,
                  unitLabel: e.target.value as ResourceVariant["unitLabel"],
                })
              }
              className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
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
              <label className="block text-xs font-semibold text-[var(--green-900)] mb-1.5 opacity-70">
                Total units
              </label>
              <input
                type="number"
                value={edited.totalUnits}
                onChange={(e) =>
                  setEdited({
                    ...edited,
                    totalUnits: Number(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--green-900)] mb-1.5 opacity-70">
                Buffer units
              </label>
              <input
                type="number"
                value={edited.bufferUnits}
                onChange={(e) =>
                  setEdited({
                    ...edited,
                    bufferUnits: Number(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--green-800)]"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[var(--green-900)] px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
