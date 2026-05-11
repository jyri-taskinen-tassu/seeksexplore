"use client";

import { useState } from "react";

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

  async function search() {
    setSearching(true);
    setResults([]);
    setSelected(null);

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
      setImporting(false);
    } catch (err) {
      setImportResult({
        success: false,
        message: "An error occurred during import.",
      });
      setImporting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1
        className="text-xl font-semibold mb-6"
        style={{ color: "var(--color-forest)" }}
      >
        Import Provider from Business Finland
      </h1>

      {/* Search */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-forest)" }}
        >
          Search by company name
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. Lapland Safaris"
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--color-sage)" }}
          />
          <button
            onClick={search}
            disabled={searching}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--color-forest)" }}
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {results.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelected(company)}
              className={`w-full text-left px-4 py-3 border-b last:border-0 transition-colors ${
                selected?.id === company.id
                  ? "bg-[#1b3a2e10]"
                  : "hover:bg-gray-50"
              }`}
            >
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-forest)" }}
              >
                {company.officialName}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-sage)" }}
              >
                {company.city ?? ""}
              </p>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && !searching && query && (
        <p className="text-sm mb-4" style={{ color: "var(--color-sage)" }}>
          No companies found.
        </p>
      )}

      {/* Selected company + invite form */}
      {selected && (
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h2
              className="font-semibold text-sm mb-1"
              style={{ color: "var(--color-forest)" }}
            >
              Selected: {selected.officialName}
            </h2>
            <div
              className="grid grid-cols-2 gap-1 text-xs"
              style={{ color: "var(--color-sage)" }}
            >
              {selected.city && <span>City: {selected.city}</span>}
              {selected.email && <span>Email: {selected.email}</span>}
              {selected.websiteUrl && (
                <span>Website: {selected.websiteUrl}</span>
              )}
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-forest)" }}
            >
              Provider login email
            </label>
            <input
              type="email"
              value={providerEmail}
              onChange={(e) => setProviderEmail(e.target.value)}
              placeholder="provider@example.com"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: "var(--color-sage)" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--color-sage)" }}>
              An invite will be sent to this email with login credentials.
            </p>
          </div>

          {importResult && (
            <p
              className={`text-sm ${importResult.success ? "text-green-600" : "text-red-600"}`}
            >
              {importResult.message}
            </p>
          )}

          <button
            onClick={importProvider}
            disabled={importing || !providerEmail}
            className="w-full py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ background: "var(--color-accent)" }}
          >
            {importing ? "Importing…" : "Import & Send Invite"}
          </button>
        </div>
      )}
    </div>
  );
}
