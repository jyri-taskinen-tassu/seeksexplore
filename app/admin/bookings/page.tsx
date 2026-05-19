import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-neutral-50 text-neutral-700 ring-neutral-200",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .select(
      "id, customer_name, customer_email, product_name, booking_date, status, total_price, currency, provider_id",
    )
    .order("booking_date", { ascending: false })
    .limit(200);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-forest)]">
          All Bookings
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Platform-wide — {bookings?.length ?? 0} most recent
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
                Product
              </th>
              <th className="px-4 py-3 font-medium text-neutral-500">Date</th>
              <th className="px-4 py-3 font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3 font-medium text-neutral-500 text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((b) => (
              <tr
                key={b.id}
                className="border-b last:border-0 hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">
                    {b.customer_name}
                  </p>
                  <p className="text-xs text-neutral-500">{b.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-neutral-700">{b.product_name}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(b.booking_date).toLocaleDateString("en-FI")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 capitalize ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-neutral-700 font-medium">
                  {Number(b.total_price).toLocaleString("en-FI", {
                    style: "currency",
                    currency: b.currency ?? "EUR",
                  })}
                </td>
              </tr>
            ))}
            {!bookings?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-neutral-400"
                >
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
