"use client";

import React, { useState } from "react";
import { useProductDraft } from "@/lib/productStore";
import { ProductForm } from "@/app/components/provider/ProductForm";
import type { ResourceRule } from "@/lib/productStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Mock AI parsing - simple heuristics
 */
function mockAIParse(input: string): Partial<import("@/lib/productStore").ProductDraft> {
  const lower = input.toLowerCase();
  const result: Partial<import("@/lib/productStore").ProductDraft> = {
    title: "",
    description: "",
    location: "",
    meetingPoint: "",
    durationMinutes: null,
    pricingTiers: [],
    resourceRules: [],
  };

  // Title detection
  if (lower.includes("snowmobile")) {
    result.title = "Snowmobile Safari";
    result.description = "Experience the thrill of snowmobiling through pristine winter landscapes.";
  } else if (lower.includes("hiking") || lower.includes("hike")) {
    result.title = "Guided Hiking Tour";
    result.description = "Explore beautiful trails with an experienced guide.";
  } else if (lower.includes("safari")) {
    result.title = "Wildlife Safari";
    result.description = "Discover local wildlife and nature.";
  } else {
    result.title = "Adventure Experience";
    result.description = "An exciting outdoor adventure experience.";
  }

  // Location detection (simple)
  if (lower.includes("tahko")) {
    result.location = "Tahko";
    result.meetingPoint = "Safari house, 10 min before start";
  } else if (lower.includes("helsinki")) {
    result.location = "Helsinki";
    result.meetingPoint = "City center, 15 min before start";
  } else {
    result.location = "Location TBD";
    result.meetingPoint = "Meeting point to be confirmed";
  }

  // Duration detection
  const durationMatch = input.match(/(\d+)\s*(?:hour|h|min|minute)/i);
  if (durationMatch) {
    const num = parseInt(durationMatch[1]);
    if (input.toLowerCase().includes("hour") || input.toLowerCase().includes("h")) {
      result.durationMinutes = num * 60;
    } else {
      result.durationMinutes = num;
    }
  } else {
    result.durationMinutes = 120; // Default
  }

  // Resource rules detection
  if (lower.includes("touring") || lower.includes("2-seat") || lower.includes("two seat")) {
    const touringRule: ResourceRule = {
      id: `rule-${Date.now()}-touring`,
      resourceType: "snowmobiles",
      variantId: "touring",
      variantLabel: "Touring (2-seat)",
      capacityPerUnit: 2,
    };
    result.resourceRules = [...(result.resourceRules || []), touringRule];
  }

  if (lower.includes("sport") || lower.includes("1-seat") || lower.includes("one seat") || lower.includes("solo")) {
    const sportRule: ResourceRule = {
      id: `rule-${Date.now()}-sport`,
      resourceType: "snowmobiles",
      variantId: "sport",
      variantLabel: "Sport (1-seat)",
      capacityPerUnit: 1,
    };
    result.resourceRules = [...(result.resourceRules || []), sportRule];
  }

  // Pricing tiers (simple detection)
  if (lower.includes("snowmobile")) {
    result.pricingTiers = [
      {
        id: `tier-${Date.now()}-1`,
        label: "One person / snowmobile",
        price: 149,
      },
      {
        id: `tier-${Date.now()}-2`,
        label: "Two people / snowmobile",
        price: 199,
      },
    ];
  } else {
    result.pricingTiers = [
      {
        id: `tier-${Date.now()}-1`,
        label: "Adult",
        price: 59,
      },
    ];
  }

  return result;
}

export default function ProviderProductNewAIPage() {
  const { draft, setDraft, resetDraft } = useProductDraft();
  const [inputText, setInputText] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  function handleImport() {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const parsed = mockAIParse(inputText);
      setDraft(parsed);
      setShowForm(true);
      setIsProcessing(false);
    }, 500);
  }

  function handleReset() {
    resetDraft();
    setInputText("");
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Header */}
      <header className="border-b border-[var(--line)] bg-white px-6 py-4 sticky top-0 z-20">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--green-900)] text-white shadow-lg">
              <span className="text-lg font-bold">A</span>
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--green-900)] tracking-tight">AI Import Product</div>
              <div className="text-xs text-[var(--ink-sub)] font-medium opacity-70">
                Paste brochure text, URL content, or product description. AI extracts a draft.
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-8">
        {!showForm ? (
          <div className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
            <div className="mb-8 border-b border-[var(--line)] pb-6">
              <div className="text-base font-bold text-[var(--green-900)] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[var(--terracotta)] rounded-full" />
                Intelligent Extraction
              </div>
              <div className="mt-1 text-sm text-[var(--ink-sub)] font-medium">
                Paste product description, brochure text, or URL content below. Our AI will extract key information.
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--green-900)] mb-2 uppercase tracking-widest opacity-60">
                  Product information (text, brochure, or URL)
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  placeholder="Paste product description here...&#10;&#10;Example:&#10;Snowmobile Safari – Sport & Touring&#10;Experience the thrill of snowmobiling through pristine winter landscapes. Choose between solo Sport (1-seat) or shared Touring (2-seat) options. Professional guide included. Duration: 2 hours. Location: Tahko. Meeting point: Safari house, 10 min before start."
                  className="w-full resize-none rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] placeholder:[var(--ink-sub)]/30 focus:outline-none focus:ring-1 focus:ring-[var(--green-800)] shadow-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!inputText.trim() || isProcessing}
                  className={cx(
                    "rounded-xl px-8 py-3 text-sm font-bold shadow-lg transition-all",
                    !inputText.trim() || isProcessing
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500 shadow-none"
                      : "bg-[var(--green-900)] text-white hover:opacity-90 shadow-[var(--green-900)]/20"
                  )}
                >
                  {isProcessing ? "PROCESSING…" : "CREATE AI DRAFT"}
                </button>

                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    className="rounded-xl border border-[var(--line)] bg-white px-6 py-3 text-xs font-bold text-[var(--ink-sub)] hover:text-[var(--green-900)] hover:bg-[var(--cream-50)] transition-all"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-50)]/30 p-6">
                <div className="text-[10px] font-black text-[var(--green-900)] mb-4 uppercase tracking-widest opacity-60">AI extraction scope</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-xs font-medium text-[var(--ink)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Title, description & duration
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-[var(--ink)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Location & meeting point
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-[var(--ink)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Price hints & capacity suggestions
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-[var(--ink)]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green-800)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Resource rules & pricing tiers
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--line)] text-[10px] text-[var(--ink-sub)] font-medium opacity-50 italic">
                  You always review and edit before publishing. 👍
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-6">
              <div>
                <div className="text-xl font-bold text-[var(--green-900)] flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  AI Draft Created
                </div>
                <div className="mt-1 text-sm text-[var(--ink-sub)] font-medium">
                  Review and edit the extracted information below.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-tight ring-1 ring-emerald-200 shadow-sm">
                  DRAFT READY
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-[var(--line)] bg-white px-5 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-all shadow-sm"
                >
                  START OVER
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
              <ProductForm />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  console.log("Product draft:", draft);
                  alert("Saved (MVP): product draft logged to console");
                }}
                className="rounded-xl bg-[var(--green-900)] px-10 py-3.5 text-sm font-black text-white hover:opacity-90 transition-opacity shadow-xl shadow-[var(--green-900)]/20 uppercase tracking-widest"
              >
                Save Final Draft
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
