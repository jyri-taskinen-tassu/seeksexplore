"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  NewBookingModal,
  type NewBookingResult,
} from "@/app/components/provider/NewBookingModal";

export type BookingStatus = "confirmed" | "pending" | "cancelled";

export type Booking = {
  id: string;
  provider_id?: string;
  product_id?: string | null;
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
    pending: "bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)] ring-[var(--terracotta)]/20",
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
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
          <h2 className="text-lg font-semibold text-[var(--green-900)]">
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--ink-sub)] hover:bg-[var(--cream-50)] hover:text-[var(--green-900)] transition-colors"
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
              <h3 className="text-base font-semibold text-[var(--green-900)]">
                {booking.product_name}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-sm text-[var(--ink-sub)]">
              {formatDate(booking.booking_date)} at {booking.booking_time}
            </p>
          </div>

          {/* Guest info */}
          <div className="rounded-lg border border-[var(--line)] p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-sub)] opacity-70">
              Guest
            </h4>
            <div className="text-sm text-[var(--ink)] font-medium">
              {booking.customer_name}
            </div>
            <div className="text-sm text-[var(--ink-sub)]">
              {booking.customer_email}
            </div>
            {booking.customer_phone && (
              <div className="text-sm text-[var(--ink-sub)]">
                {booking.customer_phone}
              </div>
            )}
            <div className="text-sm text-[var(--ink-sub)]">
              {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="rounded-lg border border-[var(--line)] p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-sub)] opacity-70">
              Pricing
            </h4>
            <div className="flex justify-between text-sm text-[var(--ink)]">
              <span>
                {formatCurrency(perGuest, booking.currency)} × {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
              </span>
              <span className="font-medium text-[var(--ink)]">
                {formatCurrency(booking.total_price, booking.currency)}
              </span>
            </div>
            <div className="border-t border-[var(--line)] pt-2 flex justify-between text-sm font-semibold text-[var(--ink)]">
              <span>Total</span>
              <span>
                {formatCurrency(booking.total_price, booking.currency)}
              </span>
            </div>
          </div>

          {/* Booking metadata */}
          <div className="rounded-lg border border-[var(--line)] p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-sub)] opacity-70">
              Booking Info
            </h4>
            <div className="text-sm text-[var(--ink)]">
              <span className="text-[var(--ink-sub)]">Booked on: </span>
              {formatDate(booking.created_at.slice(0, 10))}
            </div>
            <div className="text-sm text-[var(--ink)]">
              <span className="text-[var(--ink-sub)]">Booking ID: </span>
              <span className="font-mono text-xs opacity-70">
                {booking.id.slice(0, 8)}…
              </span>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="rounded-lg bg-[var(--terracotta)]/5 border border-[var(--terracotta)]/20 px-4 py-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--terracotta-dark)] mb-1">
                Notes
              </h4>
              <p className="text-sm text-[var(--terracotta-dark)] opacity-90">{booking.notes}</p>
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 border border-[var(--line)]">
        <h3 className="text-base font-semibold text-[var(--green-900)] mb-2">
          {isCancel ? "Cancel this booking?" : "Confirm this booking?"}
        </h3>
        <p className="text-sm text-[var(--ink-sub)] mb-5">
          {isCancel
            ? "The guest will need to be notified separately. This cannot be undone."
            : "This will mark the booking as confirmed."}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            className={cx(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors shadow-sm",
              isCancel
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[var(--green-800)] hover:bg-[var(--green-900)]",
            )}
          >
            {isCancel ? "Yes, cancel" : "Yes, confirm"}
          </button>
        </div>
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
          "rounded-lg border border-[var(--line)] bg-white p-4 hover:shadow-md transition-all cursor-pointer hover:border-[var(--green-800)]/30",
          booking.status === "cancelled" && "opacity-60",
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[var(--ink)]">
                {booking.product_name}
              </h3>
              <StatusBadge status={booking.status} />
            </div>
            <div className="text-sm text-[var(--ink-sub)] space-y-0.5">
              <div>
                <span className="font-medium text-[var(--ink)]">{booking.customer_name}</span> •{" "}
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </div>
              <div>
                {formatDate(booking.booking_date)} at {booking.booking_time}
              </div>
              {booking.customer_phone && (
                <div className="text-xs opacity-70">
                  {booking.customer_phone}
                </div>
              )}
            </div>
            {booking.notes && (
              <div className="mt-2 text-xs text-[var(--terracotta-dark)] bg-[var(--terracotta)]/5 rounded px-2 py-1 inline-block">
                {booking.notes}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-semibold text-[var(--green-900)]">
              {formatCurrency(booking.total_price, booking.currency)}
            </div>
            <div className="text-xs text-[var(--ink-sub)] opacity-70">
              Booked {formatDate(booking.created_at.slice(0, 10))}
            </div>
            {/* Action buttons — stop click propagation so card click doesn't fire */}
            <div onClick={(e) => e.stopPropagation()}>
              {booking.status === "pending" && (
                <button
                  disabled={busy}
                  onClick={() => setPendingAction("confirm")}
                  className="rounded-lg bg-[var(--green-800)] px-3 py-1 text-xs font-medium text-white hover:bg-[var(--green-900)] transition-colors disabled:opacity-50 shadow-sm"
                >
                  Confirm
                </button>
              )}
              {booking.status === "confirmed" && (
                <button
                  disabled={busy}
                  onClick={() => setPendingAction("cancel")}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 shadow-sm"
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

  const handleNewBooking = (booking: NewBookingResult) => {
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

      <div className="min-h-screen bg-[var(--cream-50)]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-[var(--green-900)]">
                Upcoming Bookings
              </h1>
              <p className="mt-1 text-sm text-[var(--ink-sub)]">
                Manage and review all upcoming bookings for the next 4 weeks.
              </p>
            </div>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--green-900)] transition-colors shadow-sm"
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
            <div className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="text-sm text-[var(--ink-sub)]">Total Bookings</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                {bookings.length}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="text-sm text-[var(--ink-sub)]">Confirmed</div>
              <div className="mt-1 text-2xl font-semibold text-emerald-600">
                {confirmedCount}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="text-sm text-[var(--ink-sub)]">Pending</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--terracotta-dark)]">
                {pendingCount}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="text-sm text-[var(--ink-sub)]">Total Revenue</div>
              <div className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--ink-sub)]">
                Time:
              </span>
              <div className="flex gap-2">
                {(["today", "tomorrow", "week", "all"] as TimeFilter[]).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={cx(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all shadow-sm",
                        timeFilter === filter
                          ? "border-[var(--green-900)] bg-[var(--green-900)] text-white"
                          : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
                      )}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--ink-sub)]">
                Status:
              </span>
              <div className="flex gap-2">
                {(["all", "confirmed", "pending", "cancelled"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={cx(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all shadow-sm",
                        statusFilter === filter
                          ? "border-[var(--green-900)] bg-[var(--green-900)] text-white"
                          : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
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
              <div className="rounded-lg border border-[var(--line)] bg-[var(--cream-100)] p-8 text-center">
                <p className="text-[var(--ink-sub)]">
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
