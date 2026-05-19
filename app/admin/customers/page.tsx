import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .schema(SCHEMA)
    .from("customers")
    .select("id, name, email, phone, created_at")
    .order("created_at", { ascending: false });

  const total = customers?.length ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">
              Customers
            </h1>
            <p className="text-sm text-neutral-500">
              All customers registered on the platform
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-6 py-6 space-y-6">
        {/* Stat */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-neutral-500">Total Customers</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">
              {total}
            </p>
          </div>
        </div>

        {/* Table */}
        {!customers?.length ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 shadow-sm">
            No customers yet.
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{ color: "var(--color-sage)" }}
                >
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-neutral-50"
                  >
                    <td
                      className="px-4 py-3 font-medium"
                      style={{ color: "var(--color-forest)" }}
                    >
                      {c.name ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {c.email ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {c.phone ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs" style={{ color: "var(--color-sage)" }}>
          Showing all {total} customer{total !== 1 ? "s" : ""}.{" "}
          <Link
            href="/admin/bookings"
            className="font-medium hover:underline"
            style={{ color: "var(--color-forest)" }}
          >
            View all bookings
          </Link>
        </p>
      </main>
    </div>
  );
}
