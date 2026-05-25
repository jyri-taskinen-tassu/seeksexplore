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
      className="rounded-2xl border border-[var(--line)] bg-white shadow-sm scroll-mt-24 transition-all hover:border-[var(--green-800)]/20"
    >
      <div className="border-b border-[var(--line)] px-6 py-4 bg-[var(--cream-50)]/30">
        <h2 className="text-base font-bold text-[var(--green-900)] flex items-center gap-2">
          <span className="w-1 h-4 bg-[var(--terracotta)] rounded-full" />
          {title}
        </h2>
      </div>
      <div className="p-8">{children}</div>
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
    <label className="block text-[10px] font-black text-[var(--green-900)] mb-1.5 uppercase tracking-widest opacity-60">
      {children}
      {required && <span className="ml-1 text-[var(--terracotta)]">*</span>}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-sub)]/30 outline-none focus:border-[var(--green-800)] focus:ring-1 focus:ring-[var(--green-800)] transition-all shadow-sm ${className}`}
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
      className={`w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] placeholder:[var(--ink-sub)]/30 outline-none focus:border-[var(--green-800)] focus:ring-1 focus:ring-[var(--green-800)] transition-all shadow-sm resize-none leading-relaxed ${className}`}
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
      className={`w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--green-800)] focus:ring-1 focus:ring-[var(--green-800)] transition-all bg-white shadow-sm font-medium ${className}`}
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
    <div className="flex h-screen flex-col bg-[var(--cream-50)] overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 z-30 border-b border-[var(--line)] bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/provider/products/${product.id as string}`}
              className="rounded-lg border border-[var(--line)] p-2 text-[var(--ink-sub)] hover:bg-[var(--cream-50)] hover:text-[var(--green-900)] transition-all shadow-sm group"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <div>
              <div className="text-sm font-bold text-[var(--green-900)] truncate max-w-[320px]">
                {enName}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[var(--ink-sub)] opacity-50">Editing product</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {dirty && !saved && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--terracotta)] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--terracotta)] animate-pulse" />
                Unsaved changes
              </span>
            )}
            {saved && (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                All changes saved
              </span>
            )}
            <div className="flex items-center gap-3">
              <Link
                href={`/provider/products/${product.id as string}`}
                className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors shadow-sm"
              >
                CANCEL
              </Link>
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="rounded-lg bg-[var(--green-900)] px-6 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-[var(--green-900)]/10"
              >
                {saving ? "SAVING…" : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar nav */}
        <aside className="flex-shrink-0 w-64 border-r border-[var(--line)] bg-white/50 backdrop-blur-sm overflow-y-auto">
          <nav className="p-4 space-y-1.5 pt-6">
            <div className="px-3 mb-4 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--ink-sub)] opacity-40">Sections</div>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const el = document.getElementById(`section-${s.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveSection(s.id);
                }}
                className={`w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  activeSection === s.id
                    ? "bg-[var(--green-900)] text-white shadow-md shadow-[var(--green-900)]/10 scale-[1.02]"
                    : "text-[var(--ink-sub)] hover:bg-[var(--cream-100)] hover:text-[var(--green-900)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Scrollable form */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="mx-auto max-w-3xl px-8 py-10 space-y-10">
            {/* Product info */}
            <SectionCard id="info" title="General Information">
              <div className="space-y-8">
                <div>
                  <Label>Activity Category</Label>
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
                <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--cream-50)]/30 px-6 py-4 transition-all hover:border-[var(--green-800)]/20">
                  <div>
                    <div className="text-sm font-bold text-[var(--green-900)]">
                      Accessible Experience
                    </div>
                    <div className="text-xs text-[var(--ink-sub)] mt-1 opacity-70">
                      Product is accessible for people with disabilities
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={accessible}
                      onChange={(e) => {
                        setAccessible(e.target.checked);
                        markDirty();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--cream-200)] rounded-full peer peer-checked:bg-[var(--green-800)] peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Languages */}
            <SectionCard id="languages" title="Content & Translations">
              {availLangs.length === 0 ? (
                <p className="text-sm text-[var(--ink-sub)] italic opacity-50 text-center py-8">
                  No multilingual content imported.
                </p>
              ) : (
                <div className="space-y-8">
                  {/* Lang picker */}
                  <div className="flex gap-1.5 p-1.5 border border-[var(--line)] rounded-xl bg-[var(--cream-50)]/50 overflow-x-auto">
                    {availLangs.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`flex-shrink-0 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          activeLang === lang
                            ? "bg-white text-[var(--green-900)] shadow-sm scale-105"
                            : "text-[var(--ink-sub)] hover:text-[var(--green-900)] opacity-60 hover:opacity-100"
                        }`}
                      >
                        {LANG_LABELS[lang] ?? lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {activeInfo && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div>
                        <Label>Localized Name</Label>
                        <Input
                          value={activeInfo.name ?? ""}
                          onChange={(e) =>
                            updateInfo(activeLang, "name", e.target.value)
                          }
                          placeholder={`Product name in ${LANG_LABELS[activeLang] ?? activeLang}`}
                        />
                      </div>
                      <div>
                        <Label>Full Description</Label>
                        <TiptapEditor
                          content={activeInfo.description ?? ""}
                          onChange={(html) =>
                            updateInfo(activeLang, "description", html)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Public Product URL</Label>
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
                          <Label>Booking/Webshop URL</Label>
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
            <SectionCard id="pricing" title="Pricing Structure">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Price From (€)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceFrom}
                      onChange={(e) => {
                        setPriceFrom(e.target.value);
                        markDirty();
                      }}
                      placeholder="0.00"
                      className="font-bold text-[var(--green-900)]"
                    />
                  </div>
                  <div>
                    <Label>Price To (€)</Label>
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
                    <Label>Pricing Unit</Label>
                    <Select
                      value={pricingUnit}
                      onChange={(e) => {
                        setPricingUnit(e.target.value);
                        markDirty();
                      }}
                    >
                      {PRICING_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                {priceFrom && (
                  <div className="rounded-2xl bg-[var(--cream-50)]/50 border border-[var(--line)] px-6 py-4 text-sm">
                    <span className="text-[var(--ink-sub)] uppercase text-[10px] font-black tracking-widest opacity-60 mr-4">Preview</span>
                    <span className="font-black text-[var(--green-900)] text-lg">
                      From €{priceFrom}
                      {priceTo ? `–€${priceTo}` : ""} / {pricingUnit}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Duration & capacity */}
            <SectionCard id="logistics" title="Duration & Group Size">
              <div className="space-y-8">
                <div>
                  <Label>Total Duration</Label>
                  <div className="grid grid-cols-3 gap-4">
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
                        className="pr-12 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--ink-sub)] opacity-50 pointer-events-none">
                        DAYS
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
                        className="pr-12 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--ink-sub)] opacity-50 pointer-events-none">
                        HRS
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
                        className="pr-12 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--ink-sub)] opacity-50 pointer-events-none">
                        MIN
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Capacity Limits</Label>
                  <div className="grid grid-cols-2 gap-6">
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
                        className="pr-12 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--ink-sub)] opacity-50 pointer-events-none">
                        MIN
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
                        className="pr-12 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--ink-sub)] opacity-50 pointer-events-none">
                        MAX
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Season */}
            <SectionCard id="season" title="Operational Season">
              <div className="space-y-6">
                <p className="text-xs text-[var(--ink-sub)] opacity-70">
                  Select the months when this experience is available for booking.
                </p>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {MONTH_ORDER.map((m) => {
                    const active = months.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMonth(m)}
                        className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                          active
                            ? "bg-[var(--green-900)] text-white border-[var(--green-900)] shadow-lg shadow-[var(--green-900)]/20 scale-105"
                            : "bg-white text-[var(--ink-sub)] border-[var(--line)] hover:border-[var(--green-800)]/30 hover:text-[var(--green-900)]"
                        }`}
                      >
                        {m.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
                {months.length > 0 && (
                  <div className="pt-4 border-t border-[var(--line)] flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--ink-sub)] opacity-40">Selection:</span>
                    <span className="text-xs font-bold text-[var(--green-900)]">
                      {months
                        .sort(
                          (a, b) =>
                            MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b),
                        )
                        .map((m) => m.slice(0, 3))
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Tags */}
            <SectionCard id="tags" title="Categorization Tags">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--cream-50)]/50 px-4 py-2 text-xs font-bold text-[var(--green-900)] shadow-sm animate-in zoom-in-95 duration-200"
                    >
                      {t.replace(/_/g, " ")}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="h-4 w-4 flex items-center justify-center rounded-full text-[var(--ink-sub)] hover:bg-[var(--terracotta)] hover:text-white transition-all"
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-[var(--ink-sub)] italic opacity-50 text-center w-full py-4 border-2 border-dashed border-[var(--line)] rounded-2xl">No tags added yet.</p>
                  )}
                </div>
                <div className="flex gap-3 pt-4 border-t border-[var(--line)]">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    placeholder="Type a tag and press ENTER…"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="rounded-xl border border-[var(--line)] bg-white px-6 py-2 text-xs font-black uppercase tracking-widest text-[var(--green-900)] hover:bg-[var(--cream-50)] disabled:opacity-30 transition-all shadow-sm"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Bottom padding */}
            <div className="h-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
