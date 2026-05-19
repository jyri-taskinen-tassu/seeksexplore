import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[var(--color-forest)]">
        {value}
      </p>
    </Link>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: providerCount },
    { count: productCount },
    { count: bookingCount },
    { count: customerCount },
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
  ]);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-forest)]">
          Platform Overview
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {new Date().toLocaleDateString("en-FI", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
        <StatCard
          label="Providers"
          value={providerCount ?? 0}
          href="/admin/providers"
        />
        <StatCard
          label="Products"
          value={productCount ?? 0}
          href="/admin/providers"
        />
        <StatCard
          label="Bookings"
          value={bookingCount ?? 0}
          href="/admin/bookings"
        />
        <StatCard
          label="Customers"
          value={customerCount ?? 0}
          href="/admin/customers"
        />
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/providers/import"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--color-forest)] hover:opacity-90 transition-opacity"
        >
          Import Provider from Business Finland
        </Link>
        <Link
          href="/admin/providers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-forest)] border border-[var(--color-forest)]/30 hover:bg-[var(--color-forest)]/5 transition-colors"
        >
          View all providers
        </Link>
      </div>
    </div>
  );
}
