"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DbBooking = {
  id: string;
  provider_id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  product_name: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:MM
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number;
  currency: string;
  notes: string | null;
  cancelled_reason: string | null;
  product_capacity: number | null;
};

type ResourceAvailability = {
  category_id: string;
  category_name: string;
  variant_id: string;
  variant_name: string;
  total_units: number;
  booked_units: number;
};

type ResourceByCategory = {
  category_id: string;
  category_name: string;
  variants: ResourceAvailability[];
  hasConflict: boolean;
};

type UiStatus = "ok" | "attention" | "problem";

type UiBooking = {
  id: string;
  title: string; // product_name
  time: string; // HH:MM
  guestsBooked: number;
  guestsCap: number;
  status: UiStatus;
  customerName: string;
  notes: string | null;
  raw: DbBooking;
};

type DayData = {
  date: string;
  dayNumber: number;
  bookings: UiBooking[];
  inMonth: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMonthTitle(year: number, monthIndex0: number): string {
  return new Date(year, monthIndex0, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function computeStatus(b: DbBooking): UiStatus {
  if (b.status === "cancelled") return "problem";
  if (b.status === "pending") return "attention";
  return "ok";
}

function toUiBooking(b: DbBooking): UiBooking {
  return {
    id: b.id,
    title: b.product_name,
    time: b.booking_time.slice(0, 5),
    guestsBooked: b.guests,
    guestsCap: b.product_capacity ?? 0,
    status: computeStatus(b),
    customerName: b.customer_name,
    notes: b.notes,
    raw: b,
  };
}

function generateMonthGrid(year: number, monthIndex0: number) {
  const first = new Date(year, monthIndex0, 1);
  const startDow = (first.getDay() + 6) % 7;
  const startDate = new Date(year, monthIndex0, 1 - startDow);
  const grid: Array<{ date: Date; dayNumber: number; inMonth: boolean }> = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    grid.push({
      date: d,
      dayNumber: d.getDate(),
      inMonth: d.getMonth() === monthIndex0,
    });
  }
  return grid;
}

function getWeekDates(anchorDate: Date): string[] {
  const dayOfWeek = (anchorDate.getDay() + 6) % 7;
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() - dayOfWeek);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(formatISO(d));
  }
  return dates;
}

function groupByCategory(
  resources: ResourceAvailability[],
): ResourceByCategory[] {
  const map = new Map<string, ResourceByCategory>();
  for (const r of resources) {
    if (!map.has(r.category_id)) {
      map.set(r.category_id, {
        category_id: r.category_id,
        category_name: r.category_name,
        variants: [],
        hasConflict: false,
      });
    }
    const cat = map.get(r.category_id)!;
    cat.variants.push(r);
    if (r.booked_units > r.total_units) cat.hasConflict = true;
  }
  return Array.from(map.values());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: UiStatus }) {
  const map = {
    ok: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    attention: "bg-amber-50 text-amber-700 ring-amber-200",
    problem: "bg-red-50 text-red-700 ring-red-200",
  } as const;
  const label =
    status === "ok"
      ? "Confirmed"
      : status === "attention"
        ? "Pending"
        : "Cancelled";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        map[status],
      )}
    >
      <span
        className={cx(
          "h-2 w-2 rounded-full",
          status === "ok" && "bg-emerald-500",
          status === "attention" && "bg-amber-500",
          status === "problem" && "bg-red-500",
        )}
      />
      {label}
    </span>
  );
}

// ─── ResourceSummaryBar ───────────────────────────────────────────────────────

function ResourceSummaryBar({
  categories,
  loading,
}: {
  categories: ResourceByCategory[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
        Loading resource summary…
      </div>
    );
  }

  const active = categories.filter((c) =>
    c.variants.some((v) => v.total_units > 0),
  );

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center text-xs text-neutral-500">
        No resources configured
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((cat) => {
        const totalBooked = cat.variants.reduce(
          (s, v) => s + v.booked_units,
          0,
        );
        const totalCap = cat.variants.reduce((s, v) => s + v.total_units, 0);
        const pct =
          totalCap > 0 ? Math.min((totalBooked / totalCap) * 100, 100) : 0;
        const over = cat.hasConflict;

        return (
          <div
            key={cat.category_id}
            className={cx(
              "rounded-lg border p-3",
              over ? "border-red-200 bg-red-50" : "border-neutral-200 bg-white",
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div
                className={cx(
                  "text-xs font-medium",
                  over ? "text-red-800" : "text-neutral-700",
                )}
              >
                {cat.category_name}
                {over && (
                  <span className="ml-1.5 text-red-600 font-bold">⚠</span>
                )}
              </div>
              <div
                className={cx(
                  "text-xs font-mono",
                  over ? "text-red-700 font-semibold" : "text-neutral-600",
                )}
              >
                {totalBooked}/{totalCap}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className={cx(
                  "h-full rounded-full transition-all",
                  over
                    ? "bg-red-500"
                    : pct >= 80
                      ? "bg-amber-400"
                      : "bg-emerald-500",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Variant detail (shown if > 1 variant) */}
            {cat.variants.length > 1 && (
              <div className="mt-2 space-y-0.5">
                {cat.variants.map((v) => (
                  <div
                    key={v.variant_id}
                    className="flex items-center justify-between text-[11px] text-neutral-500"
                  >
                    <span>{v.variant_name}</span>
                    <span
                      className={cx(
                        v.booked_units > v.total_units &&
                          "text-red-600 font-medium",
                      )}
                    >
                      {v.booked_units}/{v.total_units}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── DayCell ──────────────────────────────────────────────────────────────────

function DayCell({
  day,
  selected,
  onSelect,
}: {
  day: DayData;
  selected: boolean;
  onSelect: (d: DayData) => void;
}) {
  const hasBookings = day.bookings.length > 0;
  const inMonth = day.inMonth;
  const totalGuests = day.bookings.reduce((s, b) => s + b.guestsBooked, 0);
  const hasPending = day.bookings.some((b) => b.status === "attention");
  const hasCancelled = day.bookings.some((b) => b.status === "problem");

  const dotColor = hasCancelled
    ? "bg-red-500"
    : hasPending
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cx(
        "relative w-full text-left p-3 min-h-[100px] border border-neutral-200 transition",
        inMonth
          ? "bg-white hover:bg-neutral-50"
          : "bg-neutral-50 text-neutral-400",
        selected && "ring-2 ring-neutral-900",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className={cx(
            "text-sm font-medium",
            selected
              ? "text-neutral-900"
              : inMonth
                ? "text-neutral-800"
                : "text-neutral-400",
          )}
        >
          {day.dayNumber}
        </div>
        {hasBookings && inMonth && (
          <span className={cx("h-2 w-2 rounded-full", dotColor)} />
        )}
      </div>

      {hasBookings && inMonth ? (
        <div className="space-y-1">
          <div className="text-xs font-medium text-neutral-900">
            {day.bookings.length}{" "}
            {day.bookings.length === 1 ? "booking" : "bookings"}
          </div>
          {totalGuests > 0 && (
            <div className="text-[11px] text-neutral-600">
              {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
            </div>
          )}
        </div>
      ) : inMonth ? (
        <div className="mt-4 text-xs text-neutral-400">No bookings</div>
      ) : null}
    </button>
  );
}

// ─── BookingRow ───────────────────────────────────────────────────────────────

function BookingRow({
  b,
  onClick,
}: {
  b: UiBooking;
  onClick: (b: UiBooking) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(b)}
      className="w-full text-left rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 hover:bg-neutral-50 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cx(
                "h-2.5 w-2.5 rounded-full shrink-0",
                b.status === "ok" && "bg-emerald-500",
                b.status === "attention" && "bg-amber-500",
                b.status === "problem" && "bg-red-500",
              )}
            />
            <div className="font-medium text-neutral-900">{b.title}</div>
          </div>
          <div className="mt-1 text-sm text-neutral-600">
            {b.time} · {b.guestsBooked} guest{b.guestsBooked !== 1 ? "s" : ""}
            {b.guestsCap > 0 && (
              <span className="text-neutral-400"> / {b.guestsCap} cap</span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-neutral-500">
            {b.customerName}
          </div>
        </div>
        <StatusPill status={b.status} />
      </div>
    </button>
  );
}

// ─── WeekView ─────────────────────────────────────────────────────────────────

function WeekView({
  weekDates,
  allBookings,
  selectedDate,
  onSelectDay,
  onBookingClick,
}: {
  weekDates: string[];
  allBookings: DbBooking[];
  selectedDate: string;
  onSelectDay: (date: string) => void;
  onBookingClick: (b: UiBooking) => void;
}) {
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDates.map((date, idx) => {
        const bookings = allBookings
          .filter((b) => b.booking_date === date)
          .map(toUiBooking)
          .sort((a, b) => a.time.localeCompare(b.time));
        const dayNum = new Date(date + "T00:00:00").getDate();

        return (
          <div
            key={date}
            className="border border-neutral-200 rounded-lg bg-white"
          >
            <div
              className={cx(
                "border-b border-neutral-200 px-3 py-2 text-sm font-medium",
                date === selectedDate && "bg-neutral-900 text-white",
              )}
            >
              <div>{dayNames[idx]}</div>
              <div className="text-xs font-normal">{dayNum}</div>
            </div>
            <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
              {bookings.length === 0 ? (
                <div className="text-xs text-neutral-400 text-center py-4">
                  No bookings
                </div>
              ) : (
                bookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectDay(date);
                      onBookingClick(b);
                    }}
                    className="w-full text-left p-2 rounded border border-neutral-200 hover:bg-neutral-50 transition"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cx(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          b.status === "ok" && "bg-emerald-500",
                          b.status === "attention" && "bg-amber-500",
                          b.status === "problem" && "bg-red-500",
                        )}
                      />
                      <div className="text-xs font-medium text-neutral-900 truncate">
                        {b.time}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-600 mt-0.5 truncate">
                      {b.title}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {b.guestsBooked} guest{b.guestsBooked !== 1 ? "s" : ""}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AddBookingModal ──────────────────────────────────────────────────────────

function AddBookingModal({
  prefilledDate,
  productOptions,
  onClose,
  onSaved,
}: {
  prefilledDate: string;
  productOptions: { id: string; name: string }[];
  onClose: () => void;
  onSaved: (b: DbBooking) => void;
}) {
  const [productId, setProductId] = React.useState(productOptions[0]?.id ?? "");
  const [date, setDate] = React.useState(prefilledDate);
  const [time, setTime] = React.useState("09:00");
  const [guests, setGuests] = React.useState(2);
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selectedProduct = productOptions.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/provider/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId || null,
          product_name: selectedProduct?.name ?? "",
          customer_name: customerName,
          customer_email: customerEmail,
          booking_date: date,
          booking_time: time,
          guests,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to save");
      }
      const j = await res.json();
      onSaved(j.booking as DbBooking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-900">
            Add Booking
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Product */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Product
            </label>
            {productOptions.length > 0 ? (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-neutral-500 italic">
                No products available
              </div>
            )}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Guests
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Customer name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="e.g. Anna Smith"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Customer email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                placeholder="e.g. anna@example.com"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes…"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── BookingSlideOver ─────────────────────────────────────────────────────────

function BookingSlideOver({
  booking,
  onClose,
  onSaved,
}: {
  booking: UiBooking;
  onClose: () => void;
  onSaved: (b: DbBooking) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [status, setStatus] = React.useState(booking.raw.status);
  const [notes, setNotes] = React.useState(booking.raw.notes ?? "");
  const [cancelledReason, setCancelledReason] = React.useState(
    booking.raw.cancelled_reason ?? "",
  );

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/provider/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes: notes || null,
          cancelled_reason: cancelledReason || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Save failed");
      }
      const j = await res.json();
      onSaved(j.booking as DbBooking);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  const raw = booking.raw;
  const price =
    raw.total_price > 0 ? `${raw.total_price} ${raw.currency}` : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              {editing ? "Edit Booking" : "Booking Details"}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              {raw.booking_date} · {booking.time}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900 transition text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!editing ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900 text-base">
                  {raw.product_name}
                </h3>
                <StatusPill status={booking.status} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-neutral-500">Customer</div>
                  <div className="text-sm font-medium text-neutral-900 mt-0.5">
                    {raw.customer_name}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {raw.customer_email}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Guests</div>
                  <div className="text-sm font-medium text-neutral-900 mt-0.5">
                    {raw.guests}
                    {raw.product_capacity && (
                      <span className="text-neutral-400">
                        {" "}
                        / {raw.product_capacity} cap
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Time</div>
                  <div className="text-sm font-medium text-neutral-900 mt-0.5">
                    {booking.time}
                  </div>
                </div>
                {price && (
                  <div>
                    <div className="text-xs text-neutral-500">Total</div>
                    <div className="text-sm font-medium text-neutral-900 mt-0.5">
                      {price}
                    </div>
                  </div>
                )}
              </div>

              {raw.notes && (
                <div>
                  <div className="text-xs font-medium text-neutral-700 mb-1">
                    Notes
                  </div>
                  <p className="text-sm text-neutral-600">{raw.notes}</p>
                </div>
              )}

              {raw.cancelled_reason && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <div className="text-xs font-medium text-red-700 mb-1">
                    Cancellation reason
                  </div>
                  <p className="text-sm text-red-800">{raw.cancelled_reason}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as "pending" | "confirmed" | "cancelled",
                    )
                  }
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {status === "cancelled" && (
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Cancellation reason
                  </label>
                  <input
                    type="text"
                    value={cancelledReason}
                    onChange={(e) => setCancelledReason(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 px-6 py-4 shrink-0">
          {!editing ? (
            <div className="flex items-center justify-end">
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setError(null);
                }}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main AvailabilityClient ──────────────────────────────────────────────────

export default function AvailabilityClient({
  initialBookings,
  productOptions,
}: {
  initialBookings: DbBooking[];
  productOptions: { id: string; name: string }[];
}) {
  const [allBookings, setAllBookings] =
    React.useState<DbBooking[]>(initialBookings);
  const [view, setView] = React.useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = React.useState<Date>(
    new Date(2026, 4, 1),
  );

  const year = currentDate.getFullYear();
  const monthIndex0 = currentDate.getMonth();

  // Modals
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingBooking, setEditingBooking] = React.useState<UiBooking | null>(
    null,
  );

  // Resource summary
  const [resourceCategories, setResourceCategories] = React.useState<
    ResourceByCategory[]
  >([]);
  const [loadingResources, setLoadingResources] = React.useState(false);

  // Build calendar grid
  const monthGrid = generateMonthGrid(year, monthIndex0);
  const weekDates = getWeekDates(currentDate);
  const monthTitle = formatMonthTitle(year, monthIndex0);

  function getDayData(date: string, inMonth: boolean): DayData {
    const bookings = allBookings
      .filter((b) => b.booking_date === date)
      .map(toUiBooking)
      .sort((a, b) => a.time.localeCompare(b.time));
    return {
      date,
      dayNumber: new Date(date + "T00:00:00").getDate(),
      bookings,
      inMonth,
    };
  }

  const calendarDays: DayData[] = monthGrid.map((cell) =>
    getDayData(formatISO(cell.date), cell.inMonth),
  );

  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const first = calendarDays.find((d) => d.bookings.length > 0);
    return first?.date ?? calendarDays[0]?.date ?? "";
  });

  // Fetch resource summary when selected date changes
  React.useEffect(() => {
    if (!selectedDate) return;
    setLoadingResources(true);
    fetch(`/api/provider/availability/resources?date=${selectedDate}`)
      .then((r) => r.json())
      .then((j) => {
        setResourceCategories(
          groupByCategory((j.resources as ResourceAvailability[]) ?? []),
        );
      })
      .catch(() => setResourceCategories([]))
      .finally(() => setLoadingResources(false));
  }, [selectedDate]);

  // Update selected date when navigating months/weeks
  React.useEffect(() => {
    if (view === "month") {
      const newDays = generateMonthGrid(
        currentDate.getFullYear(),
        currentDate.getMonth(),
      ).map((cell) => getDayData(formatISO(cell.date), cell.inMonth));
      const first = newDays.find((d) => d.bookings.length > 0);
      if (first) setSelectedDate(first.date);
    } else {
      const dates = getWeekDates(currentDate);
      setSelectedDate(dates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDate.getTime()]);

  const selectedDayData =
    view === "month"
      ? (calendarDays.find((d) => d.date === selectedDate) ??
        getDayData(selectedDate, true))
      : getDayData(selectedDate, true);

  const totalBookings = selectedDayData.bookings.length;
  const totalGuests = selectedDayData.bookings.reduce(
    (s, b) => s + b.guestsBooked,
    0,
  );
  const hasAnyConflict = resourceCategories.some((c) => c.hasConflict);

  // Handlers
  function handleBookingAdded(b: DbBooking) {
    setAllBookings((prev) => [...prev, b]);
    setSelectedDate(b.booking_date);
    setShowAddModal(false);
  }

  function handleBookingSaved(b: DbBooking) {
    setAllBookings((prev) => prev.map((x) => (x.id === b.id ? b : x)));
    setEditingBooking(null);
    // Refresh resource summary
    setLoadingResources(true);
    fetch(`/api/provider/availability/resources?date=${selectedDate}`)
      .then((r) => r.json())
      .then((j) =>
        setResourceCategories(
          groupByCategory((j.resources as ResourceAvailability[]) ?? []),
        ),
      )
      .catch(() => {})
      .finally(() => setLoadingResources(false));
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                Availability
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                {view === "month"
                  ? "Month view. Click a day to review bookings and resource usage."
                  : "Week view. Click a booking to see details."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("month")}
                className={cx(
                  "rounded-lg border px-3 py-2 text-sm",
                  view === "month"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                )}
              >
                Month
              </button>
              <button
                onClick={() => setView("week")}
                className={cx(
                  "rounded-lg border px-3 py-2 text-sm",
                  view === "week"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white hover:bg-neutral-50",
                )}
              >
                Week
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
            {/* Calendar / Week View */}
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const d = new Date(currentDate);
                      if (view === "month") d.setMonth(monthIndex0 - 1);
                      else d.setDate(d.getDate() - 7);
                      setCurrentDate(d);
                    }}
                    className="h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    aria-label="Previous"
                  >
                    ‹
                  </button>
                  <div className="text-base font-medium text-neutral-900">
                    {monthTitle}
                  </div>
                  <button
                    onClick={() => {
                      const d = new Date(currentDate);
                      if (view === "month") d.setMonth(monthIndex0 + 1);
                      else d.setDate(d.getDate() + 7);
                      setCurrentDate(d);
                    }}
                    className="h-9 w-9 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
                <div className="text-xs text-neutral-500">
                  {view === "month" ? "5 weeks view" : "Week view"}
                </div>
              </div>

              {view === "month" ? (
                <>
                  <div className="grid grid-cols-7 border-b border-neutral-200 text-xs text-neutral-500">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (w) => (
                        <div key={w} className="px-3 py-2">
                          {w}
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, idx) => (
                      <div
                        key={day.date}
                        className={cx(
                          "border-b border-r border-neutral-200",
                          idx % 7 === 6 && "border-r-0",
                          idx >= calendarDays.length - 7 && "border-b-0",
                        )}
                      >
                        <DayCell
                          day={day}
                          selected={day.date === selectedDate}
                          onSelect={(d) => setSelectedDate(d.date)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-4">
                  <WeekView
                    weekDates={weekDates}
                    allBookings={allBookings}
                    selectedDate={selectedDate}
                    onSelectDay={setSelectedDate}
                    onBookingClick={setEditingBooking}
                  />
                </div>
              )}
            </div>

            {/* Selected day panel */}
            <aside className="rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-200 px-5 py-4">
                <div className="text-sm font-medium text-neutral-900">
                  Selected day
                </div>
                <div className="mt-1 text-sm text-neutral-600">
                  {selectedDate}
                </div>
              </div>

              <div className="px-5 py-4 space-y-5">
                {/* Summary row */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-700">
                    <span className="font-medium">{totalBookings}</span>{" "}
                    {totalBookings === 1 ? "booking" : "bookings"}{" "}
                    <span className="text-neutral-400">·</span>{" "}
                    <span className="font-medium">{totalGuests}</span>{" "}
                    {totalGuests === 1 ? "guest" : "guests"}
                  </div>
                  {hasAnyConflict && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200">
                      ⚠ Resource conflict
                    </span>
                  )}
                </div>

                {/* Resource summary */}
                <div>
                  <div className="text-xs font-medium text-neutral-700 mb-2">
                    Resources
                  </div>
                  <ResourceSummaryBar
                    categories={resourceCategories}
                    loading={loadingResources}
                  />
                </div>

                {/* Bookings list */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-neutral-900">
                      Bookings
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {selectedDayData.bookings.length ? (
                      selectedDayData.bookings.map((b) => (
                        <BookingRow
                          key={b.id}
                          b={b}
                          onClick={setEditingBooking}
                        />
                      ))
                    ) : (
                      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                        No bookings for this day.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <AddBookingModal
          prefilledDate={selectedDate}
          productOptions={productOptions}
          onClose={() => setShowAddModal(false)}
          onSaved={handleBookingAdded}
        />
      )}

      {/* Booking Slide-Over */}
      {editingBooking && (
        <BookingSlideOver
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={handleBookingSaved}
        />
      )}
    </>
  );
}
