"use client";

import React, { useMemo, useState } from "react";
import { useProductDraft } from "@/lib/productStore";
import type { ProductDraft as StoreProductDraft } from "@/lib/productStore";

type Step = "start" | "editor";

type Confidence = "high" | "medium" | "low";

type FieldScore = {
  key: keyof ProductDraft;
  label: string;
  confidence: Confidence;
  note?: string;
};

type ProductDraft = {
  title: string;
  categoryMain: "Outdoor" | "Indoor" | "";
  categorySub: string;
  locationName: string;
  address: string;
  durationMinutes: number | null;
  priceFrom: number | null;
  currency: "EUR" | "SEK" | "NOK" | "DKK";
  capacityMode: "per_departure" | "per_resource";
  capacityMax: number | null;

  meetingPoint: string;
  language: string[];
  included: string;
  notIncluded: string;
  requirements: string;
  cancellationPolicyTemplate: "Flexible" | "Standard" | "Strict" | "";
  description: string;

  coverImageNote: string; // MVP: no file upload yet, just placeholder text
  availabilityRule: string; // MVP: simple rule text
  resourcesNote: string; // MVP: simple note text

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
  
  // Pricing options
  pricingOptions?: Array<{ id: string; name: string; price: number }>;
  exampleBooking?: Record<string, number>;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function confidenceBadge(c: Confidence) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs";
  if (c === "high")
    return cx(base, "border-emerald-200 bg-emerald-50 text-emerald-700");
  if (c === "medium")
    return cx(base, "border-amber-200 bg-amber-50 text-amber-700");
  return cx(base, "border-red-200 bg-red-50 text-red-700");
}

function isRequiredMissing(d: ProductDraft) {
  const missing: Array<{ key: keyof ProductDraft; label: string }> = [];
  if (!d.title.trim()) missing.push({ key: "title", label: "Title" });
  if (!d.categoryMain) missing.push({ key: "categoryMain", label: "Category" });
  if (!d.locationName.trim())
    missing.push({ key: "locationName", label: "Location" });
  if (!d.address.trim()) missing.push({ key: "address", label: "Address" });
  if (!d.durationMinutes) missing.push({ key: "durationMinutes", label: "Duration" });
  if (!d.priceFrom) missing.push({ key: "priceFrom", label: "Price (from)" });
  if (!d.capacityMax) missing.push({ key: "capacityMax", label: "Capacity" });
  if (!d.cancellationPolicyTemplate)
    missing.push({ key: "cancellationPolicyTemplate", label: "Cancellation policy" });
  if (!d.coverImageNote.trim())
    missing.push({ key: "coverImageNote", label: "Cover image" });
  
  // Resources validation
  if (d.requiresResources) {
    if (!d.resourceType) missing.push({ key: "resourceType" as keyof ProductDraft, label: "Resource type" });
    if (d.resourceType === "snowmobiles") {
      if (!d.snowmobiles || d.snowmobiles.sport.total < 0 || d.snowmobiles.touring.total < 0) {
        missing.push({ key: "snowmobiles" as keyof ProductDraft, label: "Snowmobile inventory" });
      }
    }
  }
  
  return missing;
}

const EMPTY_DRAFT: ProductDraft = {
  title: "",
  categoryMain: "",
  categorySub: "",
  locationName: "",
  address: "",
  durationMinutes: null,
  priceFrom: null,
  currency: "EUR",
  capacityMode: "per_departure",
  capacityMax: null,

  meetingPoint: "",
  language: ["FI", "EN"],
  included: "",
  notIncluded: "",
  requirements: "",
  cancellationPolicyTemplate: "",
  description: "",

  coverImageNote: "",
  availabilityRule: "Fixed departures (MVP) — you can add times after publishing.",
  resourcesNote:
    "MVP: attach resources later in Availability/Departures (guides, snowmobiles, e-bikes).",
  
  requiresResources: false,
  guidesPerDeparture: 1,
};

const AI_EXTRACTED_DRAFT_SNOWMOBILE: ProductDraft = {
  title: "Snowmobile Safari – Sport & Touring",
  categoryMain: "Outdoor",
  categorySub: "Snowmobile",
  locationName: "Tahko",
  address: "Tahkomäentie 100, 73310 Tahkovuori",
  durationMinutes: 120,
  priceFrom: 149,
  currency: "EUR",
  capacityMode: "per_resource",
  capacityMax: 12,

  meetingPoint: "Safari house, 10 min before start",
  language: ["FI", "EN"],
  included: "Guide, helmet, warm overalls, fuel",
  notIncluded: "Meals, transport to Tahko",
  requirements: "Driving license required for driver. Minimum age 18 for driving.",
  cancellationPolicyTemplate: "Standard",
  description: "Experience the thrill of snowmobiling through pristine winter landscapes. Choose between solo Sport (1-seat) or shared Touring (2-seat) options. Professional guide included.",

  coverImageNote: "Add a cover image (required) — upload after draft creation.",
  availabilityRule: "Fixed departures + on request (later). Start with fixed times.",
  resourcesNote:
    "Uses snowmobiles by variant (Sport 1-seat / Touring 2-seat). Mark units out-of-service when needed.",
  
  requiresResources: true,
  resourceType: "snowmobiles",
  snowmobiles: {
    sport: { total: 5, outOfService: 0 },
    touring: { total: 5, outOfService: 0 },
  },
  guidesPerDeparture: 1,
  pricingOptions: [
    { id: "solo", name: "Solo rider (Sport)", price: 149 },
    { id: "shared", name: "Shared rider (Touring)", price: 199 },
  ],
  exampleBooking: {
    solo: 2,
    shared: 1,
  },
};

const AI_EXTRACTED_DRAFT_HIKING: ProductDraft = {
  title: "Guided Hiking Tour – Nuuksio National Park",
  categoryMain: "Outdoor",
  categorySub: "Hiking",
  locationName: "Nuuksio",
  address: "Nuuksiontie 84, 02820 Espoo",
  durationMinutes: 240,
  priceFrom: 65,
  currency: "EUR",
  capacityMode: "per_departure",
  capacityMax: 12,

  meetingPoint: "Nuuksio National Park visitor center",
  language: ["FI", "EN"],
  included: "Professional guide, route map, safety briefing",
  notIncluded: "Transportation, meals, equipment rental",
  requirements: "Good physical condition, suitable hiking shoes, weather-appropriate clothing",
  cancellationPolicyTemplate: "Flexible",
  description: "Explore the beautiful trails of Nuuksio National Park with an experienced guide. Suitable for all fitness levels. Discover local flora and fauna while enjoying the peaceful Nordic nature.",

  coverImageNote: "Add a cover image (required) — upload after draft creation.",
  availabilityRule: "Fixed departures (MVP) — you can add times after publishing.",
  resourcesNote: "No equipment required. Guide provided.",
  
  requiresResources: false,
  guidesPerDeparture: 1,
  pricingOptions: [
    { id: "adult", name: "Adult", price: 65 },
    { id: "child", name: "Child (under 12)", price: 35 },
  ],
  exampleBooking: {
    adult: 3,
    child: 1,
  },
};

const AI_SCORES: FieldScore[] = [
  { key: "title", label: "Title", confidence: "high" },
  { key: "categoryMain", label: "Category", confidence: "medium", note: "Detected from brochure keywords" },
  { key: "locationName", label: "Location", confidence: "high" },
  { key: "address", label: "Address", confidence: "medium", note: "Please verify exact street address" },
  { key: "durationMinutes", label: "Duration", confidence: "high" },
  { key: "priceFrom", label: "Price (from)", confidence: "medium", note: "Confirm VAT / seasonal pricing" },
  { key: "capacityMax", label: "Capacity", confidence: "low", note: "Capacity depends on resource variants" },
  { key: "meetingPoint", label: "Meeting point", confidence: "medium" },
  { key: "requirements", label: "Requirements", confidence: "medium" },
  { key: "cancellationPolicyTemplate", label: "Cancellation policy", confidence: "medium" },
  { key: "coverImageNote", label: "Cover image", confidence: "low", note: "No media found in import" },
];

export default function ProviderProductNewPage() {
  const { draft: storeDraft, setDraft: setStoreDraft, setField, resetDraft } = useProductDraft();
  
  // Map store draft to local ProductDraft type (they're compatible but TypeScript needs help)
  const draft = storeDraft as unknown as ProductDraft;
  
  const [step, setStep] = useState<Step>("start");
  const [importMode, setImportMode] = useState<"ai" | "manual">("ai");

  const [droppedName, setDroppedName] = useState<string>("");
  const [urlValue, setUrlValue] = useState<string>("");

  const [isAIDraft, setIsAIDraft] = useState<boolean>(false);
  const [aiDraftCreated, setAiDraftCreated] = useState<boolean>(false);

  const missingRequired = useMemo(() => isRequiredMissing(draft), [draft]);

  const canProceedToEditor = useMemo(() => {
    if (importMode === "manual") return true;
    // AI mode needs at least something dropped or URL
    return Boolean(droppedName.trim() || urlValue.trim());
  }, [importMode, droppedName, urlValue]);

  function startManual() {
    setImportMode("manual");
    setIsAIDraft(false);
    resetDraft();
    setAiDraftCreated(false);
    setStep("editor");
  }

  function createAIDraft(draftType: "snowmobile" | "hiking" = "snowmobile") {
    setImportMode("ai");
    setIsAIDraft(true);
    const aiDraft = draftType === "snowmobile" ? AI_EXTRACTED_DRAFT_SNOWMOBILE : AI_EXTRACTED_DRAFT_HIKING;
    setStoreDraft(aiDraft as unknown as StoreProductDraft);
    setAiDraftCreated(true);
    setStep("editor");
  }

  function resetToStart() {
    setStep("start");
    setIsAIDraft(false);
    resetDraft();
    setDroppedName("");
    setUrlValue("");
    setAiDraftCreated(false);
  }

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setField(key as keyof StoreProductDraft, value);
  }

  const publishDisabled = missingRequired.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white">
              <span className="text-sm font-semibold">P</span>
            </div>
            <div>
              <div className="text-lg font-medium text-neutral-900">Add product</div>
              <div className="text-sm text-neutral-500">
                Create a draft fast, verify the essentials, publish without chaos.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700 md:inline-flex">
              Infrastructure-first • Provider MVP
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        {step === "start" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: AI import */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-neutral-900">A) AI import (P0)</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    Drop a brochure or link. We extract a draft — you review & publish.
                  </div>
                </div>
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                  Draft only — never auto-publish
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="md:col-span-3">
                  <div
                    className={cx(
                      "flex min-h-[168px] flex-col items-center justify-center rounded-xl border border-dashed px-4 text-center",
                      "border-neutral-300 bg-neutral-50"
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) setDroppedName(f.name);
                    }}
                  >
                    <div className="text-sm font-medium text-neutral-900">
                      Drop PDF / JPG / PNG / DOCX
                    </div>
                    <div className="mt-1 text-sm text-neutral-600">
                      Or paste a URL on the right.
                    </div>

                    <div className="mt-4 w-full">
                      <label className="block text-left text-xs text-neutral-500">
                        Selected file (mock)
                      </label>
                      <div className="mt-1 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2">
                        <span className="text-sm text-neutral-700">
                          {droppedName ? droppedName : "No file selected"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDroppedName("")}
                          className="text-xs text-neutral-500 hover:text-neutral-700"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-neutral-500">
                    MVP: this is UI-only. Later: upload + AI parsing pipeline.
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-neutral-900">Or import from URL</label>
                  <div className="mt-2">
                    <input
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      placeholder="https://... (provider website / PDF link)"
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="text-sm font-medium text-neutral-900">AI extracts</div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
                      <li>Title, description, duration, location, meeting point</li>
                      <li>Price, capacity hints, included / not included</li>
                      <li>Requirements, cancellation policy suggestion</li>
                    </ul>
                    <div className="mt-3 text-xs text-neutral-500">
                      You always review before publish. 👍
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canProceedToEditor}
                    onClick={() => createAIDraft("snowmobile")}
                    className={cx(
                      "mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-medium",
                      canProceedToEditor
                        ? "bg-neutral-900 text-white hover:bg-neutral-800"
                        : "cursor-not-allowed bg-neutral-200 text-neutral-500"
                    )}
                  >
                    Create AI draft → Review & publish
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => createAIDraft("snowmobile")}
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Use example import (Snowmobile)
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => createAIDraft("hiking")}
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Use example import (Hiking)
                  </button>
                </div>
              </div>
            </section>

            {/* Right: Manual */}
            <aside className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-900">B) Start from scratch (P0)</div>
              <div className="mt-1 text-sm text-neutral-600">
                Use the same editor, without prefill.
              </div>

              <button
                type="button"
                onClick={startManual}
                className="mt-4 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
              >
                Start manually → Editor
              </button>

              <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-sm font-medium text-neutral-900">Legal (important)</div>
                <div className="mt-2 text-sm text-neutral-700">
                  This product must be <span className="font-medium">your own service</span>. No bundling
                  other providers into one product.
                </div>
                <div className="mt-2 text-xs text-neutral-500">
                  Cross-sell later = recommendations/link-outs, not packaged checkout.
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Editor */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-neutral-900">Product editor</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {isAIDraft ? (
                      <>
                        <span className="font-medium">AI draft</span> — review essentials, then publish.
                      </>
                    ) : (
                      <>Manual draft — fill essentials, then publish.</>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {aiDraftCreated && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                      AI draft created
                    </span>
                  )}
                  {isAIDraft && (
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                      AI confidence per field
                    </span>
                  )}
                  <span
                    className={cx(
                      "rounded-full border px-3 py-1 text-xs",
                      publishDisabled
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    )}
                  >
                    {publishDisabled ? "Needs review" : "Ready to publish"}
                  </span>
                </div>
              </div>

              {/* Form grid */}
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Title */}
                <Field label="Title" required>
                  <input
                    value={draft.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g., Snowmobile Safari – Sport"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Category */}
                <Field label="Category" required>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={draft.categoryMain}
                      onChange={(e) => update("categoryMain", e.target.value as any)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    >
                      <option value="">Select</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Indoor">Indoor</option>
                    </select>
                    <input
                      value={draft.categorySub}
                      onChange={(e) => update("categorySub", e.target.value)}
                      placeholder="e.g., Snowmobile / Sauna / City Tour"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                </Field>

                {/* Location */}
                <Field label="Location" required>
                  <input
                    value={draft.locationName}
                    onChange={(e) => update("locationName", e.target.value)}
                    placeholder="e.g., Helsinki / Tahko"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Address */}
                <Field label="Address" required>
                  <input
                    value={draft.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                  <div className="mt-1 text-xs text-neutral-500">
                    MVP: map pin later. Keep it copyable for customers.
                  </div>
                </Field>

                {/* Duration */}
                <Field label="Duration (minutes)" required>
                  <input
                    value={draft.durationMinutes ?? ""}
                    onChange={(e) => update("durationMinutes", e.target.value ? Number(e.target.value) : null)}
                    inputMode="numeric"
                    placeholder="e.g., 120"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Price */}
                <Field label="Price from" required>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={draft.priceFrom ?? ""}
                      onChange={(e) => update("priceFrom", e.target.value ? Number(e.target.value) : null)}
                      inputMode="decimal"
                      placeholder="e.g., 149"
                      className="col-span-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                    <select
                      value={draft.currency}
                      onChange={(e) => update("currency", e.target.value as any)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    >
                      <option value="EUR">EUR</option>
                      <option value="SEK">SEK</option>
                      <option value="NOK">NOK</option>
                      <option value="DKK">DKK</option>
                    </select>
                  </div>
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    placeholder="Describe the experience, what's included, meeting point, etc."
                    className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Capacity */}
                <Field label="Capacity" required>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={draft.capacityMode}
                      onChange={(e) => update("capacityMode", e.target.value as any)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    >
                      <option value="per_departure">Per departure</option>
                      <option value="per_resource">Per resource</option>
                    </select>
                    <input
                      value={draft.capacityMax ?? ""}
                      onChange={(e) => update("capacityMax", e.target.value ? Number(e.target.value) : null)}
                      inputMode="numeric"
                      placeholder="Max guests"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    If capacity depends on vehicles/equipment, choose "Per resource". You'll allocate variants in Availability.
                  </div>
                </Field>

                {/* Meeting point */}
                <Field label="Meeting point">
                  <input
                    value={draft.meetingPoint}
                    onChange={(e) => update("meetingPoint", e.target.value)}
                    placeholder="Where customers meet"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Cancellation */}
                <Field label="Cancellation policy" required>
                  <select
                    value={draft.cancellationPolicyTemplate}
                    onChange={(e) => update("cancellationPolicyTemplate", e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  >
                    <option value="">Select</option>
                    <option value="Flexible">Flexible</option>
                    <option value="Standard">Standard</option>
                    <option value="Strict">Strict</option>
                  </select>
                  <div className="mt-1 text-xs text-neutral-500">
                    MVP: template now, full policy text later.
                  </div>
                </Field>

                {/* Included */}
                <Field label="What's included">
                  <textarea
                    value={draft.included}
                    onChange={(e) => update("included", e.target.value)}
                    rows={3}
                    placeholder="e.g., Guide, equipment, snacks"
                    className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Requirements */}
                <Field label="Requirements / safety">
                  <textarea
                    value={draft.requirements}
                    onChange={(e) => update("requirements", e.target.value)}
                    rows={3}
                    placeholder="e.g., Driving license, minimum age, basic fitness"
                    className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </Field>

                {/* Availability rule */}
                <Field label="Availability">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                    Availability is managed in{" "}
                    <a href="/provider/availability" className="text-neutral-900 underline hover:text-neutral-700">
                      Availability page
                    </a>
                  </div>
                </Field>

                {/* Pricing options */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-900">
                      Pricing options
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newOption = { id: `opt-${Date.now()}`, name: "", price: 0 };
                        update("pricingOptions", [...(draft.pricingOptions || []), newOption]);
                      }}
                      className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      + Add option
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(draft.pricingOptions || []).map((opt) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          value={opt.name}
                          onChange={(e) => {
                            update("pricingOptions", (draft.pricingOptions || []).map((o) =>
                              o.id === opt.id ? { ...o, name: e.target.value } : o
                            ));
                          }}
                          placeholder="Option name"
                          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                        />
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => {
                            update("pricingOptions", (draft.pricingOptions || []).map((o) =>
                              o.id === opt.id ? { ...o, price: Number(e.target.value) || 0 } : o
                            ));
                          }}
                          placeholder="Price"
                          className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            update("pricingOptions", (draft.pricingOptions || []).filter((o) => o.id !== opt.id));
                          }}
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {(!draft.pricingOptions || draft.pricingOptions.length === 0) && (
                      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3 text-center text-sm text-neutral-500">
                        No pricing options. Base price will be used.
                      </div>
                    )}
                  </div>
                </div>

                {/* Resources section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-900">
                      Resources (optional)
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.requiresResources}
                        onChange={(e) => {
                          update("requiresResources", e.target.checked);
                          if (!e.target.checked) {
                            update("resourceType", undefined);
                            update("snowmobiles", undefined);
                            update("ebikes", undefined);
                          }
                        }}
                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-200"
                      />
                      <span className="text-sm text-neutral-700">This product requires resources</span>
                    </label>
                  </div>
                  
                  {!draft.requiresResources ? (
                    <div className="mt-2 text-xs text-neutral-500">
                      Examples: hiking, courses, workshops
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700">Resource type</label>
                        <select
                          value={draft.resourceType || ""}
                          onChange={(e) => {
                            const rt = e.target.value as ProductDraft["resourceType"];
                            update("resourceType", rt);
                            if (rt === "snowmobiles") {
                              update("snowmobiles", {
                                sport: { total: 5, outOfService: 0 },
                                touring: { total: 5, outOfService: 0 },
                              });
                            }
                          }}
                          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                        >
                          <option value="">Select</option>
                          <option value="snowmobiles">Snowmobiles</option>
                          <option value="ebikes">E-bikes</option>
                          <option value="guides_only">Guides only</option>
                          <option value="other">Other equipment (later)</option>
                        </select>
                      </div>

                      {draft.resourceType === "snowmobiles" && draft.snowmobiles && (
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                          <div className="text-sm font-medium text-neutral-900">Snowmobiles inventory</div>
                          <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-neutral-700">Sport (1-seat)</label>
                              <div className="mt-1 grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  value={draft.snowmobiles.sport.total}
                                  onChange={(e) => {
                                    update("snowmobiles", {
                                      ...draft.snowmobiles!,
                                      sport: { ...draft.snowmobiles!.sport, total: Number(e.target.value) || 0 },
                                    });
                                  }}
                                  placeholder="Total"
                                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                />
                                <input
                                  type="number"
                                  value={draft.snowmobiles.sport.outOfService}
                                  onChange={(e) => {
                                    update("snowmobiles", {
                                      ...draft.snowmobiles!,
                                      sport: { ...draft.snowmobiles!.sport, outOfService: Number(e.target.value) || 0 },
                                    });
                                  }}
                                  placeholder="Out of service"
                                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-neutral-700">Touring (2-seat)</label>
                              <div className="mt-1 grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  value={draft.snowmobiles.touring.total}
                                  onChange={(e) => {
                                    update("snowmobiles", {
                                      ...draft.snowmobiles!,
                                      touring: { ...draft.snowmobiles!.touring, total: Number(e.target.value) || 0 },
                                    });
                                  }}
                                  placeholder="Total"
                                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                />
                                <input
                                  type="number"
                                  value={draft.snowmobiles.touring.outOfService}
                                  onChange={(e) => {
                                    update("snowmobiles", {
                                      ...draft.snowmobiles!,
                                      touring: { ...draft.snowmobiles!.touring, outOfService: Number(e.target.value) || 0 },
                                    });
                                  }}
                                  placeholder="Out of service"
                                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-neutral-600">
                            <div>Rule: Sport = 1 person per unit, Touring = 2 persons per unit</div>
                          </div>
                        </div>
                      )}

                      {draft.resourceType === "guides_only" && (
                        <div>
                          <label className="block text-xs font-medium text-neutral-700">Guides per departure</label>
                          <input
                            type="number"
                            value={draft.guidesPerDeparture ?? 1}
                            onChange={(e) => update("guidesPerDeparture", Number(e.target.value) || 1)}
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cover image note */}
                <Field label="Cover image" required>
                  <input
                    value={draft.coverImageNote}
                    onChange={(e) => update("coverImageNote", e.target.value)}
                    placeholder="MVP note: add later (required for publish)"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                  <div className="mt-1 text-xs text-neutral-500">
                    MVP: we store a placeholder note. Later: real upload + gallery.
                  </div>
                </Field>

                {/* Add-ons legal */}
                <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-sm font-medium text-neutral-900">Add-ons (later)</div>
                  <div className="mt-1 text-sm text-neutral-700">
                    Add-ons must be <span className="font-medium">your own services</span>. No bundling other providers into the same checkout.
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Cross-sell later = recommendations/link-outs with clear provider separation.
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    onClick={() => {
                      console.log("Product draft:", draft);
                      alert("Saved (MVP): product draft logged to console");
                    }}
                  >
                    Save draft
                  </button>

                  <button
                    type="button"
                    disabled={publishDisabled}
                    className={cx(
                      "rounded-lg px-4 py-2 text-sm font-medium",
                      publishDisabled
                        ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                        : "bg-neutral-900 text-white hover:bg-neutral-800"
                    )}
                    onClick={() => alert("MVP: published (mock)")}
                  >
                    Publish
                  </button>
                </div>
              </div>

              {missingRequired.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-medium text-amber-900">Missing required fields</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-amber-900/90">
                    {missingRequired.map((m) => (
                      <li key={String(m.key)}>{m.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Right: Preview + Quality checks */}
            <aside className="rounded-xl border border-neutral-200 bg-white p-6">
              <div className="text-sm font-medium text-neutral-900">Live preview</div>
              <div className="mt-1 text-sm text-neutral-600">
                How customers see it (compact + detailed).
              </div>

              {/* Preview card */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                <div className="text-xs text-neutral-500">Card preview</div>
                <div className="mt-2">
                  <div className="text-sm font-medium text-neutral-900">
                    {draft.title || "Untitled product"}
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {(draft.locationName || "Location") + " • " + formatDuration(draft.durationMinutes)}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-900">
                      {draft.priceFrom ? `${draft.priceFrom} ${draft.currency}` : "Price not set"}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Cap: {draft.capacityMax ?? "—"}
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                    Cover image: {draft.coverImageNote ? "OK" : "Missing"}
                  </div>
                </div>
              </div>

              {/* Preview list */}
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                <div className="text-xs text-neutral-500">Detail preview</div>
                <div className="mt-2 space-y-2 text-sm text-neutral-700">
                  <div>
                    <span className="text-neutral-500">Meeting point:</span>{" "}
                    {draft.meetingPoint || "—"}
                  </div>
                  <div>
                    <span className="text-neutral-500">Cancellation:</span>{" "}
                    {draft.cancellationPolicyTemplate || "—"}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Availability: {draft.availabilityRule}
                  </div>
                </div>
              </div>

              {/* Resources preview */}
              {draft.requiresResources && draft.resourceType === "snowmobiles" && draft.snowmobiles && (
                <div className="mt-6">
                  <div className="text-sm font-medium text-neutral-900">Auto allocation preview</div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-xs text-neutral-500">Example booking</div>
                      <div className="mt-2 space-y-1 text-sm text-neutral-700">
                        {draft.exampleBooking && Object.entries(draft.exampleBooking).map(([id, qty]) => {
                          const opt = draft.pricingOptions?.find((o) => o.id === id);
                          if (!opt) return null;
                          return (
                            <div key={id}>
                              {qty}× {opt.name} ({opt.price} EUR)
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {draft.exampleBooking && (
                      <div>
                        <div className="text-xs text-neutral-500">Allocation totals</div>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                            <span className="text-sm text-neutral-700">Sport snowmobiles</span>
                            <span className="text-sm font-medium text-neutral-900">
                              {draft.exampleBooking.solo || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                            <span className="text-sm text-neutral-700">Touring snowmobiles</span>
                            <span className="text-sm font-medium text-neutral-900">
                              {Math.ceil((draft.exampleBooking.shared || 0) / 2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                            <span className="text-sm text-neutral-700">Guides</span>
                            <span className="text-sm font-medium text-neutral-900">
                              {draft.guidesPerDeparture || 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quality checks */}
              <div className="mt-6">
                <div className="text-sm font-medium text-neutral-900">Quality checks</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Prevent bad data before it hits operations.
                </div>

                <div className="mt-3 space-y-3">
                  {/* Missing */}
                  <div
                    className={cx(
                      "rounded-xl border p-4",
                      missingRequired.length > 0
                        ? "border-amber-200 bg-amber-50"
                        : "border-emerald-200 bg-emerald-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium">
                          {missingRequired.length > 0 ? "Missing required" : "Required fields OK"}
                        </div>
                        <div className="mt-1 text-sm">
                          {missingRequired.length > 0
                            ? "Fix these before publishing."
                            : "You can publish safely."}
                        </div>
                      </div>
                      <span
                        className={cx(
                          "rounded-full border px-3 py-1 text-xs",
                          missingRequired.length > 0
                            ? "border-amber-200 bg-white text-amber-700"
                            : "border-emerald-200 bg-white text-emerald-700"
                        )}
                      >
                        {missingRequired.length > 0 ? `${missingRequired.length} missing` : "OK"}
                      </span>
                    </div>
                  </div>

                  {/* AI confidence list */}
                  {isAIDraft && (
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <div className="text-sm font-medium text-neutral-900">AI confidence</div>
                      <div className="mt-2 space-y-2">
                        {AI_SCORES.map((s) => (
                          <div key={String(s.key)} className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm text-neutral-900">{s.label}</div>
                              {s.note && <div className="text-xs text-neutral-500">{s.note}</div>}
                            </div>
                            <span className={confidenceBadge(s.confidence)}>
                              {s.confidence === "high" ? "High" : s.confidence === "medium" ? "Medium" : "Low"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conflicts (simple MVP logic) */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="text-sm font-medium text-neutral-900">Conflict checks (MVP)</div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
                      <li>
                        If capacity is "per resource", allocate variants in Availability to avoid overbooking.
                      </li>
                      <li>
                        Keep meeting point precise — reduces support messages.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-900">
          {label} {required ? <span className="text-amber-700">*</span> : null}
        </label>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "Duration not set";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
