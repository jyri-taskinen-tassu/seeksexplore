"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

export type NewBookingResult = {
  id: string;
  provider_id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_name: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number;
  currency: string;
  notes: string | null;
  cancelled_reason: string | null;
  created_at: string;
};

type ProductOption = { id: string; name: string };

type CustomerRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
};

export function NewBookingModal({
  onClose,
  onCreated,
  prefilledDate,
}: {
  onClose: () => void;
  onCreated: (booking: NewBookingResult) => void;
  prefilledDate?: string;
}) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Customer search state
  const [allCustomers, setAllCustomers] = useState<CustomerRecord[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerRecord | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    product_id: "",
    product_name: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    booking_date: prefilledDate ?? "",
    booking_time: "09:00",
    guests: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/provider/products")
      .then((r) => r.json())
      .then((data) => {
        const list: ProductOption[] = Array.isArray(data.products)
          ? (data.products as { id: string; name: string | null }[])
              .filter((p) => p.name)
              .map((p) => ({ id: p.id, name: p.name! }))
          : [];
        setProducts(list);
        if (list.length > 0) {
          setForm((prev) => ({
            ...prev,
            product_id: list[0].id,
            product_name: list[0].name,
          }));
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch customers once on mount
  useEffect(() => {
    fetch("/api/provider/customers")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllCustomers(data as CustomerRecord[]);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const filteredCustomers = useCallback(() => {
    if (!customerQuery.trim()) return allCustomers.slice(0, 6);
    const q = customerQuery.toLowerCase();
    return allCustomers
      .filter(
        (c) =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [customerQuery, allCustomers]);

  function selectCustomer(c: CustomerRecord) {
    setSelectedCustomer(c);
    setCustomerQuery(`${c.first_name} ${c.last_name}`);
    setShowDropdown(false);
    setForm((prev) => ({
      ...prev,
      customer_name: `${c.first_name} ${c.last_name}`,
      customer_email: c.email,
      customer_phone: c.phone ?? "",
    }));
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setCustomerQuery("");
    setForm((prev) => ({
      ...prev,
      customer_name: "",
      customer_email: "",
      customer_phone: "",
    }));
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    if (name === "product_id") {
      const product = products.find((p) => p.id === value);
      setForm((prev) => ({
        ...prev,
        product_id: value,
        product_name: product?.name ?? "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: name === "guests" ? parseInt(value, 10) || 1 : value,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/provider/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: form.product_id || null,
          product_name: form.product_name,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone || null,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          guests: form.guests,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          (j as { error?: string }).error ?? "Failed to create booking",
        );
      }
      const { booking } = await res.json();
      onCreated(booking as NewBookingResult);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  const matches = filteredCustomers();

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            New Booking
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Customer search combobox */}
          <div ref={searchRef} className="relative col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Guest <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="w-4 h-4 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setShowDropdown(true);
                  if (selectedCustomer) clearCustomer();
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowDropdown(false);
                }}
                placeholder="Search existing customers or enter new…"
                className="w-full rounded-lg border border-neutral-200 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
                autoComplete="off"
              />
            </div>

            {/* Selected customer chip */}
            {selectedCustomer && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-[var(--color-sage)]/15 text-[var(--color-forest)] border border-[var(--color-sage)]/40">
                <svg
                  className="w-3.5 h-3.5 text-[var(--color-sage)]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" />
                </svg>
                <span>
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </span>
                <span className="text-neutral-400 text-xs">
                  {selectedCustomer.email}
                </span>
                <button
                  type="button"
                  onClick={clearCustomer}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label="Clear selected customer"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Dropdown */}
            {showDropdown && !selectedCustomer && (
              <div className="absolute left-0 right-0 top-full mt-1 z-[60] bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
                {matches.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-neutral-400 italic">
                    No existing customers found — fill in details below
                  </div>
                ) : (
                  <ul>
                    {matches.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectCustomer(c);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 transition-colors group"
                        >
                          <span className="block text-sm font-semibold text-neutral-900 group-hover:text-[var(--color-forest)]">
                            {c.first_name} {c.last_name}
                          </span>
                          <span className="block text-xs text-neutral-400 mt-0.5">
                            {c.email}
                            {c.phone ? ` · ${c.phone}` : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Manual entry fields — hidden when a customer is selected */}
            {!selectedCustomer && (
              <>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    required={!selectedCustomer}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="customer_email"
                    type="email"
                    value={form.customer_email}
                    onChange={handleChange}
                    required={!selectedCustomer}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone
                  </label>
                  <input
                    name="customer_phone"
                    type="tel"
                    value={form.customer_phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
                    placeholder="+358 40 000 0000"
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Activity <span className="text-red-500">*</span>
              </label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                required
                disabled={loadingProducts}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)] bg-white disabled:opacity-60"
              >
                {loadingProducts ? (
                  <option value="">Loading activities…</option>
                ) : products.length === 0 ? (
                  <option value="">No products available</option>
                ) : (
                  products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                name="booking_date"
                type="date"
                value={form.booking_date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                name="booking_time"
                type="time"
                value={form.booking_time}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Guests <span className="text-red-500">*</span>
              </label>
              <input
                name="guests"
                type="number"
                min={1}
                max={200}
                value={form.guests}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)] resize-none"
                placeholder="Special requests, dietary requirements…"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[#14301f] transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
