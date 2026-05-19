import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

type BookingStatus = "confirmed" | "pending" | "cancelled";

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

function StatusBadge({ status }: { status: string }) {
  const style =
    statusStyles[status as BookingStatus] ??
    "bg-neutral-50 text-neutral-700 ring-neutral-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${style}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatCurrency(value: number, currency: string = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .select(
      `
      id,
      customer_name,
      customer_email,
      product_name,
      booking_date,
      booking_time,
      guests,
      status,
      total_price,
      currency,
      created_at,
      provider_id
    `,
    )
    .order("created_at", { ascending: false });

  const total = bookings?.length ?? 0;
  const confirmed =
    bookings?.filter((b) => b.status === "confirmed").length ?? 0;
  const pending = bookings?.filter((b) => b.status === "pending").length ?? 0;
  const revenue =
    bookings
      ?.filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + Number(b.total_price), 0) ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              All Bookings
            </h1>
            <p className="text-sm text-neutral-500">
              Platform-wide booking history across all providers
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Total Bookings", value: total },
            { label: "Confirmed", value: confirmed },
            { label: "Pending", value: pending },
            { label: "Revenue (confirmed)", value: formatCurrency(revenue) },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-neutral-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        {!bookings?.length ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 shadow-sm">
            No bookings yet.
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{ color: "var(--color-sage)" }}
                >
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Booked</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b last:border-0 hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-forest)" }}
                      >
                        {b.customer_name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-sage)" }}
                      >
                        {b.customer_email}
                      </p>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--color-forest)" }}
                    >
                      {b.product_name}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {new Date(b.booking_date).toLocaleDateString()}
                      {b.booking_time && (
                        <span className="block text-xs">{b.booking_time}</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {b.guests}
                    </td>
                    <td
                      className="px-4 py-3 font-medium"
                      style={{ color: "var(--color-forest)" }}
                    >
                      {formatCurrency(
                        Number(b.total_price),
                        b.currency ?? "EUR",
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs" style={{ color: "var(--color-sage)" }}>
          Showing all {total} booking{total !== 1 ? "s" : ""}. Use provider view
          for per-provider management.{" "}
          <Link
            href="/admin/providers"
            className="font-medium hover:underline"
            style={{ color: "var(--color-forest)" }}
          >
            View providers
          </Link>
        </p>
      </main>
    </div>
  );
}
