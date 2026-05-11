import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProvidersPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .schema(SCHEMA)
    .from("providers")
    .select("id, official_name, business_name, city, email, imported_at")
    .order("imported_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-forest)" }}>Providers</h1>
        <Link
          href="/admin/providers/import"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--color-forest)" }}
        >
          Import from Business Finland
        </Link>
      </div>

      {!providers?.length ? (
        <p className="text-sm" style={{ color: "var(--color-sage)" }}>No providers yet. Import one from Business Finland.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ color: "var(--color-sage)" }}>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Imported</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-forest)" }}>
                    {p.official_name}
                    {p.business_name && p.business_name !== p.official_name && (
                      <span className="block text-xs font-normal" style={{ color: "var(--color-sage)" }}>
                        {p.business_name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-sage)" }}>{p.city ?? "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-sage)" }}>{p.email ?? "—"}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-sage)" }}>
                    {new Date(p.imported_at).toLocaleDateString()}
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
      )}
    </div>
  );
}
