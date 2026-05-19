import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

type ProductInfo = {
  language: string;
  name: string | null;
  description: string | null;
  url: string | null;
  webshop_url: string | null;
};
type ProductImage = {
  is_cover: boolean;
  large_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  order_index: number | null;
};
type ProductTag = { tag: string };
type ProductTargetGroup = { target_group: string };
type ProductCertificate = { name: string; website_url: string | null };

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
    .select(
      `
      *,
      product_information(*),
      product_images(*),
      product_tags(*),
      product_target_groups(*),
      product_certificates(*),
      product_availability(*)
    `,
    )
    .eq("provider_id", id)
    .order("created_at");

  const socialLinks = provider.social_links as Record<string, string> | null;

  return (
    <div className="p-8">
      {/* Back */}
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-60"
        style={{ color: "var(--color-sage)" }}
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Providers
      </Link>

      {/* Provider profile card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
        {/* Top strip with forest green */}
        <div className="h-2" style={{ background: "var(--color-forest)" }} />

        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="flex-shrink-0">
              {provider.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.logo_url}
                  alt={provider.official_name}
                  className="w-20 h-20 object-contain rounded-xl border bg-white"
                  style={{ borderColor: "var(--color-cream)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ background: "var(--color-forest)" }}
                >
                  {(provider.official_name || "P")
                    .split(" ")
                    .slice(0, 2)
                    .map((w: string) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl font-bold tracking-tight"
                style={{ color: "var(--color-forest)" }}
              >
                {provider.official_name}
              </h1>
              {provider.business_name &&
                provider.business_name !== provider.official_name && (
                  <p
                    className="text-sm mt-0.5"
                    style={{ color: "var(--color-sage)" }}
                  >
                    {provider.business_name}
                  </p>
                )}
              {provider.description && (
                <p
                  className="text-sm mt-2 leading-relaxed max-w-2xl"
                  style={{ color: "var(--color-sage)" }}
                >
                  {provider.description}
                </p>
              )}

              {/* Contact row */}
              <div
                className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs"
                style={{ color: "var(--color-sage)" }}
              >
                {provider.city && (
                  <span className="flex items-center gap-1.5">
                    <svg
                      width="11"
                      height="11"
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
                    {provider.street_name ? `${provider.street_name}, ` : ""}
                    {provider.city}
                    {provider.postal_code ? ` ${provider.postal_code}` : ""}
                  </span>
                )}
                {provider.email && (
                  <a
                    href={`mailto:${provider.email}`}
                    className="flex items-center gap-1.5 hover:underline"
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
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {provider.email}
                  </a>
                )}
                {provider.phone && (
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex items-center gap-1.5 hover:underline"
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
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 17z" />
                    </svg>
                    {provider.phone}
                  </a>
                )}
                {provider.website_url && (
                  <a
                    href={provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:underline"
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
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    {provider.website_url}
                  </a>
                )}
              </div>

              {/* Social chips */}
              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-full border font-medium transition-opacity hover:opacity-70 capitalize"
                      style={{
                        borderColor: "var(--color-sage)",
                        color: "var(--color-sage)",
                      }}
                    >
                      {platform.replace(/_/g, " ")}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Meta right */}
            <div
              className="flex-shrink-0 text-right text-xs space-y-2"
              style={{ color: "var(--color-sage)" }}
            >
              <div>
                <p className="uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                  BF ID
                </p>
                <p
                  className="font-mono text-[11px] break-all max-w-[160px] ml-auto"
                  style={{ color: "var(--color-forest)" }}
                >
                  {provider.bf_company_id}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                  Imported
                </p>
                <p>
                  {new Date(provider.imported_at).toLocaleDateString("en-FI", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wider font-semibold text-[10px] mb-0.5">
                  Products
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--color-forest)" }}
                >
                  {products?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-base font-bold tracking-tight"
          style={{ color: "var(--color-forest)" }}
        >
          Products
          <span
            className="ml-2 text-sm font-normal"
            style={{ color: "var(--color-sage)" }}
          >
            {products?.length ?? 0}
          </span>
        </h2>
      </div>

      {!products?.length ? (
        <div
          className="text-center py-16 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "var(--color-cream)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-sage)" }}>
            No products imported for this provider.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const infos = p.product_information as ProductInfo[];
            const images = p.product_images as ProductImage[];
            const tags = p.product_tags as ProductTag[];
            const targetGroups =
              p.product_target_groups as ProductTargetGroup[];
            const certs = p.product_certificates as ProductCertificate[];

            const enInfo =
              infos?.find((i) => i.language === "en") ?? infos?.[0];
            const coverImg = images?.find((img) => img.is_cover) ?? images?.[0];

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Product main row */}
                <div className="flex gap-5 p-5">
                  {coverImg && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImg.thumbnail_url ?? coverImg.large_url}
                      alt={coverImg.alt_text ?? ""}
                      className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm leading-snug"
                          style={{ color: "var(--color-forest)" }}
                        >
                          {enInfo?.name ?? p.type}
                        </p>
                        <span
                          className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium"
                          style={{
                            background: "var(--color-cream)",
                            color: "var(--color-forest)",
                          }}
                        >
                          {p.type}
                        </span>
                      </div>

                      {/* Price & stats */}
                      <div
                        className="flex-shrink-0 text-right text-xs space-y-1"
                        style={{ color: "var(--color-sage)" }}
                      >
                        {p.price_from != null && (
                          <p
                            className="font-bold text-sm"
                            style={{ color: "var(--color-accent)" }}
                          >
                            €{p.price_from}
                            {p.price_to ? `–€${p.price_to}` : ""}
                            <span
                              className="font-normal ml-1"
                              style={{ color: "var(--color-sage)" }}
                            >
                              / {p.pricing_unit ?? "unit"}
                            </span>
                          </p>
                        )}
                        {(p.duration_hours != null ||
                          p.duration_days != null ||
                          p.duration_minutes != null) && (
                          <p className="flex items-center justify-end gap-1">
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
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {[
                              p.duration_days && `${p.duration_days}d`,
                              p.duration_hours && `${p.duration_hours}h`,
                              p.duration_minutes && `${p.duration_minutes}m`,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                        )}
                        {(p.capacity_min != null || p.capacity_max != null) && (
                          <p className="flex items-center justify-end gap-1">
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
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {p.capacity_min ?? ""}–{p.capacity_max ?? "∞"} pax
                          </p>
                        )}
                        {p.accessible && (
                          <p className="flex items-center justify-end gap-1">
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
                              <circle cx="12" cy="4" r="2" />
                              <path d="M19 13v-2a7 7 0 0 0-14 0v2" />
                              <path d="M5 13h14l-2 7H7z" />
                            </svg>
                            Accessible
                          </p>
                        )}
                      </div>
                    </div>

                    {enInfo?.description && (
                      <p
                        className="text-xs mt-2 line-clamp-2 leading-relaxed"
                        style={{ color: "var(--color-sage)" }}
                      >
                        {enInfo.description}
                      </p>
                    )}

                    <div
                      className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs"
                      style={{ color: "var(--color-sage)" }}
                    >
                      {enInfo?.url && (
                        <a
                          href={enInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
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
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          Product page
                        </a>
                      )}
                      {enInfo?.webshop_url && (
                        <a
                          href={enInfo.webshop_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
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
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          Webshop
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metadata grid */}
                <div
                  className="grid grid-cols-2 md:grid-cols-4 divide-x border-t text-xs"
                  style={{
                    borderColor: "var(--color-cream)",
                    color: "var(--color-sage)",
                  }}
                >
                  <div
                    className="p-3"
                    style={{ borderColor: "var(--color-cream)" }}
                  >
                    <p
                      className="font-semibold text-[10px] uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--color-forest)", opacity: 0.7 }}
                    >
                      Languages
                    </p>
                    {infos?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {infos.map((i) => (
                          <span
                            key={i.language}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                            style={{
                              background: "var(--color-cream)",
                              color: "var(--color-forest)",
                            }}
                          >
                            {i.language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="italic opacity-50">—</p>
                    )}
                  </div>

                  <div
                    className="p-3"
                    style={{ borderColor: "var(--color-cream)" }}
                  >
                    <p
                      className="font-semibold text-[10px] uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--color-forest)", opacity: 0.7 }}
                    >
                      Tags
                    </p>
                    {tags?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 4).map((t) => (
                          <span
                            key={t.tag}
                            className="px-1.5 py-0.5 rounded text-[10px]"
                            style={{
                              background: "var(--color-cream)",
                              color: "var(--color-sage)",
                            }}
                          >
                            {t.tag.replace(/_/g, " ")}
                          </span>
                        ))}
                        {tags.length > 4 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] opacity-60"
                            style={{ color: "var(--color-sage)" }}
                          >
                            +{tags.length - 4}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="italic opacity-50">—</p>
                    )}
                  </div>

                  <div
                    className="p-3"
                    style={{ borderColor: "var(--color-cream)" }}
                  >
                    <p
                      className="font-semibold text-[10px] uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--color-forest)", opacity: 0.7 }}
                    >
                      Target
                    </p>
                    {targetGroups?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {targetGroups.map((tg) => (
                          <span
                            key={tg.target_group}
                            className="px-1.5 py-0.5 rounded text-[10px] uppercase font-medium"
                            style={{
                              background: "rgba(150,176,187,0.2)",
                              color: "var(--color-sky)",
                            }}
                          >
                            {tg.target_group}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="italic opacity-50">—</p>
                    )}
                  </div>

                  <div className="p-3">
                    <p
                      className="font-semibold text-[10px] uppercase tracking-wider mb-1.5"
                      style={{ color: "var(--color-forest)", opacity: 0.7 }}
                    >
                      Months
                    </p>
                    {(p.available_months as string[] | null)?.length ? (
                      <p className="capitalize leading-relaxed">
                        {(p.available_months as string[])
                          .map((m) => m.slice(0, 3))
                          .join(", ")}
                      </p>
                    ) : (
                      <p className="italic opacity-50">—</p>
                    )}
                  </div>
                </div>

                {/* Image strip */}
                {images?.length > 1 && (
                  <div
                    className="border-t p-3 flex gap-2 overflow-x-auto"
                    style={{ borderColor: "var(--color-cream)" }}
                  >
                    {images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={img.thumbnail_url ?? img.large_url}
                        alt={img.alt_text ?? ""}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                )}

                {/* Certificates */}
                {certs?.length > 0 && (
                  <div
                    className="border-t p-4 text-xs"
                    style={{
                      borderColor: "var(--color-cream)",
                      color: "var(--color-sage)",
                    }}
                  >
                    <p
                      className="font-semibold text-[10px] uppercase tracking-wider mb-2"
                      style={{ color: "var(--color-forest)", opacity: 0.7 }}
                    >
                      Certificates
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {certs.map((c) => (
                        <span
                          key={c.name}
                          className="px-2.5 py-1 rounded-full border font-medium"
                          style={{
                            borderColor: "var(--color-sage)",
                            opacity: 0.8,
                          }}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multilingual accordion */}
                {infos?.length > 1 && (
                  <details
                    className="border-t"
                    style={{ borderColor: "var(--color-cream)" }}
                  >
                    <summary
                      className="px-5 py-2.5 text-xs cursor-pointer font-medium transition-opacity hover:opacity-70"
                      style={{ color: "var(--color-sage)" }}
                    >
                      All languages ({infos.length})
                    </summary>
                    <div className="px-5 pb-5 grid gap-4 pt-1">
                      {infos.map((info) => (
                        <div key={info.language}>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-1"
                            style={{ color: "var(--color-forest)" }}
                          >
                            {info.language}
                          </p>
                          <p
                            className="text-xs font-semibold"
                            style={{ color: "var(--color-forest)" }}
                          >
                            {info.name}
                          </p>
                          {info.description && (
                            <p
                              className="text-xs mt-1 line-clamp-3 leading-relaxed"
                              style={{ color: "var(--color-sage)" }}
                            >
                              {info.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* BF ID footer */}
                <div
                  className="border-t px-5 py-2 text-[10px] font-mono"
                  style={{
                    borderColor: "var(--color-cream)",
                    color: "var(--color-sage)",
                    opacity: 0.6,
                  }}
                >
                  BF product ID: {p.bf_product_id}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
