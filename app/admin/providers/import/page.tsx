"use client";

import { useState } from "react";
import Link from "next/link";

type BFCompany = {
  id: string;
  businessEntityId: string;
  officialName: string;
  businessName: string | null;
  description: string | null;
  websiteUrl: string | null;
  webshopUrl: string | null;
  logoUrl: string | null;
  logoThumbnailUrl: string | null;
  email: string | null;
  phone: string | null;
  streetName: string | null;
  city: string | null;
  postalCode: string | null;
  productCount: number;
};

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function ImportProviderPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BFCompany[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<BFCompany | null>(null);
  const [providerEmail, setProviderEmail] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    setImportResult(null);
    setHasSearched(true);

    const res = await fetch(
      `/api/admin/bf-search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setResults(data.companies ?? []);
    setSearching(false);
  }

  async function importProvider() {
    if (!selected || !providerEmail) return;
    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/import-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: selected, providerEmail }),
      });
      const data = await res.json();
      setImportResult({ success: res.ok, message: data.message });
    } catch {
      setImportResult({
        success: false,
        message: "An error occurred during import.",
      });
    } finally {
      setImporting(false);
    }
  }

  const step = !hasSearched ? 1 : !selected ? 2 : 3;

  return (
    <div className="p-8 max-w-2xl">
      {/* Back */}
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-60"
        style={{ color: "var(--color-sage)" }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Providers
      </Link>

      {/* Title */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-forest)" }}
        >
          Import from Business Finland
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-sage)" }}>
          Search the registry and onboard a new experience operator
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["Search", "Select", "Import"] as const).map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: done
                    ? "var(--color-sage)"
                    : active
                      ? "var(--color-forest)"
                      : "var(--color-cream)",
                  color: done || active ? "white" : "var(--color-sage)",
                }}
              >
                {done ? "✓" : n}
              </div>
              <span
                className="text-sm font-medium transition-colors duration-200"
                style={{
                  color: active ? "var(--color-forest)" : "var(--color-sage)",
                  opacity: active ? 1 : 0.7,
                }}
              >
                {label}
              </span>
              {i < 2 && (
                <div
                  className="w-6 h-px mx-1"
                  style={{ background: "var(--color-cream)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <label
          className="block text-sm font-semibold mb-3"
          style={{ color: "var(--color-forest)" }}
        >
          Company name
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-sage)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="e.g. Lapland Safaris"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors"
              style={{ borderColor: "var(--color-sage)" }}
            />
          </div>
          <button
            onClick={search}
            disabled={searching || !query.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: "var(--color-forest)" }}
          >
            {searching ? <Spinner /> : null}
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        <p
          className="text-xs mt-2"
          style={{ color: "var(--color-sage)", opacity: 0.7 }}
        >
          Press Enter to search
        </p>
      </div>

      {/* Loading state */}
      {searching && (
        <div
          className="text-center py-10 rounded-2xl text-sm"
          style={{ background: "white", color: "var(--color-sage)" }}
        >
          <div
            className="inline-block w-6 h-6 border-2 rounded-full animate-spin mb-3"
            style={{
              borderColor: "var(--color-cream)",
              borderTopColor: "var(--color-forest)",
            }}
          />
          <p className="font-medium">Searching Business Finland…</p>
        </div>
      )}

      {/* No results */}
      {!searching && hasSearched && results.length === 0 && (
        <div
          className="text-center py-10 rounded-2xl"
          style={{ background: "var(--color-cream)" }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--color-forest)" }}
          >
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-sage)" }}>
            Try a different name or partial match
          </p>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div
            className="px-5 py-3 border-b"
            style={{ borderColor: "var(--color-cream)" }}
          >
            <p
              className="text-xs font-medium"
              style={{ color: "var(--color-sage)" }}
            >
              {results.length} result{results.length !== 1 ? "s" : ""} — click
              to select
            </p>
          </div>
          {results.map((company, idx) => {
            const isSelected = selected?.id === company.id;
            const initials = company.officialName
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();

            return (
              <button
                key={company.id}
                onClick={() => setSelected(isSelected ? null : company)}
                className="w-full text-left px-5 py-4 transition-colors"
                style={{
                  borderTop:
                    idx > 0 ? `1px solid var(--color-cream)` : undefined,
                  background: isSelected ? "rgba(27,58,46,0.05)" : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  {company.logoThumbnailUrl || company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoThumbnailUrl ?? company.logoUrl ?? ""}
                      alt={company.officialName}
                      className="w-10 h-10 object-contain rounded-lg border bg-white flex-shrink-0"
                      style={{ borderColor: "var(--color-cream)" }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 transition-colors"
                      style={{
                        background: isSelected
                          ? "var(--color-forest)"
                          : "var(--color-sage)",
                      }}
                    >
                      {initials}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--color-forest)" }}
                    >
                      {company.officialName}
                    </p>
                    <div
                      className="flex items-center gap-3 mt-0.5 text-xs"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {company.city && <span>{company.city}</span>}
                      {company.productCount > 0 && (
                        <span
                          className="px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            background: "var(--color-cream)",
                            color: "var(--color-forest)",
                          }}
                        >
                          {company.productCount} products
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0 text-xs font-bold"
                      style={{ background: "var(--color-accent)" }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Import form */}
      {selected && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Company preview */}
          <div
            className="p-5 border-b"
            style={{
              borderColor: "var(--color-cream)",
              background: "rgba(27,58,46,0.03)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-sage)", opacity: 0.8 }}
            >
              Selected company
            </p>
            <div className="flex items-start gap-3">
              {selected.logoThumbnailUrl || selected.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.logoThumbnailUrl ?? selected.logoUrl ?? ""}
                  alt={selected.officialName}
                  className="w-14 h-14 object-contain rounded-xl border bg-white flex-shrink-0"
                  style={{ borderColor: "var(--color-cream)" }}
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: "var(--color-forest)" }}
                >
                  {selected.officialName
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="font-semibold"
                  style={{ color: "var(--color-forest)" }}
                >
                  {selected.officialName}
                </p>
                {selected.businessName &&
                  selected.businessName !== selected.officialName && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {selected.businessName}
                    </p>
                  )}
                <div
                  className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs"
                  style={{ color: "var(--color-sage)" }}
                >
                  {selected.city && <span>{selected.city}</span>}
                  {selected.email && <span>{selected.email}</span>}
                  {selected.websiteUrl && (
                    <a
                      href={selected.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline truncate max-w-[200px]"
                    >
                      {selected.websiteUrl}
                    </a>
                  )}
                  {selected.productCount > 0 && (
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {selected.productCount} products will be imported
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Email input */}
          <div className="p-5 space-y-4">
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: "var(--color-forest)" }}
              >
                Provider login email
              </label>
              <input
                type="email"
                value={providerEmail}
                onChange={(e) => setProviderEmail(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !importing &&
                  providerEmail &&
                  importProvider()
                }
                placeholder="provider@example.com"
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                style={{ borderColor: "var(--color-sage)" }}
              />
              <p
                className="text-xs mt-1.5"
                style={{ color: "var(--color-sage)", opacity: 0.8 }}
              >
                Login credentials and an invite will be sent to this address.
              </p>
            </div>

            {importResult && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: importResult.success
                    ? "rgba(111,133,110,0.12)"
                    : "rgba(239,144,79,0.12)",
                  color: importResult.success
                    ? "var(--color-sage)"
                    : "var(--color-accent)",
                }}
              >
                {importResult.message}
              </div>
            )}

            <button
              onClick={importProvider}
              disabled={importing || !providerEmail || !!importResult?.success}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: "var(--color-accent)" }}
            >
              {importing ? <Spinner /> : null}
              {importing
                ? "Importing…"
                : importResult?.success
                  ? "Imported ✓"
                  : "Import & Send Invite"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
