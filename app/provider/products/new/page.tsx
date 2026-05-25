"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductDraft } from "@/lib/productStore";
import type { ProductDraft as StoreProductDraft } from "@/lib/productStore";
import TiptapEditor from "@/app/components/provider/TiptapEditor";

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
    sizes: Record<
      "S" | "M" | "L" | "XL" | "XXL",
      { total: number; outOfService: number }
    >;
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
    "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider";
  if (c === "high")
    return cx(base, "border-emerald-200 bg-emerald-50 text-emerald-700");
  if (c === "medium")
    return cx(base, "border-[var(--terracotta)]/20 bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)]");
  return cx(base, "border-red-200 bg-red-50 text-red-700");
}

function isRequiredMissing(d: ProductDraft) {
  const missing: Array<{ key: keyof ProductDraft; label: string }> = [];
  if (!d.title.trim()) missing.push({ key: "title", label: "Title" });
  if (!d.categoryMain) missing.push({ key: "categoryMain", label: "Category" });
  if (!d.locationName.trim())
    missing.push({ key: "locationName", label: "Location" });
  if (!d.address.trim()) missing.push({ key: "address", label: "Address" });
  if (!d.durationMinutes)
    missing.push({ key: "durationMinutes", label: "Duration" });
  if (!d.priceFrom) missing.push({ key: "priceFrom", label: "Price (from)" });
  if (!d.capacityMax) missing.push({ key: "capacityMax", label: "Capacity" });
  if (!d.cancellationPolicyTemplate)
    missing.push({
      key: "cancellationPolicyTemplate",
      label: "Cancellation policy",
    });
  if (!d.coverImageNote.trim())
    missing.push({ key: "coverImageNote", label: "Cover image" });

  // Resources validation
  if (d.requiresResources) {
    if (!d.resourceType)
      missing.push({
        key: "resourceType" as keyof ProductDraft,
        label: "Resource type",
      });
    if (d.resourceType === "snowmobiles") {
      if (
        !d.snowmobiles ||
        d.snowmobiles.sport.total < 0 ||
        d.snowmobiles.touring.total < 0
      ) {
        missing.push({
          key: "snowmobiles" as keyof ProductDraft,
          label: "Snowmobile inventory",
        });
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
  availabilityRule:
    "Fixed departures (MVP) — you can add times after publishing.",
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
  requirements:
    "Driving license required for driver. Minimum age 18 for driving.",
  cancellationPolicyTemplate: "Standard",
  description:
    "Experience the thrill of snowmobiling through pristine winter landscapes. Choose between solo Sport (1-seat) or shared Touring (2-seat) options. Professional guide included.",

  coverImageNote: "Add a cover image (required) — upload after draft creation.",
  availabilityRule:
    "Fixed departures + on request (later). Start with fixed times.",
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
  requirements:
    "Good physical condition, suitable hiking shoes, weather-appropriate clothing",
  cancellationPolicyTemplate: "Flexible",
  description:
    "Explore the beautiful trails of Nuuksio National Park with an experienced guide. Suitable for all fitness levels. Discover local flora and fauna while enjoying the peaceful Nordic nature.",

  coverImageNote: "Add a cover image (required) — upload after draft creation.",
  availabilityRule:
    "Fixed departures (MVP) — you can add times after publishing.",
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
  {
    key: "categoryMain",
    label: "Category",
    confidence: "medium",
    note: "Detected from brochure keywords",
  },
  { key: "locationName", label: "Location", confidence: "high" },
  {
    key: "address",
    label: "Address",
    confidence: "medium",
    note: "Please verify exact street address",
  },
  { key: "durationMinutes", label: "Duration", confidence: "high" },
  {
    key: "priceFrom",
    label: "Price (from)",
    confidence: "medium",
    note: "Confirm VAT / seasonal pricing",
  },
  {
    key: "capacityMax",
    label: "Capacity",
    confidence: "low",
    note: "Capacity depends on resource variants",
  },
  { key: "meetingPoint", label: "Meeting point", confidence: "medium" },
  { key: "requirements", label: "Requirements", confidence: "medium" },
  {
    key: "cancellationPolicyTemplate",
    label: "Cancellation policy",
    confidence: "medium",
  },
  {
    key: "coverImageNote",
    label: "Cover image",
    confidence: "low",
    note: "No media found in import",
  },
];

export default function ProviderProductNewPage() {
  const router = useRouter();
  const {
    draft: storeDraft,
    setDraft: setStoreDraft,
    setField,
    resetDraft,
  } = useProductDraft();

  // Map store draft to local ProductDraft type (they're compatible but TypeScript needs help)
  const draft = storeDraft as unknown as ProductDraft;

  const [step, setStep] = useState<Step>("start");
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    const aiDraft =
      draftType === "snowmobile"
        ? AI_EXTRACTED_DRAFT_SNOWMOBILE
        : AI_EXTRACTED_DRAFT_HIKING;
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

  function update<K extends keyof ProductDraft>(
    key: K,
    value: ProductDraft[K],
  ) {
    setField(key as keyof StoreProductDraft, value);
  }

  async function handleSave() {
    setSaveError(null);
    setSubmitting(true);
    try {
      const totalMinutes = draft.durationMinutes ?? 0;
      const res = await fetch("/api/provider/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.title,
          description: draft.description,
          languages: draft.language,
          type: draft.categorySub
            ? draft.categorySub.toLowerCase().replace(/\s+/g, "_")
            : draft.categoryMain
              ? draft.categoryMain.toLowerCase()
              : "experience",
          accessible: false,
          price_from: draft.priceFrom,
          capacity_max: draft.capacityMax,
          duration_hours:
            totalMinutes >= 60 ? Math.floor(totalMinutes / 60) : null,
          duration_minutes: totalMinutes % 60 || null,
          city: draft.locationName || null,
          street_name: draft.address || null,
          available_months: [],
          tags:
            draft.pricingOptions
              ?.map((o) => o.name.toLowerCase().replace(/\s+/g, "_"))
              .filter(Boolean) ?? [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveError(json.error ?? "Save failed");
        return;
      }
      resetDraft();
      router.push(`/provider/products/${json.id}/edit`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  const publishDisabled = missingRequired.length > 0;

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Header */}
      <header className="border-b border-[var(--line)] bg-white px-6 py-4 sticky top-0 z-20">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green-900)] text-white shadow-lg">
              <span className="text-lg font-bold">P</span>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--green-900)] tracking-tight">
                Add Product
              </div>
              <div className="text-xs text-[var(--ink-sub)] font-medium opacity-70">
                Create a draft fast, verify the essentials, publish without
                chaos.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[var(--line)] bg-[var(--cream-50)] px-3 py-1 text-[10px] font-bold text-[var(--green-900)] uppercase tracking-widest md:inline-flex shadow-sm">
              Infrastructure-first • Provider MVP
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        {step === "start" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: AI import */}
            <section className="rounded-2xl border border-[var(--line)] bg-white p-8 lg:col-span-2 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-6 mb-8">
                <div>
                  <div className="text-base font-bold text-[var(--green-900)] flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[var(--terracotta)] rounded-full" />
                    AI-Powered Import
                  </div>
                  <div className="mt-1 text-sm text-[var(--ink-sub)]">
                    Drop a brochure or link. We extract a draft — you review &
                    publish.
                  </div>
                </div>
                <span className="rounded-full border border-[var(--line)] bg-[var(--cream-50)] px-3 py-1 text-[10px] font-bold text-[var(--green-900)] uppercase tracking-tight">
                  Draft only — never auto-publish
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
                <div className="md:col-span-3">
                  <div
                    className={cx(
                      "flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 text-center transition-all",
                      droppedName 
                        ? "border-[var(--green-800)] bg-[var(--cream-50)]/50" 
                        : "border-[var(--line)] bg-[var(--cream-50)]/20 hover:border-[var(--green-800)]/30 hover:bg-[var(--cream-50)]/40",
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) setDroppedName(f.name);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white border border-[var(--line)] flex items-center justify-center mb-4 shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-900)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <div className="text-sm font-bold text-[var(--green-900)]">
                      Drop PDF, JPG, PNG or Word
                    </div>
                    <div className="mt-1 text-xs text-[var(--ink-sub)] font-medium">
                      Or use the URL importer on the right
                    </div>

                    <div className="mt-6 w-full max-w-[240px]">
                      <div className={cx(
                        "flex items-center justify-between rounded-xl border px-3 py-2 transition-all",
                        droppedName ? "border-[var(--green-800)] bg-white shadow-md" : "border-[var(--line)] bg-white/50 opacity-50"
                      )}>
                        <span className="text-xs font-bold text-[var(--green-900)] truncate">
                          {droppedName ? droppedName : "No file selected"}
                        </span>
                        {droppedName && (
                          <button
                            type="button"
                            onClick={() => setDroppedName("")}
                            className="text-xs text-[var(--terracotta)] hover:text-red-700 font-black p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">i</div>
                    <div className="text-[11px] text-blue-800 leading-relaxed">
                      <span className="font-bold">MVP Note:</span> This interface is UI-only for now. Later: automated AI parsing pipeline for Visit Finland, brochure and PDF data.
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--green-900)] mb-2 uppercase tracking-widest opacity-60">
                      Import from URL
                    </label>
                    <input
                      value={urlValue}
                      onChange={(e) => setUrlValue(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-sub)]/30 focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-50)]/30 p-5">
                    <div className="text-[10px] font-black text-[var(--green-900)] mb-3 uppercase tracking-widest opacity-60">
                      AI extraction scope
                    </div>
                    <ul className="space-y-2">
                      {[
                        "Title, description, duration",
                        "Pricing & capacity hints",
                        "Requirements & policies",
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-medium text-[var(--ink)]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={!canProceedToEditor}
                      onClick={() => createAIDraft("snowmobile")}
                      className={cx(
                        "w-full rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all",
                        canProceedToEditor
                          ? "bg-[var(--green-900)] text-white hover:opacity-90 shadow-[var(--green-900)]/20"
                          : "cursor-not-allowed bg-neutral-200 text-neutral-500 shadow-none",
                      )}
                    >
                      CREATE AI DRAFT
                    </button>

                    <button
                      type="button"
                      onClick={() => createAIDraft("snowmobile")}
                      className="w-full rounded-xl border border-[var(--line)] bg-white px-6 py-2.5 text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-all shadow-sm"
                    >
                      USE EXAMPLE (SNOWMOBILE)
                    </button>

                    <button
                      type="button"
                      onClick={() => createAIDraft("hiking")}
                      className="w-full rounded-xl border border-[var(--line)] bg-white px-6 py-2.5 text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-all shadow-sm"
                    >
                      USE EXAMPLE (HIKING)
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Right: Manual */}
            <aside className="space-y-6">
              <section className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
                <div className="text-base font-bold text-[var(--green-900)] flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-6 bg-[var(--green-800)] rounded-full" />
                  Manual Entry
                </div>
                <div className="text-sm text-[var(--ink-sub)] mb-6">
                  Build your product from scratch using our step-by-step editor.
                </div>

                <button
                  type="button"
                  onClick={startManual}
                  className="w-full rounded-xl border-2 border-[var(--green-900)] bg-white px-6 py-3 text-sm font-bold text-[var(--green-900)] hover:bg-[var(--green-900)] hover:text-white transition-all shadow-md active:scale-95"
                >
                  START MANUALLY
                </button>
              </section>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--green-900)] p-6 shadow-xl text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest opacity-80">Provider Guidelines</div>
                </div>
                <div className="text-sm leading-relaxed mb-4 font-medium opacity-90">
                  This product must be <span className="text-[var(--terracotta)] font-bold">your own service</span>. Seeks & Explore currently focuses on direct operator relationships.
                </div>
                <div className="pt-4 border-t border-white/10 text-[11px] font-medium text-white/60 italic leading-relaxed">
                  Cross-provider bundling is not supported in the MVP.
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Editor */}
            <section className="rounded-2xl border border-[var(--line)] bg-white p-8 lg:col-span-2 shadow-sm overflow-hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)] pb-6 mb-8">
                <div>
                  <div className="text-lg font-bold text-[var(--green-900)] flex items-center gap-2">
                    {isAIDraft ? (
                      <>
                        <span className="w-1.5 h-6 bg-[var(--terracotta)] rounded-full" />
                        AI Draft Review
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-6 bg-[var(--green-800)] rounded-full" />
                        New Product Draft
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-[var(--ink-sub)] font-medium">
                    {isAIDraft ? "Review extracted data and fill in any missing details." : "Define your experience, pricing and inventory rules."}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {aiDraftCreated && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-tight ring-1 ring-emerald-200 shadow-sm">
                      AI DRAFT CREATED
                    </span>
                  )}
                  <span
                    className={cx(
                      "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight ring-1 shadow-sm",
                      publishDisabled
                        ? "bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)] ring-[var(--terracotta)]/20"
                        : "bg-emerald-50 text-emerald-700 ring-emerald-200",
                    )}
                  >
                    {publishDisabled ? "NEEDS REVIEW" : "READY TO PUBLISH"}
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
                      onChange={(e) =>
                        update(
                          "categoryMain",
                          e.target.value as "Outdoor" | "Indoor" | "",
                        )
                      }
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
                    onChange={(e) =>
                      update(
                        "durationMinutes",
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
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
                      onChange={(e) =>
                        update(
                          "priceFrom",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      inputMode="decimal"
                      placeholder="e.g., 149"
                      className="col-span-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                    <select
                      value={draft.currency}
                      onChange={(e) =>
                        update(
                          "currency",
                          e.target.value as "EUR" | "SEK" | "NOK" | "DKK",
                        )
                      }
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
                  <TiptapEditor
                    content={draft.description}
                    onChange={(html) => update("description", html)}
                  />
                </Field>

                {/* Capacity */}
                <Field label="Capacity" required>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={draft.capacityMode}
                      onChange={(e) =>
                        update(
                          "capacityMode",
                          e.target.value as "per_departure" | "per_resource",
                        )
                      }
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    >
                      <option value="per_departure">Per departure</option>
                      <option value="per_resource">Per resource</option>
                    </select>
                    <input
                      value={draft.capacityMax ?? ""}
                      onChange={(e) =>
                        update(
                          "capacityMax",
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      inputMode="numeric"
                      placeholder="Max guests"
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    If capacity depends on vehicles/equipment, choose &ldquo;Per
                    resource&rdquo;. You&apos;ll allocate variants in
                    Availability.
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
                    onChange={(e) =>
                      update(
                        "cancellationPolicyTemplate",
                        e.target.value as
                          | "Flexible"
                          | "Standard"
                          | "Strict"
                          | "",
                      )
                    }
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
                    <a
                      href="/provider/availability"
                      className="text-neutral-900 underline hover:text-neutral-700"
                    >
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
                        const newOption = {
                          id: `opt-${Date.now()}`,
                          name: "",
                          price: 0,
                        };
                        update("pricingOptions", [
                          ...(draft.pricingOptions || []),
                          newOption,
                        ]);
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
                            update(
                              "pricingOptions",
                              (draft.pricingOptions || []).map((o) =>
                                o.id === opt.id
                                  ? { ...o, name: e.target.value }
                                  : o,
                              ),
                            );
                          }}
                          placeholder="Option name"
                          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                        />
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => {
                            update(
                              "pricingOptions",
                              (draft.pricingOptions || []).map((o) =>
                                o.id === opt.id
                                  ? { ...o, price: Number(e.target.value) || 0 }
                                  : o,
                              ),
                            );
                          }}
                          placeholder="Price"
                          className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            update(
                              "pricingOptions",
                              (draft.pricingOptions || []).filter(
                                (o) => o.id !== opt.id,
                              ),
                            );
                          }}
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {(!draft.pricingOptions ||
                      draft.pricingOptions.length === 0) && (
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
                      <span className="text-sm text-neutral-700">
                        This product requires resources
                      </span>
                    </label>
                  </div>

                  {!draft.requiresResources ? (
                    <div className="mt-2 text-xs text-neutral-500">
                      Examples: hiking, courses, workshops
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700">
                          Resource type
                        </label>
                        <select
                          value={draft.resourceType || ""}
                          onChange={(e) => {
                            const rt = e.target
                              .value as ProductDraft["resourceType"];
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

                      {draft.resourceType === "snowmobiles" &&
                        draft.snowmobiles && (
                          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                            <div className="text-sm font-medium text-neutral-900">
                              Snowmobiles inventory
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-neutral-700">
                                  Sport (1-seat)
                                </label>
                                <div className="mt-1 grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    value={draft.snowmobiles.sport.total}
                                    onChange={(e) => {
                                      update("snowmobiles", {
                                        ...draft.snowmobiles!,
                                        sport: {
                                          ...draft.snowmobiles!.sport,
                                          total: Number(e.target.value) || 0,
                                        },
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
                                        sport: {
                                          ...draft.snowmobiles!.sport,
                                          outOfService:
                                            Number(e.target.value) || 0,
                                        },
                                      });
                                    }}
                                    placeholder="Out of service"
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-neutral-700">
                                  Touring (2-seat)
                                </label>
                                <div className="mt-1 grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    value={draft.snowmobiles.touring.total}
                                    onChange={(e) => {
                                      update("snowmobiles", {
                                        ...draft.snowmobiles!,
                                        touring: {
                                          ...draft.snowmobiles!.touring,
                                          total: Number(e.target.value) || 0,
                                        },
                                      });
                                    }}
                                    placeholder="Total"
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                  />
                                  <input
                                    type="number"
                                    value={
                                      draft.snowmobiles.touring.outOfService
                                    }
                                    onChange={(e) => {
                                      update("snowmobiles", {
                                        ...draft.snowmobiles!,
                                        touring: {
                                          ...draft.snowmobiles!.touring,
                                          outOfService:
                                            Number(e.target.value) || 0,
                                        },
                                      });
                                    }}
                                    placeholder="Out of service"
                                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 text-xs text-neutral-600">
                              <div>
                                Rule: Sport = 1 person per unit, Touring = 2
                                persons per unit
                              </div>
                            </div>
                          </div>
                        )}

                      {draft.resourceType === "guides_only" && (
                        <div>
                          <label className="block text-xs font-medium text-neutral-700">
                            Guides per departure
                          </label>
                          <input
                            type="number"
                            value={draft.guidesPerDeparture ?? 1}
                            onChange={(e) =>
                              update(
                                "guidesPerDeparture",
                                Number(e.target.value) || 1,
                              )
                            }
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
                    MVP: we store a placeholder note. Later: real upload +
                    gallery.
                  </div>
                </Field>

                {/* Add-ons legal */}
                <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-sm font-medium text-neutral-900">
                    Add-ons (later)
                  </div>
                  <div className="mt-1 text-sm text-neutral-700">
                    Add-ons must be{" "}
                    <span className="font-medium">your own services</span>. No
                    bundling other providers into the same checkout.
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Cross-sell later = recommendations/link-outs with clear
                    provider separation.
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {saveError && (
                  <p className="text-sm text-red-600 flex-1">{saveError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    onClick={handleSave}
                  >
                    {submitting ? "Saving…" : "Save draft"}
                  </button>

                  <button
                    type="button"
                    disabled={publishDisabled || submitting}
                    className={cx(
                      "rounded-lg px-4 py-2 text-sm font-medium",
                      publishDisabled || submitting
                        ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                        : "bg-neutral-900 text-white hover:bg-neutral-800",
                    )}
                    onClick={handleSave}
                  >
                    {submitting ? "Saving…" : "Publish"}
                  </button>
                </div>
              </div>

              {missingRequired.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-medium text-amber-900">
                    Missing required fields
                  </div>
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
              <div className="text-sm font-medium text-neutral-900">
                Live preview
              </div>
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
                    {(draft.locationName || "Location") +
                      " • " +
                      formatDuration(draft.durationMinutes)}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-900">
                      {draft.priceFrom
                        ? `${draft.priceFrom} ${draft.currency}`
                        : "Price not set"}
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
              {draft.requiresResources &&
                draft.resourceType === "snowmobiles" &&
                draft.snowmobiles && (
                  <div className="mt-6">
                    <div className="text-sm font-medium text-neutral-900">
                      Auto allocation preview
                    </div>
                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="text-xs text-neutral-500">
                          Example booking
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-neutral-700">
                          {draft.exampleBooking &&
                            Object.entries(draft.exampleBooking).map(
                              ([id, qty]) => {
                                const opt = draft.pricingOptions?.find(
                                  (o) => o.id === id,
                                );
                                if (!opt) return null;
                                return (
                                  <div key={id}>
                                    {qty}× {opt.name} ({opt.price} EUR)
                                  </div>
                                );
                              },
                            )}
                        </div>
                      </div>
                      {draft.exampleBooking && (
                        <div>
                          <div className="text-xs text-neutral-500">
                            Allocation totals
                          </div>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                              <span className="text-sm text-neutral-700">
                                Sport snowmobiles
                              </span>
                              <span className="text-sm font-medium text-neutral-900">
                                {draft.exampleBooking.solo || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                              <span className="text-sm text-neutral-700">
                                Touring snowmobiles
                              </span>
                              <span className="text-sm font-medium text-neutral-900">
                                {Math.ceil(
                                  (draft.exampleBooking.shared || 0) / 2,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                              <span className="text-sm text-neutral-700">
                                Guides
                              </span>
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
                <div className="text-sm font-medium text-neutral-900">
                  Quality checks
                </div>
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
                        : "border-emerald-200 bg-emerald-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium">
                          {missingRequired.length > 0
                            ? "Missing required"
                            : "Required fields OK"}
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
                            : "border-emerald-200 bg-white text-emerald-700",
                        )}
                      >
                        {missingRequired.length > 0
                          ? `${missingRequired.length} missing`
                          : "OK"}
                      </span>
                    </div>
                  </div>

                  {/* AI confidence list */}
                  {isAIDraft && (
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <div className="text-sm font-medium text-neutral-900">
                        AI confidence
                      </div>
                      <div className="mt-2 space-y-2">
                        {AI_SCORES.map((s) => (
                          <div
                            key={String(s.key)}
                            className="flex items-start justify-between gap-3"
                          >
                            <div>
                              <div className="text-sm text-neutral-900">
                                {s.label}
                              </div>
                              {s.note && (
                                <div className="text-xs text-neutral-500">
                                  {s.note}
                                </div>
                              )}
                            </div>
                            <span className={confidenceBadge(s.confidence)}>
                              {s.confidence === "high"
                                ? "High"
                                : s.confidence === "medium"
                                  ? "Medium"
                                  : "Low"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conflicts (simple MVP logic) */}
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="text-sm font-medium text-neutral-900">
                      Conflict checks (MVP)
                    </div>
                    <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700">
                      <li>
                        If capacity is &ldquo;per resource&rdquo;, allocate
                        variants in Availability to avoid overbooking.
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
