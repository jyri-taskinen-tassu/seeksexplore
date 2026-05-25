import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProvidersPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .schema(SCHEMA)
    .from("providers")
    .select(
      "id, official_name, business_name, city, email, imported_at, provider_slug, logo_url, logo_thumbnail_url",
    )
    .order("imported_at", { ascending: false });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--green-900)" }}
          >
            Providers
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ink-sub)" }}>
            {providers?.length ?? 0} registered operator
            {providers?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/providers/import"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--green-800)" }}
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
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import from Business Finland
        </Link>
      </div>

      {!providers?.length ? (
        <div
          className="text-center py-24 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "var(--line)" }}
        >
          <svg
            className="mx-auto mb-4"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--ink-sub)", opacity: 0.6 }}
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <p className="font-semibold" style={{ color: "var(--green-900)" }}>
            No providers yet
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--ink-sub)", opacity: 0.8 }}
          >
            Import your first operator from Business Finland
          </p>
          <Link
            href="/admin/providers/import"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--terracotta)" }}
          >
            Import now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {providers.map((p) => {
            const initials = (p.official_name || "P")
              .split(" ")
              .slice(0, 2)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={p.id}
                className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-[var(--line)]"
              >
                <Link
                  href={`/admin/providers/${p.id}`}
                  className="absolute inset-0 rounded-2xl"
                  aria-label={p.official_name}
                />
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {(p as { logo_thumbnail_url?: string | null })
                      .logo_thumbnail_url || p.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          ((p as { logo_thumbnail_url?: string | null })
                            .logo_thumbnail_url ?? p.logo_url) as string
                        }
                        alt={p.official_name}
                        className="w-12 h-12 object-contain rounded-xl border bg-white"
                        style={{ borderColor: "var(--line)" }}
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: "var(--green-800)" }}
                      >
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm leading-tight group-hover:opacity-70 transition-opacity"
                      style={{ color: "var(--green-900)" }}
                    >
                      {p.official_name}
                    </p>
                    {p.business_name && p.business_name !== p.official_name && (
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--ink-sub)" }}
                      >
                        {p.business_name}
                      </p>
                    )}
                    <div
                      className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs"
                      style={{ color: "var(--ink-sub)" }}
                    >
                      {p.city && (
                        <span className="flex items-center gap-1">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {p.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 pt-4 border-t flex items-center justify-between"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--ink-sub)", opacity: 0.8 }}
                  >
                    {new Date(p.imported_at).toLocaleDateString("en-FI", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    {p.provider_slug && (
                      <a
                        href={`/book/${p.provider_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 text-xs px-2.5 py-1 rounded-lg font-medium transition-opacity hover:opacity-70 flex items-center gap-1"
                        style={{
                          background: "var(--cream-100)",
                          color: "var(--green-900)",
                        }}
                      >
                        Book
                        <svg
                          width="9"
                          height="9"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                    <span
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
                      style={{
                        background: "var(--green-800)",
                        color: "white",
                      }}
                    >
                      View
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
