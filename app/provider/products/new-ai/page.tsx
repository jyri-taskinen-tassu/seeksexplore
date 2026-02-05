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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900 text-white">
              <span className="text-sm font-semibold">P</span>
            </div>
            <div>
              <div className="text-lg font-medium text-neutral-900">AI Import Product</div>
              <div className="text-sm text-neutral-500">
                Paste brochure text, URL content, or product description. AI extracts a draft.
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6">
        {!showForm ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-4">
              <div className="text-sm font-medium text-neutral-900">AI Import</div>
              <div className="mt-1 text-sm text-neutral-600">
                Paste product description, brochure text, or URL content below. Our AI will extract key information.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Product information (text, brochure, or URL)
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={12}
                  placeholder="Paste product description here...&#10;&#10;Example:&#10;Snowmobile Safari – Sport & Touring&#10;Experience the thrill of snowmobiling through pristine winter landscapes. Choose between solo Sport (1-seat) or shared Touring (2-seat) options. Professional guide included. Duration: 2 hours. Location: Tahko. Meeting point: Safari house, 10 min before start."
                  className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={!inputText.trim() || isProcessing}
                  className={cx(
                    "rounded-lg px-4 py-2 text-sm font-medium",
                    !inputText.trim() || isProcessing
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  )}
                >
                  {isProcessing ? "Processing..." : "Create AI draft → Review & edit"}
                </button>

                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                <div className="font-medium mb-2">AI extracts:</div>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Title, description, duration, location, meeting point</li>
                  <li>Price hints and capacity suggestions</li>
                  <li>Resource rules (snowmobile variants, guides)</li>
                  <li>Pricing tiers</li>
                </ul>
                <div className="mt-2 text-xs text-neutral-500">
                  You always review and edit before publishing. 👍
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-neutral-900">AI draft created</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Review and edit the extracted information below.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                  AI draft ready
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Start over
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <ProductForm />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  console.log("Product draft:", draft);
                  alert("Saved (MVP): product draft logged to console");
                }}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Save draft
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
