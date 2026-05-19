import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProvidersPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .schema(SCHEMA)
    .from("providers")
    .select(
      "id, official_name, business_name, city, email, imported_at, provider_slug",
    )
    .order("imported_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-forest)" }}
        >
          Providers
        </h1>
        <Link
          href="/admin/providers/import"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--color-forest)" }}
        >
          Import from Business Finland
        </Link>
      </div>

      {!providers?.length ? (
        <p className="text-sm" style={{ color: "var(--color-sage)" }}>
          No providers yet. Import one from Business Finland.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-left"
                style={{ color: "var(--color-sage)" }}
              >
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
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--color-forest)" }}
                  >
                    {p.official_name}
                    {p.business_name && p.business_name !== p.official_name && (
                      <span
                        className="block text-xs font-normal"
                        style={{ color: "var(--color-sage)" }}
                      >
                        {p.business_name}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--color-sage)" }}
                  >
                    {p.city ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--color-sage)" }}
                  >
                    {p.email ?? "—"}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: "var(--color-sage)" }}
                  >
                    {new Date(p.imported_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/providers/${p.id}`}
                        className="text-xs font-medium hover:underline"
                        style={{ color: "var(--color-accent)" }}
                      >
                        View
                      </Link>
                      {p.provider_slug ? (
                        <a
                          href={`/book/${p.provider_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          style={{ color: "var(--color-sage)" }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          Book
                        </a>
                      ) : null}
                    </div>
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
