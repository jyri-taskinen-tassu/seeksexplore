"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import CustomerTagInput from "@/app/components/provider/CustomerTagInput";

export type CustomerTag = "vip" | "repeat" | "group" | "corporate" | "family";
export type SalesStage =
  | "inquiry"
  | "quoted"
  | "followup"
  | "booked"
  | "completed";

export type Customer = {
  id: string;
  provider_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  tags: string[];
  total_bookings: number;
  total_spent: number;
  currency: string;
  first_booking_date?: string | null;
  last_booking_date?: string | null;
  notes?: string | null;
  // Pipeline fields (merged from sales_opportunities)
  pipeline_stage: SalesStage;
  pipeline_estimated_value: number;
  pipeline_guests: number;
  pipeline_preferred_date?: string | null;
  pipeline_notes?: string | null;
  pipeline_position: number;
  pipeline_product_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  customer_email: string;
  customer_name: string;
  product_name: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number;
  currency: string;
  notes?: string | null;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Simple inline tag badge for the customer card list (read-only) */
function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--cream-100)] px-2 py-0.5 text-xs font-medium text-[var(--ink)] ring-1 ring-[var(--line)]">
      {tag}
    </span>
  );
}

function CustomerCard({
  customer,
  onSelect,
  selected,
}: {
  customer: Customer;
  onSelect: (customer: Customer) => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(customer)}
      className={cx(
        "w-full text-left rounded-lg border p-4 transition-all",
        selected
          ? "border-[var(--green-800)] bg-white ring-2 ring-[var(--green-800)]/20"
          : "border-[var(--line)] bg-white hover:border-[var(--green-800)]/30 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-[var(--green-900)]">
              {customer.first_name} {customer.last_name}
            </h3>
            {customer.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <div className="text-sm text-[var(--ink-sub)] space-y-0.5">
            <div>{customer.email}</div>
            {customer.phone && <div>{customer.phone}</div>}
            {customer.country && <div>{customer.country}</div>}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-semibold text-[var(--green-900)]">
            {formatCurrency(customer.total_spent, customer.currency)}
          </div>
          <div className="text-[var(--ink-sub)] opacity-70">
            {customer.total_bookings}{" "}
            {customer.total_bookings === 1 ? "booking" : "bookings"}
          </div>
        </div>
      </div>
    </button>
  );
}

function NotesEditor({
  customerId,
  initialNotes,
  onSave,
}: {
  customerId: string;
  initialNotes: string | null | undefined;
  onSave: (customerId: string, notes: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(customerId, value);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm focus:border-[var(--green-800)] focus:ring-1 focus:ring-[var(--green-800)] outline-none resize-none"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[var(--green-900)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setValue(initialNotes ?? "");
              setEditing(false);
            }}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--cream-50)]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="w-full text-left rounded-lg border border-[var(--line)] bg-[var(--cream-50)]/50 p-3 text-sm text-[var(--ink)] hover:border-[var(--green-800)]/30 transition-colors min-h-[60px]"
    >
      {value || (
        <span className="text-[var(--ink-sub)] opacity-50 italic">Click to add notes…</span>
      )}
    </button>
  );
}

const STATUS_STYLES: Record<
  Booking["status"],
  { badge: string; label: string }
> = {
  confirmed: {
    badge: "bg-green-50 text-green-700 ring-green-200",
    label: "Confirmed",
  },
  pending: {
    badge: "bg-[var(--terracotta)]/5 text-[var(--terracotta-dark)] ring-[var(--terracotta)]/20",
    label: "Pending",
  },
  cancelled: {
    badge: "bg-red-50 text-red-600 ring-red-200",
    label: "Cancelled",
  },
};

function BookingRow({ booking }: { booking: Booking }) {
  const style = STATUS_STYLES[booking.status];
  const dateObj = new Date(booking.booking_date);
  return (
    <div className="flex items-start gap-4 rounded-lg border border-[var(--line)] bg-white p-4">
      <div className="flex-shrink-0 text-center min-w-[52px]">
        <div className="text-xs font-semibold text-[var(--ink-sub)] uppercase tracking-wide opacity-70">
          {dateObj.toLocaleDateString("en-US", { month: "short" })}
        </div>
        <div className="text-lg font-bold text-[var(--green-900)] leading-none">
          {dateObj.getUTCDate()}
        </div>
        <div className="text-xs text-[var(--ink-sub)] mt-0.5 opacity-60">
          {booking.booking_time}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[var(--ink)] truncate">
            {booking.product_name}
          </span>
          <span
            className={cx(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
              style.badge,
            )}
          >
            {style.label}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-[var(--ink-sub)]">
          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
        </div>
        {booking.notes && (
          <div className="mt-1 text-xs text-[var(--ink-sub)] italic truncate opacity-70">
            {booking.notes}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-semibold text-[var(--green-900)]">
          {formatCurrency(Number(booking.total_price), booking.currency)}
        </div>
      </div>
    </div>
  );
}

function CustomerDetailPanel({
  customer,
  bookings,
  onTagsChange,
  onNotesChange,
}: {
  customer: Customer;
  bookings: Booking[];
  onTagsChange: (customerId: string, tags: string[]) => Promise<void>;
  onNotesChange: (customerId: string, notes: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings">(
    "overview",
  );

  return (
    <>
      <div className="border-b border-[var(--line)] px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--green-900)] mb-3">
            {customer.first_name} {customer.last_name}
          </h2>
          <CustomerTagInput
            customerId={customer.id}
            initialTags={customer.tags}
            onTagsChange={onTagsChange}
          />
        </div>
      </div>

      <div className="border-b border-[var(--line)] px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={cx(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              activeTab === "overview"
                ? "border-[var(--green-900)] text-[var(--green-900)]"
                : "border-transparent text-[var(--ink-sub)] hover:text-[var(--ink)]",
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={cx(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5",
              activeTab === "bookings"
                ? "border-[var(--green-900)] text-[var(--green-900)]"
                : "border-transparent text-[var(--ink-sub)] hover:text-[var(--ink)]",
            )}
          >
            Bookings
            {bookings.length > 0 && (
              <span className="rounded-full bg-[var(--cream-100)] px-1.5 py-0.5 text-xs font-medium text-[var(--ink)]">
                {bookings.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--green-900)] mb-3">
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-[var(--ink-sub)] opacity-70">Email:</span>{" "}
                  <span className="text-[var(--ink)] font-medium">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div>
                    <span className="text-[var(--ink-sub)] opacity-70">Phone:</span>{" "}
                    <span className="text-[var(--ink)] font-medium">{customer.phone}</span>
                  </div>
                )}
                {customer.country && (
                  <div>
                    <span className="text-[var(--ink-sub)] opacity-70">Country:</span>{" "}
                    <span className="text-[var(--ink)] font-medium">{customer.country}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-[var(--line)] p-4 bg-[var(--cream-50)]/30">
                <div className="text-sm text-[var(--ink-sub)]">Total Bookings</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--green-900)]">
                  {customer.total_bookings}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--line)] p-4 bg-[var(--cream-50)]/30">
                <div className="text-sm text-[var(--ink-sub)]">Total Spent</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--green-900)]">
                  {formatCurrency(customer.total_spent, customer.currency)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--ink-sub)]">First Booking</div>
                <div className="mt-1 text-sm font-medium text-[var(--ink)]">
                  {formatDate(customer.first_booking_date)}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--ink-sub)]">Last Booking</div>
                <div className="mt-1 text-sm font-medium text-[var(--ink)]">
                  {formatDate(customer.last_booking_date)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--green-900)] mb-2">
                Notes
              </h3>
              <NotesEditor
                customerId={customer.id}
                initialNotes={customer.notes}
                onSave={onNotesChange}
              />
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div>
            {bookings.length === 0 ? (
              <div className="text-sm text-[var(--ink-sub)] text-center py-12">
                No bookings found for this customer.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <BookingRow key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function KanbanCard({
  customer,
  onClick,
  isDragging,
}: {
  customer: Customer;
  onClick: () => void;
  isDragging: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "rounded-lg border border-[var(--line)] bg-white p-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none hover:border-[var(--green-800)]/30",
        isDragging && "opacity-60 shadow-lg ring-2 ring-[var(--green-800)]/20",
      )}
    >
      <div className="mb-1.5">
        <div className="font-medium text-xs text-[var(--ink)] mb-0.5">
          {customer.first_name} {customer.last_name}
        </div>
        <div className="text-[11px] text-[var(--ink-sub)]">
          {customer.pipeline_product_name || "No product"}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="text-[var(--ink-sub)] opacity-70">
          {customer.pipeline_guests} guests
        </span>
        <span className="font-semibold text-[var(--green-900)]">
          {formatCurrency(
            customer.pipeline_estimated_value,
            customer.currency,
          )}
        </span>
      </div>
      {customer.pipeline_preferred_date && (
        <div className="text-[11px] text-[var(--ink-sub)] opacity-60 mb-1.5">
          {formatDate(customer.pipeline_preferred_date)}
        </div>
      )}
      {customer.pipeline_notes && (
        <div className="text-[11px] text-[var(--ink-sub)] bg-[var(--cream-50)] rounded px-1.5 py-1 mt-1.5 line-clamp-2">
          {customer.pipeline_notes}
        </div>
      )}
    </div>
  );
}

function OpportunitySlideOver({
  customer,
  onClose,
  onStageChange,
}: {
  customer: Customer;
  onClose: () => void;
  onStageChange: (id: string, stage: SalesStage) => Promise<void>;
}) {
  const stages: { id: SalesStage; label: string }[] = [
    { id: "inquiry", label: "Inquiry" },
    { id: "quoted", label: "Quoted" },
    { id: "followup", label: "Follow-up" },
    { id: "booked", label: "Booked" },
    { id: "completed", label: "Completed" },
  ];
  const [saving, setSaving] = useState(false);

  const handleStageChange = async (stage: SalesStage) => {
    setSaving(true);
    await onStageChange(customer.id, stage);
    setSaving(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-[var(--line)]">
        <div className="border-b border-[var(--line)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--green-900)]">
            Lead Details
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--ink-sub)] hover:text-[var(--green-900)] transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--green-900)] mb-3">
                Customer
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-[var(--ink-sub)] opacity-70">
                    Name
                  </div>
                  <div className="text-sm font-medium text-[var(--ink)]">
                    {customer.first_name} {customer.last_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--ink-sub)] opacity-70">
                    Email
                  </div>
                  <div className="text-sm text-[var(--ink)]">
                    {customer.email}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--green-900)] mb-3">
                Opportunity
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-[var(--ink-sub)] opacity-70">
                    Product
                  </div>
                  <div className="text-sm text-[var(--ink)]">
                    {customer.pipeline_product_name || "—"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[var(--ink-sub)] opacity-70">
                      Guests
                    </div>
                    <div className="text-sm font-medium text-[var(--ink)]">
                      {customer.pipeline_guests}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[var(--ink-sub)] opacity-70">
                      Estimated Value
                    </div>
                    <div className="text-sm font-medium text-[var(--green-900)]">
                      {formatCurrency(
                        customer.pipeline_estimated_value,
                        customer.currency,
                      )}
                    </div>
                  </div>
                </div>
                {customer.pipeline_preferred_date && (
                  <div>
                    <div className="text-xs text-[var(--ink-sub)] opacity-70">
                      Preferred Date
                    </div>
                    <div className="text-sm text-[var(--ink)]">
                      {formatDate(customer.pipeline_preferred_date)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--green-900)] mb-3">
                Stage
              </h3>
              <select
                value={customer.pipeline_stage}
                onChange={(e) =>
                  handleStageChange(e.target.value as SalesStage)
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm disabled:opacity-50"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              {saving && (
                <p className="mt-1 text-xs text-[var(--ink-sub)]">Saving…</p>
              )}
            </div>

            {customer.pipeline_notes && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--green-900)] mb-3">
                  Notes
                </h3>
                <div className="rounded-lg border border-[var(--line)] bg-[var(--cream-50)]/50 p-3 text-sm text-[var(--ink)]">
                  {customer.pipeline_notes}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-[var(--green-900)] mb-3">
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-[var(--ink-sub)] opacity-70">
                    Created
                  </div>
                  <div className="text-[var(--ink)]">
                    {formatDate(customer.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--ink-sub)] opacity-70">
                    Last Updated
                  </div>
                  <div className="text-[var(--ink)]">
                    {formatDate(customer.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--line)] px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-[var(--green-900)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

function AddLeadModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: {
    customerName: string;
    customerEmail: string;
    productName: string;
    estimatedValue: number;
    guests: number;
    preferredDate?: string;
    notes?: string;
  }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    productName: "",
    estimatedValue: 0,
    guests: 1,
    preferredDate: "",
    notes: "",
  });

  const products = [
    "Snowmobile Safari (Sport)",
    "Snowmobile Safari (Touring)",
    "E-bike Tour",
    "Guided Hiking Tour",
    "Northern Lights Tour",
    "City Walk (English)",
    "Food Market Experience",
    "Reindeer Sleigh Ride",
    "Private Sauna Experience",
    "Ice Fishing Experience",
    "Group Tour (20+ people)",
    "Corporate Team Building",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...formData,
      preferredDate: formData.preferredDate || undefined,
      notes: formData.notes || undefined,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="rounded-xl border border-[var(--line)] bg-white p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--green-900)]">
            Add New Lead
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--ink-sub)] hover:text-[var(--green-900)] transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Product
            </label>
            <select
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm"
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                Guests *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.guests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guests: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
                Estimated Value (EUR) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedValue: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) =>
                setFormData({ ...formData, preferredDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--ink)] mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--ink)] border border-[var(--line)] rounded-lg hover:bg-[var(--cream-50)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-[var(--green-900)] rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
            >
              {saving ? "Adding…" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STAGES: {
  id: SalesStage;
  label: string;
  color: string;
  borderColor: string;
  headerColor: string;
}[] = [
  {
    id: "inquiry",
    label: "Inquiry",
    color: "bg-[var(--cream-50)]",
    borderColor: "border-[var(--line)]",
    headerColor: "text-[var(--ink)]",
  },
  {
    id: "quoted",
    label: "Quoted",
    color: "bg-[var(--terracotta)]/5",
    borderColor: "border-[var(--terracotta)]/20",
    headerColor: "text-[var(--terracotta-dark)]",
  },
  {
    id: "followup",
    label: "Follow-up",
    color: "bg-[var(--cream-100)]",
    borderColor: "border-[var(--line)]",
    headerColor: "text-[var(--ink)]",
  },
  {
    id: "booked",
    label: "Booked",
    color: "bg-emerald-50",
    borderColor: "border-emerald-200",
    headerColor: "text-emerald-800",
  },
  {
    id: "completed",
    label: "Completed",
    color: "bg-white",
    borderColor: "border-[var(--line)]",
    headerColor: "text-[var(--ink-sub)]",
  },
];

function KanbanView({
  initialCustomers,
  onUpdateCustomer,
}: {
  initialCustomers: Customer[];
  onUpdateCustomer: (customer: Customer) => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Keep internal state in sync with parent when it changes (e.g. from list view)
  useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const targetStage = destination.droppableId as SalesStage;
      const customer = customers.find((c) => c.id === draggableId);
      if (!customer) return;

      const previousCustomers = customers;

      // Same column — reorder within stage
      if (customer.pipeline_stage === targetStage) {
        let reorderedStage: Customer[] = [];
        const newCustomers = (() => {
          const stageItems = customers.filter(
            (c) => c.pipeline_stage === targetStage,
          );
          const otherItems = customers.filter(
            (c) => c.pipeline_stage !== targetStage,
          );
          reorderedStage = [...stageItems];
          const [moved] = reorderedStage.splice(source.index, 1);
          reorderedStage.splice(destination.index, 0, moved);
          reorderedStage = reorderedStage.map((c, i) => ({
            ...c,
            pipeline_position: i,
          }));
          return [...otherItems, ...reorderedStage];
        })();

        setCustomers(newCustomers);
        setError(null);
        try {
          const res = await fetch("/api/provider/customers/reorder-pipeline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: reorderedStage.map((c) => ({
                id: c.id,
                position: c.pipeline_position,
              })),
            }),
          });
          if (!res.ok) throw new Error(`Server error: ${res.status}`);
        } catch (err) {
          setCustomers(previousCustomers);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to save. Please try again.",
          );
        }
        return;
      }

      // Cross-column — update stage + insert at destination index
      const destStageItems = customers.filter(
        (c) => c.pipeline_stage === targetStage,
      );
      const insertPosition = destination.index;

      // Optimistic update
      const newCustomers = (() => {
        const withoutMoved = customers.filter((c) => c.id !== draggableId);
        const destItems = withoutMoved
          .filter((c) => c.pipeline_stage === targetStage)
          .map((c, i) => ({
            ...c,
            pipeline_position: i >= insertPosition ? i + 1 : i,
          }));
        const movedItem = {
          ...customer,
          pipeline_stage: targetStage,
          pipeline_position: insertPosition,
          updated_at: new Date().toISOString(),
        };
        const otherItems = withoutMoved.filter(
          (c) => c.pipeline_stage !== targetStage,
        );
        return [...otherItems, movedItem, ...destItems];
      })();

      setCustomers(newCustomers);
      if (selectedCustomer?.id === draggableId) {
        setSelectedCustomer((c) =>
          c ? { ...c, pipeline_stage: targetStage } : c,
        );
      }
      setError(null);

      try {
        const shiftedItems = destStageItems
          .slice(insertPosition)
          .map((c, i) => ({ id: c.id, position: insertPosition + 1 + i }));

        const [stageRes, reorderRes] = await Promise.all([
          fetch(`/api/provider/customers/${draggableId}/pipeline`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pipeline_stage: targetStage,
              pipeline_position: insertPosition,
            }),
          }),
          shiftedItems.length > 0
            ? fetch("/api/provider/customers/reorder-pipeline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: shiftedItems }),
              })
            : Promise.resolve({ ok: true } as Response),
        ]);

        if (!stageRes.ok) throw new Error(`Server error: ${stageRes.status}`);
        if (!reorderRes.ok)
          throw new Error(`Server error: ${reorderRes.status}`);

        const updated: Customer = await stageRes.json();
        onUpdateCustomer(updated);
      } catch (err) {
        setCustomers(previousCustomers);
        if (selectedCustomer?.id === draggableId) {
          setSelectedCustomer(customer);
        }
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save. Please try again.",
        );
      }
    },
    [customers, selectedCustomer, onUpdateCustomer],
  );

  const handleStageChange = useCallback(
    async (id: string, stage: SalesStage) => {
      const customer = customers.find((c) => c.id === id);
      if (!customer) return;

      const previousCustomers = customers;

      // Optimistic update
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pipeline_stage: stage } : c)),
      );
      if (selectedCustomer?.id === id) {
        setSelectedCustomer((c) => (c ? { ...c, pipeline_stage: stage } : c));
      }
      setError(null);

      try {
        const res = await fetch(`/api/provider/customers/${id}/pipeline`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pipeline_stage: stage }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const updated: Customer = await res.json();
        onUpdateCustomer(updated);
      } catch (err) {
        setCustomers(previousCustomers);
        if (selectedCustomer?.id === id) {
          setSelectedCustomer(customer);
        }
        setError(
          err instanceof Error
            ? err.message
            : "Failed to save. Please try again.",
        );
      }
    },
    [customers, selectedCustomer, onUpdateCustomer],
  );

  const handleAddLead = async (data: {
    customerName: string;
    customerEmail: string;
    productName: string;
    estimatedValue: number;
    guests: number;
    preferredDate?: string;
    notes?: string;
  }) => {
    // Splits name into first/last for the new customer record
    const nameParts = data.customerName.split(" ");
    const firstName = nameParts[0] || "New";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    const res = await fetch("/api/provider/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: data.customerEmail,
        pipeline_stage: "inquiry",
        pipeline_product_name: data.productName,
        pipeline_estimated_value: data.estimatedValue,
        pipeline_guests: data.guests,
        pipeline_preferred_date: data.preferredDate,
        pipeline_notes: data.notes,
      }),
    });

    if (res.ok) {
      const newCustomer: Customer = await res.json();
      onUpdateCustomer(newCustomer);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[var(--ink-sub)]">
          All customers are shown here. Drag cards to update their stage.
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-[var(--green-900)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm transition-opacity"
        >
          + Add Lead
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 ml-4 p-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
        />
      )}

      {selectedCustomer && (
        <OpportunitySlideOver
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onStageChange={handleStageChange}
        />
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-4">
            {STAGES.map((stage) => {
              const stageCustomers = customers
                .filter((c) => c.pipeline_stage === stage.id)
                .sort((a, b) => a.pipeline_position - b.pipeline_position);
              const stageValue = stageCustomers.reduce(
                (s, c) => s + c.pipeline_estimated_value,
                0,
              );
              return (
                <div
                  key={stage.id}
                  className={cx(
                    "flex-shrink-0 w-72 rounded-xl border p-3 shadow-sm",
                    stage.color,
                    stage.borderColor,
                  )}
                >
                  <div className="mb-3 pb-3 border-b border-[var(--line)]">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={cx(
                          "text-sm font-semibold",
                          stage.headerColor,
                        )}
                      >
                        {stage.label}
                      </h3>
                      <span className="text-xs font-medium text-[var(--ink)] bg-white/50 rounded-full px-2 py-0.5 ring-1 ring-[var(--line)]">
                        {stageCustomers.length}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--ink-sub)] opacity-70">
                      {formatCurrency(stageValue)}
                    </div>
                  </div>

                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cx(
                          "space-y-2 min-h-[120px] max-h-[650px] overflow-y-auto rounded-md transition-colors",
                          snapshot.isDraggingOver &&
                            "bg-white/20 ring-2 ring-[var(--green-800)]/20",
                        )}
                      >
                        {stageCustomers.length === 0 &&
                        !snapshot.isDraggingOver ? (
                          <div className="text-xs text-[var(--ink-sub)] opacity-40 text-center py-8 border-2 border-dashed border-[var(--line)] rounded">
                            Drop here
                          </div>
                        ) : (
                          stageCustomers.map((customer, index) => (
                            <Draggable
                              key={customer.id}
                              draggableId={customer.id}
                              index={index}
                            >
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                >
                                  <KanbanCard
                                    customer={customer}
                                    isDragging={dragSnapshot.isDragging}
                                    onClick={() =>
                                      setSelectedCustomer(customer)
                                    }
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
export default function CustomersClient({
  initialCustomers,
  initialBookingsByEmail = {},
}: {
  initialCustomers: Customer[];
  initialBookingsByEmail?: Record<string, Booking[]>;
}) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | "all">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const filtered = customers
    .filter((c) => selectedTag === "all" || c.tags.includes(selectedTag))
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.includes(q) ?? false)
      );
    });

  const handleTagsChange = async (customerId: string, tags: string[]) => {
    const res = await fetch(`/api/provider/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (res.ok) {
      const updated: Customer = await res.json();
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? updated : c)),
      );
      if (selectedCustomer?.id === customerId) setSelectedCustomer(updated);
    }
  };

  const handleNotesChange = async (customerId: string, notes: string) => {
    const res = await fetch(`/api/provider/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      const updated: Customer = await res.json();
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? updated : c)),
      );
      if (selectedCustomer?.id === customerId) setSelectedCustomer(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--green-900)]">
              Customers
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-sub)]">
              Manage customer relationships, view history, and track
              interactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-all shadow-sm",
                view === "list"
                  ? "border-[var(--green-900)] bg-[var(--green-900)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
              )}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-all shadow-sm",
                view === "kanban"
                  ? "border-[var(--green-900)] bg-[var(--green-900)] text-white"
                  : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
              )}
            >
              Sales Pipeline
            </button>
          </div>
        </div>

        {view === "kanban" ? (
          <KanbanView
            initialCustomers={customers}
            onUpdateCustomer={(updated) => {
              setCustomers((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c)),
              );
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--line)] rounded-lg focus:ring-1 focus:ring-[var(--green-800)] focus:border-[var(--green-800)] outline-none bg-white shadow-sm"
                />
              </div>

              {/* Dynamic tag filter — derived from current customer tags */}
              {(() => {
                const allTags = Array.from(
                  new Set(customers.flatMap((c) => c.tags)),
                ).sort();
                return (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag("all")}
                      className={cx(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all shadow-sm",
                        selectedTag === "all"
                          ? "border-[var(--green-900)] bg-[var(--green-900)] text-white"
                          : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
                      )}
                    >
                      All
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={cx(
                          "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all shadow-sm flex items-center",
                          selectedTag === tag
                            ? "border-[var(--green-900)] bg-[var(--green-900)] text-white"
                            : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--cream-50)]",
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                );
              })()}

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filtered.length === 0 ? (
                  <div className="text-sm text-[var(--ink-sub)] opacity-50 text-center py-8">
                    No customers found
                  </div>
                ) : (
                  filtered.map((customer) => (
                    <CustomerCard
                      key={customer.id}
                      customer={customer}
                      onSelect={setSelectedCustomer}
                      selected={selectedCustomer?.id === customer.id}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden shadow-sm">
              {selectedCustomer ? (
                <CustomerDetailPanel
                  customer={selectedCustomer}
                  bookings={
                    initialBookingsByEmail[
                      selectedCustomer.email.toLowerCase()
                    ] ?? []
                  }
                  onTagsChange={handleTagsChange}
                  onNotesChange={handleNotesChange}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-[var(--ink-sub)] opacity-50">
                  Select a customer to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
