import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: provider } = await supabase
    .schema(SCHEMA)
    .from("providers")
    .select("*")
    .eq("id", id)
    .single();

  if (!provider) notFound();

  const { data: products } = await supabase
    .schema(SCHEMA)
    .from("products")
    .select(`
      *,
      product_information(*),
      product_images(*),
      product_tags(*),
      product_target_groups(*),
      product_certificates(*),
      product_availability(*)
    `)
    .eq("provider_id", id)
    .order("created_at");

  const socialLinks = provider.social_links as Record<string, string> | null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/admin/providers"
        className="text-sm hover:underline"
        style={{ color: "var(--color-sage)" }}
      >
        ← Providers
      </Link>

      {/* Provider header */}
      <div className="bg-white rounded-xl p-6 shadow-sm flex gap-5 items-start">
        {provider.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.logo_url}
            alt={provider.official_name}
            className="w-20 h-20 object-contain rounded-lg border flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-forest)" }}>
            {provider.official_name}
          </h1>
          {provider.business_name && provider.business_name !== provider.official_name && (
            <p className="text-sm mt-0.5" style={{ color: "var(--color-sage)" }}>
              {provider.business_name}
            </p>
          )}
          {provider.description && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--color-sage)" }}>
              {provider.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs" style={{ color: "var(--color-sage)" }}>
            {provider.city && <span>📍 {provider.street_name ? `${provider.street_name}, ` : ""}{provider.city} {provider.postal_code ?? ""}</span>}
            {provider.email && <span>✉️ {provider.email}</span>}
            {provider.phone && <span>📞 {provider.phone}</span>}
            {provider.website_url && (
              <a href={provider.website_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                🌐 {provider.website_url}
              </a>
            )}
          </div>
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-0.5 rounded-full border hover:opacity-80"
                  style={{ borderColor: "var(--color-sage)", color: "var(--color-sage)" }}
                >
                  {platform.replace(/_/g, " ")}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-right flex-shrink-0" style={{ color: "var(--color-sage)" }}>
          <p>BF ID</p>
          <p className="font-mono mt-0.5 break-all max-w-[180px]">{provider.bf_company_id}</p>
          <p className="mt-2">Imported</p>
          <p className="mt-0.5">{new Date(provider.imported_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-base font-semibold" style={{ color: "var(--color-forest)" }}>
        Products ({products?.length ?? 0})
      </h2>

      {!products?.length ? (
        <p className="text-sm" style={{ color: "var(--color-sage)" }}>No products imported.</p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const enInfo = (p.product_information as { language: string; name: string | null; description: string | null; url: string | null; webshop_url: string | null }[])
              ?.find((i) => i.language === "en") ??
              (p.product_information as { language: string; name: string | null; description: string | null; url: string | null; webshop_url: string | null }[])?.[0];
            const coverImg = (p.product_images as { is_cover: boolean; large_url: string; thumbnail_url: string | null; alt_text: string | null; order_index: number | null }[])
              ?.find((img) => img.is_cover) ??
              (p.product_images as { is_cover: boolean; large_url: string; thumbnail_url: string | null; alt_text: string | null; order_index: number | null }[])?.[0];

            return (
              <div key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Product header */}
                <div className="flex gap-4 p-5">
                  {coverImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImg.thumbnail_url ?? coverImg.large_url}
                      alt={coverImg.alt_text ?? ""}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--color-forest)" }}>
                          {enInfo?.name ?? p.type}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ background: "var(--color-cream)", color: "var(--color-forest)" }}
                        >
                          {p.type}
                        </span>
                      </div>
                      <div className="text-xs text-right flex-shrink-0" style={{ color: "var(--color-sage)" }}>
                        {p.price_from != null && (
                          <p className="font-medium" style={{ color: "var(--color-accent)" }}>
                            €{p.price_from}{p.price_to ? `–€${p.price_to}` : ""} / {p.pricing_unit ?? "unit"}
                          </p>
                        )}
                        {(p.duration_hours != null || p.duration_days != null || p.duration_minutes != null) && (
                          <p className="mt-0.5">
                            ⏱ {[
                              p.duration_days && `${p.duration_days}d`,
                              p.duration_hours && `${p.duration_hours}h`,
                              p.duration_minutes && `${p.duration_minutes}m`,
                            ].filter(Boolean).join(" ")}
                          </p>
                        )}
                        {(p.capacity_min != null || p.capacity_max != null) && (
                          <p className="mt-0.5">👥 {p.capacity_min ?? ""}–{p.capacity_max ?? "∞"} pax</p>
                        )}
                        {p.accessible && <p className="mt-0.5">♿ Accessible</p>}
                      </div>
                    </div>
                    {enInfo?.description && (
                      <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--color-sage)" }}>
                        {enInfo.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: "var(--color-sage)" }}>
                      {enInfo?.url && (
                        <a href={enInfo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">🌐 Product page</a>
                      )}
                      {enInfo?.webshop_url && (
                        <a href={enInfo.webshop_url} target="_blank" rel="noopener noreferrer" className="hover:underline">🛒 Webshop</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-data grid */}
                <div className="border-t grid grid-cols-2 md:grid-cols-4 divide-x text-xs" style={{ color: "var(--color-sage)" }}>
                  {/* Languages */}
                  <div className="p-3">
                    <p className="font-medium mb-1" style={{ color: "var(--color-forest)" }}>Languages</p>
                    {(p.product_information as { language: string }[])?.length ? (
                      <p>{(p.product_information as { language: string }[]).map((i) => i.language.toUpperCase()).join(", ")}</p>
                    ) : <p className="italic">—</p>}
                  </div>

                  {/* Tags */}
                  <div className="p-3">
                    <p className="font-medium mb-1" style={{ color: "var(--color-forest)" }}>Tags</p>
                    {(p.product_tags as { tag: string }[])?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {(p.product_tags as { tag: string }[]).map((t) => (
                          <span key={t.tag} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "var(--color-cream)" }}>
                            {t.tag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    ) : <p className="italic">—</p>}
                  </div>

                  {/* Target groups */}
                  <div className="p-3">
                    <p className="font-medium mb-1" style={{ color: "var(--color-forest)" }}>Target</p>
                    {(p.product_target_groups as { target_group: string }[])?.length ? (
                      <p>{(p.product_target_groups as { target_group: string }[]).map((tg) => tg.target_group.toUpperCase()).join(", ")}</p>
                    ) : <p className="italic">—</p>}
                  </div>

                  {/* Available months */}
                  <div className="p-3">
                    <p className="font-medium mb-1" style={{ color: "var(--color-forest)" }}>Months</p>
                    {p.available_months?.length ? (
                      <p className="capitalize">{(p.available_months as string[]).map((m) => m.slice(0, 3)).join(", ")}</p>
                    ) : <p className="italic">—</p>}
                  </div>
                </div>

                {/* Images strip */}
                {(p.product_images as { large_url: string; thumbnail_url: string | null; alt_text: string | null }[])?.length > 1 && (
                  <div className="border-t p-3 flex gap-2 overflow-x-auto">
                    {(p.product_images as { large_url: string; thumbnail_url: string | null; alt_text: string | null }[]).map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={img.thumbnail_url ?? img.large_url}
                        alt={img.alt_text ?? ""}
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                {/* Certificates */}
                {(p.product_certificates as { name: string; website_url: string | null }[])?.length > 0 && (
                  <div className="border-t p-3 text-xs" style={{ color: "var(--color-sage)" }}>
                    <p className="font-medium mb-1" style={{ color: "var(--color-forest)" }}>Certificates</p>
                    <div className="flex flex-wrap gap-2">
                      {(p.product_certificates as { name: string; website_url: string | null }[]).map((c) => (
                        <span key={c.name} className="px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-sage)" }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multilingual info accordion */}
                {(p.product_information as { language: string; name: string | null }[])?.length > 1 && (
                  <details className="border-t">
                    <summary className="px-5 py-2 text-xs cursor-pointer" style={{ color: "var(--color-sage)" }}>
                      All languages ({(p.product_information as { language: string }[]).length})
                    </summary>
                    <div className="px-5 pb-4 grid gap-3">
                      {(p.product_information as { language: string; name: string | null; description: string | null }[]).map((info) => (
                        <div key={info.language}>
                          <p className="text-xs font-semibold uppercase mb-0.5" style={{ color: "var(--color-forest)" }}>{info.language}</p>
                          <p className="text-xs font-medium">{info.name}</p>
                          {info.description && (
                            <p className="text-xs mt-0.5 line-clamp-3" style={{ color: "var(--color-sage)" }}>{info.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* BF ID footer */}
                <div className="border-t px-5 py-2 text-[10px]" style={{ color: "var(--color-sage)" }}>
                  BF product ID: <span className="font-mono">{p.bf_product_id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
