import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: providerCount },
    { count: productCount },
    { count: bookingCount },
    { count: customerCount },
    { data: recentProviders },
    { data: recentBookings },
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
      .from("providers")
      .select("id, official_name, city, imported_at, provider_slug")
      .order("imported_at", { ascending: false })
      .limit(5),
    supabase
      .schema(SCHEMA)
      .from("bookings")
      .select(
        "id, customer_name, product_name, booking_date, status, total_price, currency",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const statusColors: Record<string, string> = {
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              Platform Overview
            </h1>
            <p className="text-sm text-neutral-500">
              {new Date().toLocaleDateString("en-FI", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <Link
            href="/admin/providers/import"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-forest)" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import Provider
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6 space-y-8">
        {/* KPI grid */}
        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            label="Providers"
            value={providerCount ?? 0}
            hint="Imported from Business Finland"
            href="/admin/providers"
          />
          <StatCard
            label="Products"
            value={productCount ?? 0}
            hint="Across all providers"
          />
          <StatCard
            label="Bookings"
            value={bookingCount ?? 0}
            hint="All time"
            href="/admin/bookings"
          />
          <StatCard
            label="Customers"
            value={customerCount ?? 0}
            hint="Registered"
            href="/admin/customers"
          />
        </section>

        {/* Split: recent providers + recent bookings */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Recent providers */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div className="text-base font-semibold text-neutral-900">
                Recent providers
              </div>
              <Link
                href="/admin/providers"
                className="text-xs font-medium hover:underline"
                style={{ color: "var(--color-accent)" }}
              >
                View all
              </Link>
            </div>

            {!recentProviders?.length ? (
              <div className="px-6 py-8 text-center text-sm text-neutral-500">
                No providers yet.{" "}
                <Link
                  href="/admin/providers/import"
                  className="font-medium hover:underline"
                  style={{ color: "var(--color-forest)" }}
                >
                  Import one
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentProviders.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50"
                  >
                    <div>
                      <Link
                        href={`/admin/providers/${p.id}`}
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        {p.official_name}
                      </Link>
                      {p.city && (
                        <p className="text-xs text-neutral-500">{p.city}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {p.provider_slug ? (
                        <a
                          href={`/book/${p.provider_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:underline"
                          style={{ color: "var(--color-sage)" }}
                        >
                          Book page
                        </a>
                      ) : null}
                      <span className="text-xs text-neutral-400">
                        {new Date(p.imported_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
              <div className="text-base font-semibold text-neutral-900">
                Recent bookings
              </div>
              <Link
                href="/admin/bookings"
                className="text-xs font-medium hover:underline"
                style={{ color: "var(--color-accent)" }}
              >
                View all
              </Link>
            </div>

            {!recentBookings?.length ? (
              <div className="px-6 py-8 text-center text-sm text-neutral-500">
                No bookings yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {b.customer_name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {b.product_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusColors[b.status] ?? "bg-neutral-50 text-neutral-700 ring-neutral-200"}`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {new Date(b.booking_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm px-6 py-5">
          <div className="text-sm font-semibold text-neutral-900 mb-4">
            Quick actions
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/providers/import"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Import from Business Finland
            </Link>
            <Link
              href="/admin/providers"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Manage providers
            </Link>
            <Link
              href="/admin/bookings"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              All bookings
            </Link>
            <Link
              href="/admin/customers"
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              Customers
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
