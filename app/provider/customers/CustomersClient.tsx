"use client";

import React, { useState } from "react";

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
  tags: CustomerTag[];
  total_bookings: number;
  total_spent: number;
  currency: string;
  first_booking_date?: string | null;
  last_booking_date?: string | null;
  notes?: string | null;
};

export type SalesOpportunity = {
  id: string;
  provider_id: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email: string;
  product_name: string;
  stage: SalesStage;
  estimated_value: number;
  currency: string;
  guests: number;
  preferred_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
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

const TAG_STYLES: Record<CustomerTag, string> = {
  vip: "bg-purple-50 text-purple-700 ring-purple-200",
  repeat: "bg-blue-50 text-blue-700 ring-blue-200",
  group: "bg-green-50 text-green-700 ring-green-200",
  corporate: "bg-amber-50 text-amber-700 ring-amber-200",
  family: "bg-pink-50 text-pink-700 ring-pink-200",
};

const TAG_LABELS: Record<CustomerTag, string> = {
  vip: "VIP",
  repeat: "Repeat",
  group: "Group",
  corporate: "Corporate",
  family: "Family",
};

const ALL_TAGS: CustomerTag[] = [
  "vip",
  "repeat",
  "group",
  "corporate",
  "family",
];

function TagBadge({
  tag,
  onRemove,
}: {
  tag: CustomerTag;
  onRemove?: () => void;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        TAG_STYLES[tag],
      )}
    >
      {TAG_LABELS[tag]}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:opacity-70 transition-opacity"
          aria-label={`Remove ${TAG_LABELS[tag]} tag`}
        >
          ×
        </button>
      )}
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
          ? "border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900"
          : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-neutral-900">
              {customer.first_name} {customer.last_name}
            </h3>
            {customer.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <div className="text-sm text-neutral-600 space-y-0.5">
            <div>{customer.email}</div>
            {customer.phone && <div>{customer.phone}</div>}
            {customer.country && <div>{customer.country}</div>}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="font-semibold text-neutral-900">
            {formatCurrency(customer.total_spent, customer.currency)}
          </div>
          <div className="text-neutral-500">
            {customer.total_bookings}{" "}
            {customer.total_bookings === 1 ? "booking" : "bookings"}
          </div>
        </div>
      </div>
    </button>
  );
}

function TagManager({
  customer,
  onTagsChange,
}: {
  customer: Customer;
  onTagsChange: (customerId: string, tags: CustomerTag[]) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const available = ALL_TAGS.filter((t) => !customer.tags.includes(t));

  const handleRemove = async (tag: CustomerTag) => {
    setSaving(true);
    await onTagsChange(
      customer.id,
      customer.tags.filter((t) => t !== tag),
    );
    setSaving(false);
  };

  const handleAdd = async (tag: CustomerTag) => {
    setSaving(true);
    setShowAdd(false);
    await onTagsChange(customer.id, [...customer.tags, tag]);
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {customer.tags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            onRemove={saving ? undefined : () => handleRemove(tag)}
          />
        ))}
        {available.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowAdd((v) => !v)}
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-50"
            >
              + Add tag
            </button>
            {showAdd && (
              <div className="absolute left-0 top-full mt-1 z-10 rounded-lg border border-neutral-200 bg-white shadow-lg py-1 min-w-[120px]">
                {available.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAdd(tag)}
                    className="w-full text-left px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <span
                      className={cx("h-2 w-2 rounded-full", TAG_STYLES[tag])}
                    />
                    {TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {saving && <span className="text-xs text-neutral-400">Saving…</span>}
      </div>
    </div>
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
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-neutral-900 resize-none"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => {
              setValue(initialNotes ?? "");
              setEditing(false);
            }}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
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
      className="w-full text-left rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 hover:border-neutral-300 transition-colors min-h-[60px]"
    >
      {value || (
        <span className="text-neutral-400 italic">Click to add notes…</span>
      )}
    </button>
  );
}

function CustomerDetailPanel({
  customer,
  onTagsChange,
  onNotesChange,
}: {
  customer: Customer;
  onTagsChange: (customerId: string, tags: CustomerTag[]) => Promise<void>;
  onNotesChange: (customerId: string, notes: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "bookings">(
    "overview",
  );

  return (
    <>
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {customer.first_name} {customer.last_name}
            </h2>
            <div className="mt-2">
              <TagManager customer={customer} onTagsChange={onTagsChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-200 px-6">
        <div className="flex gap-1">
          {(["overview", "bookings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cx(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                activeTab === tab
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900",
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Contact Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neutral-500">Email:</span>{" "}
                  <span className="text-neutral-900">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div>
                    <span className="text-neutral-500">Phone:</span>{" "}
                    <span className="text-neutral-900">{customer.phone}</span>
                  </div>
                )}
                {customer.country && (
                  <div>
                    <span className="text-neutral-500">Country:</span>{" "}
                    <span className="text-neutral-900">{customer.country}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="text-sm text-neutral-500">Total Bookings</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">
                  {customer.total_bookings}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="text-sm text-neutral-500">Total Spent</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">
                  {formatCurrency(customer.total_spent, customer.currency)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-500">First Booking</div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {formatDate(customer.first_booking_date)}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-500">Last Booking</div>
                <div className="mt-1 text-sm font-medium text-neutral-900">
                  {formatDate(customer.last_booking_date)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">
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
          <div className="text-sm text-neutral-500 text-center py-8">
            Booking history will appear here once the customer booking flow is
            live.
          </div>
        )}
      </div>
    </>
  );
}

function KanbanCard({
  opportunity,
  onDragStart,
  isDragging,
  onClick,
}: {
  opportunity: SalesOpportunity;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
  onClick: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, opportunity.id)}
      onClick={onClick}
      className={cx(
        "rounded-lg border border-neutral-200 bg-white p-2.5 cursor-pointer hover:shadow-md transition-all",
        isDragging && "opacity-50",
      )}
    >
      <div className="mb-1.5">
        <div className="font-medium text-xs text-neutral-900 mb-0.5">
          {opportunity.customer_name}
        </div>
        <div className="text-[11px] text-neutral-600">
          {opportunity.product_name}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="text-neutral-500">{opportunity.guests} guests</span>
        <span className="font-semibold text-neutral-900">
          {formatCurrency(opportunity.estimated_value, opportunity.currency)}
        </span>
      </div>
      {opportunity.preferred_date && (
        <div className="text-[11px] text-neutral-500 mb-1.5">
          {formatDate(opportunity.preferred_date)}
        </div>
      )}
      {opportunity.notes && (
        <div className="text-[11px] text-neutral-600 bg-neutral-50 rounded px-1.5 py-1 mt-1.5">
          {opportunity.notes}
        </div>
      )}
    </div>
  );
}

function OpportunitySlideOver({
  opportunity,
  onClose,
  onStageChange,
}: {
  opportunity: SalesOpportunity;
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
    await onStageChange(opportunity.id, stage);
    setSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Lead Details
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Customer
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-neutral-500">Name</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {opportunity.customer_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Email</div>
                  <div className="text-sm text-neutral-900">
                    {opportunity.customer_email}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Opportunity
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-neutral-500">Product</div>
                  <div className="text-sm text-neutral-900">
                    {opportunity.product_name}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-neutral-500">Guests</div>
                    <div className="text-sm font-medium text-neutral-900">
                      {opportunity.guests}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">
                      Estimated Value
                    </div>
                    <div className="text-sm font-medium text-neutral-900">
                      {formatCurrency(
                        opportunity.estimated_value,
                        opportunity.currency,
                      )}
                    </div>
                  </div>
                </div>
                {opportunity.preferred_date && (
                  <div>
                    <div className="text-xs text-neutral-500">
                      Preferred Date
                    </div>
                    <div className="text-sm text-neutral-900">
                      {formatDate(opportunity.preferred_date)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Stage
              </h3>
              <select
                value={opportunity.stage}
                onChange={(e) =>
                  handleStageChange(e.target.value as SalesStage)
                }
                disabled={saving}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm disabled:opacity-50"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              {saving && (
                <p className="mt-1 text-xs text-neutral-400">Saving…</p>
              )}
            </div>

            {opportunity.notes && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                  Notes
                </h3>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                  {opportunity.notes}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                Timeline
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-neutral-500">Created</div>
                  <div className="text-neutral-900">
                    {formatDate(opportunity.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Last Updated</div>
                  <div className="text-neutral-900">
                    {formatDate(opportunity.updated_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="rounded-xl border border-neutral-200 bg-white p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Add New Lead
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Product
            </label>
            <select
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
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
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) =>
                setFormData({ ...formData, preferredDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KanbanView({
  initialOpportunities,
}: {
  initialOpportunities: SalesOpportunity[];
}) {
  const [opportunities, setOpportunities] =
    useState<SalesOpportunity[]>(initialOpportunities);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<SalesOpportunity | null>(null);

  const stages: {
    id: SalesStage;
    label: string;
    color: string;
    borderColor: string;
  }[] = [
    {
      id: "inquiry",
      label: "Inquiry",
      color: "bg-[var(--color-sky)]/5",
      borderColor: "border-[var(--color-sky)]/20",
    },
    {
      id: "quoted",
      label: "Quoted",
      color: "bg-[var(--color-accent)]/5",
      borderColor: "border-[var(--color-accent)]/20",
    },
    {
      id: "followup",
      label: "Follow-up",
      color: "bg-[var(--color-sage)]/5",
      borderColor: "border-[var(--color-sage)]/20",
    },
    {
      id: "booked",
      label: "Booked",
      color: "bg-[var(--color-forest)]/10",
      borderColor: "border-[var(--color-forest)]/30",
    },
    {
      id: "completed",
      label: "Completed",
      color: "bg-neutral-50",
      borderColor: "border-neutral-200",
    },
  ];

  const handleDrop = async (e: React.DragEvent, targetStage: SalesStage) => {
    e.preventDefault();
    if (!draggedId) return;
    // Optimistic update
    setOpportunities((prev) =>
      prev.map((o) => (o.id === draggedId ? { ...o, stage: targetStage } : o)),
    );
    setDraggedId(null);
    // Persist
    await fetch(`/api/provider/sales-opportunities/${draggedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: targetStage }),
    });
  };

  const handleStageChange = async (id: string, stage: SalesStage) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, stage } : o)),
    );
    if (selectedOpp?.id === id)
      setSelectedOpp((o) => (o ? { ...o, stage } : o));
    await fetch(`/api/provider/sales-opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  };

  const handleAddLead = async (data: {
    customerName: string;
    customerEmail: string;
    productName: string;
    estimatedValue: number;
    guests: number;
    preferredDate?: string;
    notes?: string;
  }) => {
    const res = await fetch("/api/provider/sales-opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newOpp: SalesOpportunity = await res.json();
      setOpportunities((prev) => [newOpp, ...prev]);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Drag cards between columns to update stage
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Add Lead
        </button>
      </div>

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLead}
        />
      )}

      {selectedOpp && (
        <OpportunitySlideOver
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onStageChange={handleStageChange}
        />
      )}

      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-4">
          {stages.map((stage) => {
            const stageOpps = opportunities.filter((o) => o.stage === stage.id);
            const stageValue = stageOpps.reduce(
              (s, o) => s + o.estimated_value,
              0,
            );
            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={cx(
                  "flex-shrink-0 w-72 rounded-lg border p-3",
                  stage.color,
                  stage.borderColor,
                  draggedId && "ring-2 ring-neutral-400",
                )}
              >
                <div className="mb-3 pb-3 border-b border-neutral-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {stage.label}
                    </h3>
                    <span className="text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full px-2 py-0.5">
                      {stageOpps.length}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatCurrency(stageValue)}
                  </div>
                </div>

                <div className="space-y-2 max-h-[650px] overflow-y-auto">
                  {stageOpps.length === 0 ? (
                    <div className="text-xs text-neutral-400 text-center py-8 border-2 border-dashed border-neutral-200 rounded">
                      Drop here
                    </div>
                  ) : (
                    stageOpps.map((opp) => (
                      <KanbanCard
                        key={opp.id}
                        opportunity={opp}
                        onDragStart={(e, id) => {
                          setDraggedId(id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        isDragging={draggedId === opp.id}
                        onClick={() => setSelectedOpp(opp)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CustomersClient({
  initialCustomers,
  initialOpportunities,
}: {
  initialCustomers: Customer[];
  initialOpportunities: SalesOpportunity[];
}) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<CustomerTag | "all">("all");
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

  const handleTagsChange = async (customerId: string, tags: CustomerTag[]) => {
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
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Customers
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage customer relationships, view history, and track
              interactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                view === "list"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
              )}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
              )}
            >
              Sales Pipeline
            </button>
          </div>
        </div>

        {view === "kanban" ? (
          <KanbanView initialOpportunities={initialOpportunities} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search customers…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag("all")}
                  className={cx(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    selectedTag === "all"
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  All
                </button>
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={cx(
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      selectedTag === tag
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                    )}
                  >
                    <TagBadge tag={tag} />
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="text-sm text-neutral-500 text-center py-8">
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

            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {selectedCustomer ? (
                <CustomerDetailPanel
                  customer={selectedCustomer}
                  onTagsChange={handleTagsChange}
                  onNotesChange={handleNotesChange}
                />
              ) : (
                <div className="flex items-center justify-center h-96 text-neutral-500">
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
