"use client";

import React, { useState } from "react";
import {
  getAllCustomers,
  getCustomerById,
  getBookingHistoryByCustomer,
  getMessageHistoryByCustomer,
  searchCustomers,
  getAllSalesOpportunities,
  getSalesOpportunitiesByStage,
  updateSalesOpportunityStage,
  addSalesOpportunity,
  type Customer,
  type CustomerTag,
  type BookingHistory,
  type MessageHistory,
  type SalesOpportunity,
  type SalesStage,
} from "@/lib/customersStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TagBadge({ tag }: { tag: CustomerTag }) {
  const styles: Record<CustomerTag, string> = {
    vip: "bg-purple-50 text-purple-700 ring-purple-200",
    repeat: "bg-blue-50 text-blue-700 ring-blue-200",
    group: "bg-green-50 text-green-700 ring-green-200",
    corporate: "bg-amber-50 text-amber-700 ring-amber-200",
    family: "bg-pink-50 text-pink-700 ring-pink-200",
  };

  const labels: Record<CustomerTag, string> = {
    vip: "VIP",
    repeat: "Repeat",
    group: "Group",
    corporate: "Corporate",
    family: "Family",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        styles[tag]
      )}
    >
      {labels[tag]}
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
          : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900">
              {customer.firstName} {customer.lastName}
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
            {formatCurrency(customer.totalSpent, customer.currency)}
          </div>
          <div className="text-neutral-500">
            {customer.totalBookings} {customer.totalBookings === 1 ? "booking" : "bookings"}
          </div>
        </div>
      </div>
    </button>
  );
}

function BookingHistoryList({ bookings }: { bookings: BookingHistory[] }) {
  if (bookings.length === 0) {
    return (
      <div className="text-sm text-neutral-500 text-center py-4">No booking history</div>
    );
  }

  return (
    <div className="space-y-2">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="rounded-lg border border-neutral-200 bg-white p-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-neutral-900">{booking.productName}</div>
              <div className="text-sm text-neutral-600 mt-0.5">
                {formatDate(booking.date)} at {booking.time} • {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-neutral-900">
                {formatCurrency(booking.totalPrice, booking.currency)}
              </div>
              <span
                className={cx(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1",
                  booking.status === "completed" && "bg-emerald-50 text-emerald-700",
                  booking.status === "confirmed" && "bg-blue-50 text-blue-700",
                  booking.status === "cancelled" && "bg-red-50 text-red-700"
                )}
              >
                {booking.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageHistoryList({ messages }: { messages: MessageHistory[] }) {
  if (messages.length === 0) {
    return (
      <div className="text-sm text-neutral-500 text-center py-4">No message history</div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cx(
            "rounded-lg border p-3",
            message.direction === "inbound"
              ? "border-blue-200 bg-blue-50"
              : "border-neutral-200 bg-white"
          )}
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  "text-xs font-medium px-2 py-0.5 rounded",
                  message.platform === "email" && "bg-neutral-100 text-neutral-700",
                  message.platform === "whatsapp" && "bg-green-100 text-green-700",
                  message.platform === "phone" && "bg-blue-100 text-blue-700"
                )}
              >
                {message.platform}
              </span>
              <span className="text-xs text-neutral-500">
                {message.direction === "inbound" ? "From customer" : "To customer"}
              </span>
            </div>
            <div className="text-xs text-neutral-500">
              {new Date(message.timestamp).toLocaleDateString()}
            </div>
          </div>
          {message.subject && (
            <div className="font-medium text-sm text-neutral-900 mb-1">{message.subject}</div>
          )}
          <div className="text-sm text-neutral-600">{message.content}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProviderCustomersPage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<CustomerTag | "all">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "messages">("overview");

  const allCustomers = getAllCustomers();
  const filteredByTag =
    selectedTag === "all"
      ? allCustomers
      : allCustomers.filter((c) => c.tags.includes(selectedTag));
  const filteredCustomers = searchQuery
    ? searchCustomers(searchQuery)
    : filteredByTag;

  const selectedBookingHistory = selectedCustomer
    ? getBookingHistoryByCustomer(selectedCustomer.id)
    : [];
  const selectedMessageHistory = selectedCustomer
    ? getMessageHistoryByCustomer(selectedCustomer.id)
    : [];

  const tags: CustomerTag[] = ["vip", "repeat", "group", "corporate", "family"];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Customers</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Manage customer relationships, view history, and track interactions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className={cx(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                view === "list"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
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
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              )}
            >
              Sales Pipeline
            </button>
          </div>
        </div>

        {view === "kanban" ? (
          <KanbanView />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Customer List */}
          <div className="space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag("all")}
                className={cx(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  selectedTag === "all"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                )}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cx(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    selectedTag === tag
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <TagBadge tag={tag} />
                </button>
              ))}
            </div>

            {/* Customer List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-sm text-neutral-500 text-center py-8">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map((customer) => (
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

          {/* Customer Detail */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            {selectedCustomer ? (
              <>
                {/* Header */}
                <div className="border-b border-neutral-200 px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </h2>
                      <div className="mt-1 flex items-center gap-2">
                        {selectedCustomer.tags.map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
                    </div>
                    <button className="text-sm text-neutral-600 hover:text-neutral-900">
                      Edit
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-200 px-6">
                  <div className="flex gap-1">
                    {(["overview", "bookings", "messages"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cx(
                          "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                          activeTab === tab
                            ? "border-neutral-900 text-neutral-900"
                            : "border-transparent text-neutral-600 hover:text-neutral-900"
                        )}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Contact Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
                          Contact Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-neutral-500">Email:</span>{" "}
                            <span className="text-neutral-900">{selectedCustomer.email}</span>
                          </div>
                          {selectedCustomer.phone && (
                            <div>
                              <span className="text-neutral-500">Phone:</span>{" "}
                              <span className="text-neutral-900">{selectedCustomer.phone}</span>
                            </div>
                          )}
                          {selectedCustomer.country && (
                            <div>
                              <span className="text-neutral-500">Country:</span>{" "}
                              <span className="text-neutral-900">{selectedCustomer.country}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-neutral-200 p-4">
                          <div className="text-sm text-neutral-500">Total Bookings</div>
                          <div className="mt-1 text-2xl font-semibold text-neutral-900">
                            {selectedCustomer.totalBookings}
                          </div>
                        </div>
                        <div className="rounded-lg border border-neutral-200 p-4">
                          <div className="text-sm text-neutral-500">Total Spent</div>
                          <div className="mt-1 text-2xl font-semibold text-neutral-900">
                            {formatCurrency(selectedCustomer.totalSpent, selectedCustomer.currency)}
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-neutral-500">First Booking</div>
                          <div className="mt-1 text-sm font-medium text-neutral-900">
                            {formatDate(selectedCustomer.firstBookingDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-500">Last Booking</div>
                          <div className="mt-1 text-sm font-medium text-neutral-900">
                            {formatDate(selectedCustomer.lastBookingDate)}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedCustomer.notes && (
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900 mb-2">Notes</h3>
                          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                            {selectedCustomer.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "bookings" && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                        Booking History ({selectedBookingHistory.length})
                      </h3>
                      <BookingHistoryList bookings={selectedBookingHistory} />
                    </div>
                  )}

                  {activeTab === "messages" && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-4">
                        Message History ({selectedMessageHistory.length})
                      </h3>
                      <MessageHistoryList messages={selectedMessageHistory} />
                    </div>
                  )}
                </div>
              </>
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

function KanbanView() {
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>(getAllSalesOpportunities());
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<SalesOpportunity | null>(null);

  const stages: { id: SalesStage; label: string; color: string; borderColor: string }[] = [
    { id: "inquiry", label: "Inquiry", color: "bg-[var(--color-sky)]/5", borderColor: "border-[var(--color-sky)]/20" },
    { id: "quoted", label: "Quoted", color: "bg-[var(--color-accent)]/5", borderColor: "border-[var(--color-accent)]/20" },
    { id: "followup", label: "Follow-up", color: "bg-[var(--color-sage)]/5", borderColor: "border-[var(--color-sage)]/20" },
    { id: "booked", label: "Booked", color: "bg-[var(--color-forest)]/10", borderColor: "border-[var(--color-forest)]/30" },
    { id: "completed", label: "Completed", color: "bg-neutral-50", borderColor: "border-neutral-200" },
  ];

  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    setDraggedCard(oppId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStage: SalesStage) => {
    e.preventDefault();
    if (draggedCard) {
      updateSalesOpportunityStage(draggedCard, targetStage);
      setOpportunities(getAllSalesOpportunities());
      setDraggedCard(null);
    }
  };

  const handleAddLead = (formData: {
    customerName: string;
    customerEmail: string;
    productName: string;
    estimatedValue: number;
    guests: number;
    preferredDate?: string;
    notes?: string;
  }) => {
    const newOpp = addSalesOpportunity({
      customerId: "new",
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      productName: formData.productName,
      stage: "inquiry",
      estimatedValue: formData.estimatedValue,
      currency: "EUR",
      guests: formData.guests,
      preferredDate: formData.preferredDate,
      notes: formData.notes,
    });
    setOpportunities(getAllSalesOpportunities());
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

      {selectedOpportunity && (
        <OpportunityDetailSlideOver
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onUpdate={(updates) => {
            if (updates.stage) {
              updateSalesOpportunityStage(selectedOpportunity.id, updates.stage);
            }
            setOpportunities(getAllSalesOpportunities());
            if (updates.stage) {
              setSelectedOpportunity({ ...selectedOpportunity, stage: updates.stage });
            }
          }}
        />
      )}

      <div className="overflow-x-auto">
        <div className="flex gap-3 min-w-max pb-4">
          {stages.map((stage) => {
            const stageOpps = opportunities.filter((opp) => opp.stage === stage.id);
            const stageValue = stageOpps.reduce((sum, opp) => sum + opp.estimatedValue, 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={cx(
                  "flex-shrink-0 w-72 rounded-lg border p-3",
                  stage.color,
                  stage.borderColor,
                  draggedCard && "ring-2 ring-neutral-400"
                )}
              >
                <div className="mb-3 pb-3 border-b border-neutral-200">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-neutral-900">{stage.label}</h3>
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
                        onDragStart={handleDragStart}
                        isDragging={draggedCard === opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
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
        isDragging && "opacity-50"
      )}
    >
      <div className="mb-1.5">
        <div className="font-medium text-xs text-neutral-900 mb-0.5">
          {opportunity.customerName}
        </div>
        <div className="text-[11px] text-neutral-600">{opportunity.productName}</div>
      </div>

      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="text-neutral-500">{opportunity.guests} guests</span>
        <span className="font-semibold text-neutral-900">
          {formatCurrency(opportunity.estimatedValue, opportunity.currency)}
        </span>
      </div>

      {opportunity.preferredDate && (
        <div className="text-[11px] text-neutral-500 mb-1.5">
          {formatDate(opportunity.preferredDate)}
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
  }) => void;
}) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    productName: "",
    estimatedValue: 0,
    guests: 1,
    preferredDate: "",
    notes: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use first selected product or empty string
    const productName = selectedProducts.length > 0 ? selectedProducts[0] : "";
    onSave({
      ...formData,
      productName,
      preferredDate: formData.preferredDate || undefined,
      notes: formData.notes || undefined,
    });
  };

  const toggleProduct = (product: string) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== product));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="rounded-xl border border-neutral-200 bg-white p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Add New Lead</h2>
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
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Product(s) {selectedProducts.length > 0 && <span className="text-neutral-500 font-normal">({selectedProducts.length} selected)</span>}
            </label>
            <div className="max-h-48 overflow-y-auto border border-neutral-300 rounded-lg p-2 space-y-1">
              {products.map((product) => (
                <label
                  key={product}
                  className="flex items-center gap-2 p-2 rounded hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product)}
                    onChange={() => toggleProduct(product)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <span className="text-sm text-neutral-700">{product}</span>
                </label>
              ))}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Select one or more products, or leave empty
            </div>
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
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
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
                onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
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
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OpportunityDetailSlideOver({
  opportunity,
  onClose,
  onUpdate,
}: {
  opportunity: SalesOpportunity;
  onClose: () => void;
  onUpdate: (updates: { stage?: SalesStage }) => void;
}) {
  const stages: { id: SalesStage; label: string }[] = [
    { id: "inquiry", label: "Inquiry" },
    { id: "quoted", label: "Quoted" },
    { id: "followup", label: "Follow-up" },
    { id: "booked", label: "Booked" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Slide Over */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Customer</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-neutral-500">Name</div>
                  <div className="text-sm font-medium text-neutral-900">{opportunity.customerName}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Email</div>
                  <div className="text-sm text-neutral-900">{opportunity.customerEmail}</div>
                </div>
              </div>
            </div>

            {/* Opportunity Details */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Opportunity</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-neutral-500">Product</div>
                  <div className="text-sm text-neutral-900">{opportunity.productName}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-neutral-500">Guests</div>
                    <div className="text-sm font-medium text-neutral-900">{opportunity.guests}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500">Estimated Value</div>
                    <div className="text-sm font-medium text-neutral-900">
                      {formatCurrency(opportunity.estimatedValue, opportunity.currency)}
                    </div>
                  </div>
                </div>
                {opportunity.preferredDate && (
                  <div>
                    <div className="text-xs text-neutral-500">Preferred Date</div>
                    <div className="text-sm text-neutral-900">{formatDate(opportunity.preferredDate)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Stage */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Stage</h3>
              <select
                value={opportunity.stage}
                onChange={(e) => onUpdate({ stage: e.target.value as SalesStage })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            {opportunity.notes && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">Notes</h3>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                  {opportunity.notes}
                </div>
              </div>
            )}

            {/* Dates */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-xs text-neutral-500">Created</div>
                  <div className="text-neutral-900">
                    {new Date(opportunity.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Last Updated</div>
                  <div className="text-neutral-900">
                    {new Date(opportunity.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
