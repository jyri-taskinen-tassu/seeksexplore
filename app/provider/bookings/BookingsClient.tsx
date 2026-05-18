"use client";

import React, { useState, useEffect, useRef } from "react";

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_name: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  status: BookingStatus;
  total_price: number;
  currency: string;
  notes: string | null;
  cancelled_reason: string | null;
  created_at: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };
  const labels: Record<BookingStatus, string> = {
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

// ---- Booking Detail Drawer (SEE-17) ----
function BookingDrawer({
  booking,
  onClose,
}: {
  booking: Booking | null;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!booking) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [booking, onClose]);

  if (!booking) return null;

  const perGuest =
    booking.guests > 0
      ? Math.round(booking.total_price / booking.guests)
      : booking.total_price;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            aria-label="Close drawer"
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

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Status + product */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-neutral-900">
                {booking.product_name}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-neutral-500">
              {formatDate(booking.booking_date)} at {booking.booking_time}
            </p>
          </div>

          {/* Guest info */}
          <div className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Guest
            </h4>
            <div className="text-sm text-neutral-900 font-medium">
              {booking.customer_name}
            </div>
            <div className="text-sm text-neutral-600">
              {booking.customer_email}
            </div>
            {booking.customer_phone && (
              <div className="text-sm text-neutral-600">
                {booking.customer_phone}
              </div>
            )}
            <div className="text-sm text-neutral-600">
              {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Pricing
            </h4>
            <div className="flex justify-between text-sm text-neutral-700">
              <span>
                {formatCurrency(perGuest, booking.currency)} × {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
              </span>
              <span className="font-medium text-neutral-900">
                {formatCurrency(booking.total_price, booking.currency)}
              </span>
            </div>
            <div className="border-t border-neutral-100 pt-2 flex justify-between text-sm font-semibold text-neutral-900">
              <span>Total</span>
              <span>
                {formatCurrency(booking.total_price, booking.currency)}
              </span>
            </div>
          </div>

          {/* Booking metadata */}
          <div className="rounded-lg border border-neutral-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Booking Info
            </h4>
            <div className="text-sm text-neutral-700">
              <span className="text-neutral-500">Booked on: </span>
              {formatDate(booking.created_at.slice(0, 10))}
            </div>
            <div className="text-sm text-neutral-700">
              <span className="text-neutral-500">Booking ID: </span>
              <span className="font-mono text-xs">
                {booking.id.slice(0, 8)}…
              </span>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">
                Notes
              </h4>
              <p className="text-sm text-amber-800">{booking.notes}</p>
            </div>
          )}

          {booking.cancelled_reason && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-1">
                Cancellation Reason
              </h4>
              <p className="text-sm text-red-800">{booking.cancelled_reason}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---- Confirm / Cancel dialog (SEE-18) ----
function ConfirmActionDialog({
  action,
  onConfirm,
  onCancel,
}: {
  action: "confirm" | "cancel";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isCancel = action === "cancel";
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">
          {isCancel ? "Cancel this booking?" : "Confirm this booking?"}
        </h3>
        <p className="text-sm text-neutral-600 mb-5">
          {isCancel
            ? "The guest will need to be notified separately. This cannot be undone."
            : "This will mark the booking as confirmed."}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            className={cx(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              isCancel
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--color-forest)] hover:bg-[#14301f]",
            )}
          >
            {isCancel ? "Yes, cancel" : "Yes, confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- New Booking Modal (SEE-19, SEE-37) ----
const FALLBACK_PRODUCT_NAMES = [
  "Snowmobile Safari (Sport)",
  "Snowmobile Safari (Touring)",
  "E-bike Tour",
  "Northern Lights Tour",
  "Ice Fishing Experience",
  "Reindeer Sleigh Ride",
  "Guided Hiking Tour",
];

function NewBookingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (booking: Booking) => void;
}) {
  const [productNames, setProductNames] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    product_name: "",
    booking_date: "",
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
        const names: string[] = Array.isArray(data.products)
          ? data.products.map((p: { name: string }) => p.name).filter(Boolean)
          : [];
        const list = names.length > 0 ? names : FALLBACK_PRODUCT_NAMES;
        setProductNames(list);
        setForm((prev) => ({ ...prev, product_name: list[0] }));
      })
      .catch(() => {
        setProductNames(FALLBACK_PRODUCT_NAMES);
        setForm((prev) => ({
          ...prev,
          product_name: FALLBACK_PRODUCT_NAMES[0],
        }));
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/provider/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to create booking");
      }
      const { booking } = await res.json();
      onCreated(booking);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

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

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Guest Name <span className="text-red-500">*</span>
              </label>
              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
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
                required
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

            <div className="col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Activity <span className="text-red-500">*</span>
              </label>
              <select
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
                disabled={loadingProducts}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)] bg-white disabled:opacity-60"
              >
                {loadingProducts ? (
                  <option value="">Loading activities…</option>
                ) : (
                  productNames.map((p) => (
                    <option key={p} value={p}>
                      {p}
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
                max={20}
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

// ---- Booking Card ----
function BookingCard({
  booking,
  onClick,
  onStatusChange,
}: {
  booking: Booking;
  onClick: () => void;
  onStatusChange: (id: string, newStatus: BookingStatus) => void;
}) {
  const [pendingAction, setPendingAction] = useState<
    "confirm" | "cancel" | null
  >(null);
  const [busy, setBusy] = useState(false);

  const handleAction = async (action: "confirm" | "cancel") => {
    setBusy(true);
    setPendingAction(null);
    const newStatus: BookingStatus =
      action === "confirm" ? "confirmed" : "cancelled";
    // Optimistic update
    onStatusChange(booking.id, newStatus);
    try {
      await fetch(`/api/provider/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // revert on error — re-fetch or keep optimistic; keep optimistic for now
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {pendingAction && (
        <ConfirmActionDialog
          action={pendingAction}
          onConfirm={() => handleAction(pendingAction)}
          onCancel={() => setPendingAction(null)}
        />
      )}
      <div
        className={cx(
          "rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer",
          booking.status === "cancelled" && "opacity-60",
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-900">
                {booking.product_name}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <div className="text-sm text-neutral-600 space-y-0.5">
              <div>
                <span className="font-medium">{booking.customer_name}</span> •{" "}
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </div>
              <div>
                {formatDate(booking.booking_date)} at {booking.booking_time}
              </div>
              {booking.customer_phone && (
                <div className="text-xs text-neutral-500">
                  {booking.customer_phone}
                </div>
              )}
            </div>
            {booking.notes && (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                {booking.notes}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-semibold text-neutral-900">
              {formatCurrency(booking.total_price, booking.currency)}
            </div>
            <div className="text-xs text-neutral-500">
              Booked {formatDate(booking.created_at.slice(0, 10))}
            </div>
            {/* Action buttons — stop click propagation so card click doesn't fire */}
            <div onClick={(e) => e.stopPropagation()}>
              {booking.status === "pending" && (
                <button
                  disabled={busy}
                  onClick={() => setPendingAction("confirm")}
                  className="rounded-lg bg-[var(--color-forest)] px-3 py-1 text-xs font-medium text-white hover:bg-[#14301f] transition-colors disabled:opacity-50"
                >
                  Confirm
                </button>
              )}
              {booking.status === "confirmed" && (
                <button
                  disabled={busy}
                  onClick={() => setPendingAction("cancel")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Time filter helpers ----
type TimeFilter = "today" | "tomorrow" | "week" | "all";

function getFilteredBookings(
  bookings: Booking[],
  filter: TimeFilter,
): Booking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  switch (filter) {
    case "today":
      return bookings.filter((b) => b.booking_date === todayStr);
    case "tomorrow":
      return bookings.filter((b) => b.booking_date === tomorrowStr);
    case "week":
      return bookings.filter(
        (b) => b.booking_date >= todayStr && b.booking_date <= weekEndStr,
      );
    case "all":
      return bookings;
    default:
      return bookings;
  }
}

// ---- Main client component ----
export default function BookingsClient({
  initialBookings,
}: {
  initialBookings: Booking[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const [drawerBooking, setDrawerBooking] = useState<Booking | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
    );
    // If the drawer is open for this booking, update it too
    setDrawerBooking((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } : prev,
    );
  };

  const handleNewBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  const timeFiltered = getFilteredBookings(bookings, timeFilter);
  const statusFiltered =
    statusFilter === "all"
      ? timeFiltered
      : timeFiltered.filter((b) => b.status === statusFilter);

  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  return (
    <>
      {/* Booking detail drawer */}
      <BookingDrawer
        booking={drawerBooking}
        onClose={() => setDrawerBooking(null)}
      />

      {/* New booking modal */}
      {showNewBookingModal && (
        <NewBookingModal
          onClose={() => setShowNewBookingModal(false)}
          onCreated={handleNewBooking}
        />
      )}

      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Upcoming Bookings
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Manage and review all upcoming bookings for the next 4 weeks.
              </p>
            </div>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-medium text-white hover:bg-[#14301f] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              New Booking
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">Total Bookings</div>
              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {bookings.length}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">Confirmed</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-600">
                {confirmedCount}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">Pending</div>
              <div className="mt-1 text-2xl font-semibold text-amber-600">
                {pendingCount}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="text-sm text-neutral-600">Total Revenue</div>
              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">
                Time:
              </span>
              <div className="flex gap-2">
                {(["today", "tomorrow", "week", "all"] as TimeFilter[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={cx(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        timeFilter === filter
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                      )}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">
                Status:
              </span>
              <div className="flex gap-2">
                {(["all", "confirmed", "pending", "cancelled"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={cx(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        statusFilter === filter
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                      )}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-3">
            {statusFiltered.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
                <p className="text-neutral-600">
                  No bookings found for the selected filters.
                </p>
              </div>
            ) : (
              statusFiltered.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => setDrawerBooking(booking)}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
