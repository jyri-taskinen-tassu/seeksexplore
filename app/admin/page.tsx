import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: providerCount }, { count: productCount }] = await Promise.all([
    supabase.schema(SCHEMA).from("providers").select("*", { count: "exact", head: true }),
    supabase.schema(SCHEMA).from("products").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-6" style={{ color: "var(--color-forest)" }}>
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm" style={{ color: "var(--color-sage)" }}>Providers</p>
          <p className="text-3xl font-semibold mt-1" style={{ color: "var(--color-forest)" }}>
            {providerCount ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm" style={{ color: "var(--color-sage)" }}>Products</p>
          <p className="text-3xl font-semibold mt-1" style={{ color: "var(--color-forest)" }}>
            {productCount ?? 0}
          </p>
        </div>
      </div>
      <a
        href="/admin/providers/import"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: "var(--color-forest)" }}
      >
        Import Provider from Business Finland
      </a>
    </div>
  );
}
