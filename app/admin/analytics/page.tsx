import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

function formatCurrency(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: providerCount },
    { count: productCount },
    { count: bookingCount },
    { count: customerCount },
    { data: bookings },
    { data: topProviders },
  ] = await Promise.all([
    supabase
      .schema(SCHEMA)
      .from("providers")
      .select("*", { count: "exact", head: true }),
    supabase
      .schema(SCHEMA)
      .from("products")
      .select("*", { count: "exact", head: true }),
    supabase
      .schema(SCHEMA)
      .from("bookings")
      .select("*", { count: "exact", head: true }),
    supabase
      .schema(SCHEMA)
      .from("customers")
      .select("*", { count: "exact", head: true }),
    supabase
      .schema(SCHEMA)
      .from("bookings")
      .select("status, total_price, currency"),
    supabase
      .schema(SCHEMA)
      .from("providers")
      .select("id, official_name, city")
      .order("imported_at", { ascending: false })
      .limit(10),
  ]);

  const confirmed = bookings?.filter((b) => b.status === "confirmed") ?? [];
  const pending = bookings?.filter((b) => b.status === "pending") ?? [];
  const cancelled = bookings?.filter((b) => b.status === "cancelled") ?? [];
  const totalRevenue = confirmed.reduce(
    (sum, b) => sum + Number(b.total_price),
    0,
  );

  const confirmRate =
    (bookings?.length ?? 0) > 0
      ? Math.round((confirmed.length / (bookings?.length ?? 1)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              Analytics
            </h1>
            <p className="text-sm text-neutral-500">
              Platform-wide metrics snapshot
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6 space-y-8">
        {/* Platform summary */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">
            Platform summary
          </h2>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                label: "Providers",
                value: providerCount ?? 0,
                href: "/admin/providers",
              },
              { label: "Products", value: productCount ?? 0 },
              {
                label: "Bookings",
                value: bookingCount ?? 0,
                href: "/admin/bookings",
              },
              {
                label: "Customers",
                value: customerCount ?? 0,
                href: "/admin/customers",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-neutral-500">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {s.value}
                </p>
                {s.href && (
                  <Link
                    href={s.href}
                    className="mt-1 block text-xs font-medium hover:underline"
                    style={{ color: "var(--color-accent)" }}
                  >
                    View all
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Booking breakdown */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">
            Booking breakdown
          </h2>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              {
                label: "Confirmed",
                value: confirmed.length,
                color: "text-emerald-600",
              },
              {
                label: "Pending",
                value: pending.length,
                color: "text-amber-600",
              },
              {
                label: "Cancelled",
                value: cancelled.length,
                color: "text-red-600",
              },
              {
                label: "Confirmation rate",
                value: `${confirmRate}%`,
                color: "text-neutral-900",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-neutral-500">{s.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${s.color}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Revenue */}
        <section>
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">
            Revenue
          </h2>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">
                Total confirmed revenue
              </p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-neutral-500">
                Avg per confirmed booking
              </p>
              <p className="mt-1 text-2xl font-semibold text-neutral-900">
                {confirmed.length > 0
                  ? formatCurrency(Math.round(totalRevenue / confirmed.length))
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* Top providers (by import recency, product count to come) */}
        {topProviders?.length ? (
          <section>
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">
              Providers on platform
            </h2>
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b text-left"
                    style={{ color: "var(--color-sage)" }}
                  >
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {topProviders.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-neutral-50"
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "var(--color-forest)" }}
                      >
                        {p.official_name}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--color-sage)" }}
                      >
                        {p.city ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/providers/${p.id}`}
                          className="text-xs font-medium hover:underline"
                          style={{ color: "var(--color-accent)" }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
