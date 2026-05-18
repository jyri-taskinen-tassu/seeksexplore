"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/app/components/provider/TiptapEditor";

type InfoRow = {
  language: string;
  name: string | null;
  description: string | null;
  url: string | null;
  webshop_url: string | null;
};
type TagRow = { tag: string };
type AvailRow = {
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  nr_of_tickets: number | null;
};

const MONTH_ORDER = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const LANG_LABELS: Record<string, string> = {
  en: "English",
  fi: "Finnish",
  sv: "Swedish",
  de: "German",
  fr: "French",
  ru: "Russian",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
};
const PRICING_UNITS = ["person", "hour", "day", "week"];
const PRODUCT_TYPES = [
  "accommodation",
  "attraction",
  "event",
  "experience",
  "rental_service",
  "restaurant",
  "shop",
  "transportation",
  "venue",
];

const SECTIONS = [
  { id: "info", label: "Product info" },
  { id: "languages", label: "Languages" },
  { id: "pricing", label: "Pricing" },
  { id: "logistics", label: "Duration & capacity" },
  { id: "season", label: "Season" },
  { id: "tags", label: "Tags" },
];

function SectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`section-${id}`}
      className="rounded-xl border border-neutral-200 bg-white shadow-sm scroll-mt-20"
    >
      <div className="border-b border-neutral-100 px-6 py-4">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors ${className}`}
      {...props}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors resize-none ${className}`}
      {...props}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
}) {
  return (
    <select
      className={`w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export default function ProductEditForm({
  product,
}: {
  product: Record<string, unknown>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("info");
  const [activeLang, setActiveLang] = useState("en");

  const initialInfos = (product.product_information as InfoRow[]) ?? [];
  const initialTags = ((product.product_tags as TagRow[]) ?? []).map(
    (t) => t.tag,
  );
  const initialMonths = (product.available_months as string[] | null) ?? [];

  const [type, setType] = useState((product.type as string) ?? "experience");
  const [accessible, setAccessible] = useState(
    (product.accessible as boolean) ?? false,
  );
  const [infos, setInfos] = useState<InfoRow[]>(initialInfos);
  const [priceFrom, setPriceFrom] = useState<string>(
    product.price_from != null ? String(product.price_from) : "",
  );
  const [priceTo, setPriceTo] = useState<string>(
    product.price_to != null ? String(product.price_to) : "",
  );
  const [pricingUnit, setPricingUnit] = useState<string>(
    (product.pricing_unit as string) ?? "person",
  );
  const [durationDays, setDurationDays] = useState<string>(
    product.duration_days != null ? String(product.duration_days) : "",
  );
  const [durationHours, setDurationHours] = useState<string>(
    product.duration_hours != null ? String(product.duration_hours) : "",
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    product.duration_minutes != null ? String(product.duration_minutes) : "",
  );
  const [capacityMin, setCapacityMin] = useState<string>(
    product.capacity_min != null ? String(product.capacity_min) : "",
  );
  const [capacityMax, setCapacityMax] = useState<string>(
    product.capacity_max != null ? String(product.capacity_max) : "",
  );
  const [months, setMonths] = useState<string[]>(initialMonths);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  const availLangs = infos.map((i) => i.language);
  const activeInfo = infos.find((i) => i.language === activeLang);

  useEffect(() => {
    if (availLangs.length > 0 && !availLangs.includes(activeLang)) {
      setActiveLang(availLangs[0]);
    }
  }, [availLangs, activeLang]);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  function updateInfo(lang: string, field: keyof InfoRow, value: string) {
    markDirty();
    setInfos((prev) =>
      prev.map((i) => (i.language === lang ? { ...i, [field]: value } : i)),
    );
  }

  function toggleMonth(m: string) {
    markDirty();
    setMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      markDirty();
    }
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/provider/products/${product.id as string}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            accessible,
            price_from: priceFrom !== "" ? parseFloat(priceFrom) : null,
            price_to: priceTo !== "" ? parseFloat(priceTo) : null,
            pricing_unit: pricingUnit || null,
            duration_days: durationDays !== "" ? parseInt(durationDays) : null,
            duration_hours:
              durationHours !== "" ? parseInt(durationHours) : null,
            duration_minutes:
              durationMinutes !== "" ? parseInt(durationMinutes) : null,
            capacity_min: capacityMin !== "" ? parseInt(capacityMin) : null,
            capacity_max: capacityMax !== "" ? parseInt(capacityMax) : null,
            available_months: months,
            tags,
            product_information: infos,
          }),
        },
      );
      if (res.ok) {
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  // Scroll-spy
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      for (const s of SECTIONS) {
        const node = document.getElementById(`section-${s.id}`);
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (rect.top <= 100) setActiveSection(s.id);
      }
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const enName =
    infos.find((i) => i.language === "en")?.name ?? (product.type as string);

  return (
    <div className="flex h-screen flex-col bg-neutral-50 overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 z-30 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/provider/products/${product.id as string}`}
              className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <div>
              <div className="text-sm font-semibold text-neutral-900 truncate max-w-[320px]">
                {enName}
              </div>
              <div className="text-xs text-neutral-500">Editing product</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && !saved && (
              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                Unsaved changes
              </span>
            )}
            {saved && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                Saved
              </span>
            )}
            <Link
              href={`/provider/products/${product.id as string}`}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40 transition-all"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar nav */}
        <aside className="flex-shrink-0 w-52 border-r border-neutral-200 bg-white overflow-y-auto">
          <nav className="p-3 space-y-0.5 pt-4">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const el = document.getElementById(`section-${s.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveSection(s.id);
                }}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Scrollable form */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-6 space-y-6">
            {/* Product info */}
            <SectionCard id="info" title="Product info">
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      markDirty();
                    }}
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">
                      Accessible
                    </div>
                    <div className="text-xs text-neutral-500">
                      Product is accessible for people with disabilities
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={accessible}
                      onChange={(e) => {
                        setAccessible(e.target.checked);
                        markDirty();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-neutral-900 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Languages */}
            <SectionCard id="languages" title="Languages">
              {availLangs.length === 0 ? (
                <p className="text-sm text-neutral-400 italic">
                  No multilingual content imported.
                </p>
              ) : (
                <div>
                  {/* Lang picker */}
                  <div className="flex gap-1 mb-4 border border-neutral-200 rounded-lg p-1 bg-neutral-50 overflow-x-auto">
                    {availLangs.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                          activeLang === lang
                            ? "bg-white text-neutral-900 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700"
                        }`}
                      >
                        {LANG_LABELS[lang] ?? lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {activeInfo && (
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={activeInfo.name ?? ""}
                          onChange={(e) =>
                            updateInfo(activeLang, "name", e.target.value)
                          }
                          placeholder={`Product name in ${LANG_LABELS[activeLang] ?? activeLang}`}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <TiptapEditor
                          content={activeInfo.description ?? ""}
                          onChange={(html) =>
                            updateInfo(activeLang, "description", html)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Product URL</Label>
                          <Input
                            type="url"
                            value={activeInfo.url ?? ""}
                            onChange={(e) =>
                              updateInfo(activeLang, "url", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label>Booking URL</Label>
                          <Input
                            type="url"
                            value={activeInfo.webshop_url ?? ""}
                            onChange={(e) =>
                              updateInfo(
                                activeLang,
                                "webshop_url",
                                e.target.value,
                              )
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Pricing */}
            <SectionCard id="pricing" title="Pricing">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>From (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceFrom}
                      onChange={(e) => {
                        setPriceFrom(e.target.value);
                        markDirty();
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>To (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceTo}
                      onChange={(e) => {
                        setPriceTo(e.target.value);
                        markDirty();
                      }}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select
                      value={pricingUnit}
                      onChange={(e) => {
                        setPricingUnit(e.target.value);
                        markDirty();
                      }}
                    >
                      {PRICING_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                {priceFrom && (
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm text-neutral-600">
                    Preview:{" "}
                    <span className="font-semibold text-neutral-900">
                      From €{priceFrom}
                      {priceTo ? `–€${priceTo}` : ""} / {pricingUnit}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Duration & capacity */}
            <SectionCard id="logistics" title="Duration & capacity">
              <div className="space-y-4">
                <div>
                  <Label>Duration</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        value={durationDays}
                        onChange={(e) => {
                          setDurationDays(e.target.value);
                          markDirty();
                        }}
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">
                        days
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={durationHours}
                        onChange={(e) => {
                          setDurationHours(e.target.value);
                          markDirty();
                        }}
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">
                        hrs
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={durationMinutes}
                        onChange={(e) => {
                          setDurationMinutes(e.target.value);
                          markDirty();
                        }}
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">
                        min
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Group size</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        value={capacityMin}
                        onChange={(e) => {
                          setCapacityMin(e.target.value);
                          markDirty();
                        }}
                        placeholder="Min"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">
                        min
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        value={capacityMax}
                        onChange={(e) => {
                          setCapacityMax(e.target.value);
                          markDirty();
                        }}
                        placeholder="Max"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 pointer-events-none">
                        max
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Season */}
            <SectionCard id="season" title="Season">
              <p className="text-xs text-neutral-500 mb-3">
                Select the months when this product is available.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {MONTH_ORDER.map((m) => {
                  const active = months.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      className={`rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wide transition-all border ${
                        active
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400 hover:text-neutral-700"
                      }`}
                    >
                      {m.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              {months.length > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                  Active:{" "}
                  <span className="font-medium text-neutral-900">
                    {months
                      .sort(
                        (a, b) =>
                          MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b),
                      )
                      .map((m) => m.slice(0, 3))
                      .join(", ")}
                  </span>
                </p>
              )}
            </SectionCard>

            {/* Tags */}
            <SectionCard id="tags" title="Tags">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700"
                  >
                    {t.replace(/_/g, " ")}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="ml-1 text-neutral-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-neutral-400 italic">No tags.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  placeholder="Add tag (press Enter)"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                >
                  Add
                </button>
              </div>
            </SectionCard>

            {/* Bottom padding */}
            <div className="h-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
