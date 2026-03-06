"use client";

import React, { useState } from "react";
import {
  getAllBookings,
  getBookingsByDateRange,
  type Booking,
  type BookingStatus,
} from "@/lib/bookingsStore";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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
  const styles = {
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };

  const labels = {
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-900">{booking.productName}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <div className="text-sm text-neutral-600 space-y-0.5">
            <div>
              <span className="font-medium">{booking.customerName}</span> • {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
            </div>
            <div>
              {formatDate(booking.date)} at {booking.time}
            </div>
            {booking.phone && (
              <div className="text-xs text-neutral-500">{booking.phone}</div>
            )}
          </div>
          {booking.notes && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
              {booking.notes}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-neutral-900">
            {formatCurrency(booking.totalPrice, booking.currency)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Booked {formatDate(booking.bookingDate)}
          </div>
        </div>
      </div>
    </div>
  );
}

type TimeFilter = "today" | "tomorrow" | "week" | "all";

function getFilteredBookings(bookings: Booking[], filter: TimeFilter): Booking[] {
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
      return bookings.filter((b) => b.date === todayStr);
    case "tomorrow":
      return bookings.filter((b) => b.date === tomorrowStr);
    case "week":
      return bookings.filter((b) => b.date >= todayStr && b.date <= weekEndStr);
    case "all":
      return bookings;
    default:
      return bookings;
  }
}

export default function ProviderBookingsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  
  const allBookings = getAllBookings();
  const timeFiltered = getFilteredBookings(allBookings, timeFilter);
  const statusFiltered =
    statusFilter === "all"
      ? timeFiltered
      : timeFiltered.filter((b) => b.status === statusFilter);
  
  const confirmedCount = allBookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = allBookings.filter((b) => b.status === "pending").length;
  const totalRevenue = allBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Upcoming Bookings</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage and review all upcoming bookings for the next 4 weeks.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-600">Total Bookings</div>
            <div className="mt-1 text-2xl font-semibold text-neutral-900">{allBookings.length}</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-600">Confirmed</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-600">{confirmedCount}</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-600">Pending</div>
            <div className="mt-1 text-2xl font-semibold text-amber-600">{pendingCount}</div>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-sm text-neutral-600">Total Revenue</div>
            <div className="mt-1 text-2xl font-semibold text-neutral-900">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">Time:</span>
            <div className="flex gap-2">
              {(["today", "tomorrow", "week", "all"] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={cx(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    timeFilter === filter
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">Status:</span>
            <div className="flex gap-2">
              {(["all", "confirmed", "pending", "cancelled"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={cx(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    statusFilter === filter
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {statusFiltered.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8 text-center">
              <p className="text-neutral-600">No bookings found for the selected filters.</p>
            </div>
          ) : (
            statusFiltered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
