import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .schema(SCHEMA)
    .from("customers")
    .select(
      "id, first_name, last_name, email, country, total_bookings, total_spent, currency, last_booking_date",
    )
    .order("last_booking_date", { ascending: false, nullsFirst: false })
    .limit(200);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-forest)]">
          All Customers
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Platform-wide — {customers?.length ?? 0} most recent
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left bg-neutral-50">
              <th className="px-4 py-3 font-medium text-neutral-500">
                Customer
              </th>
              <th className="px-4 py-3 font-medium text-neutral-500">
                Country
              </th>
              <th className="px-4 py-3 font-medium text-neutral-500">
                Bookings
              </th>
              <th className="px-4 py-3 font-medium text-neutral-500">
                Last booking
              </th>
              <th className="px-4 py-3 font-medium text-neutral-500 text-right">
                Total spent
              </th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">
                    {[c.first_name, c.last_name].filter(Boolean).join(" ")}
                  </p>
                  <p className="text-xs text-neutral-500">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {c.country ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {c.total_bookings}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {c.last_booking_date
                    ? new Date(c.last_booking_date).toLocaleDateString("en-FI")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right text-neutral-700 font-medium">
                  {Number(c.total_spent).toLocaleString("en-FI", {
                    style: "currency",
                    currency: c.currency ?? "EUR",
                  })}
                </td>
              </tr>
            ))}
            {!customers?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-neutral-400"
                >
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
