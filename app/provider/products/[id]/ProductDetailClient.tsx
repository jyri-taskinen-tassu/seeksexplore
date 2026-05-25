"use client";

import { useState } from "react";
import Link from "next/link";

type InfoRow = {
  language: string;
  name: string | null;
  description: string | null;
  url: string | null;
  webshop_url: string | null;
};
type ImgRow = {
  large_url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  is_cover: boolean;
  order_index: number | null;
  copyright: string | null;
};
type TagRow = { tag: string };
type TargetRow = { target_group: string };
type CertRow = {
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
};
type AvailRow = {
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  doors_open_at: string | null;
  nr_of_tickets: number | null;
};

const MONTH_ORDER = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];
const LANG_LABELS: Record<string, string> = {
  en: "English",
  fi: "Finnish",
  sv: "Swedish",
  de: "German",
  fr: "French",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  es: "Spanish",
  it: "Italian",
  nl: "Dutch",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[10px] font-bold text-[var(--green-900)] uppercase tracking-widest shadow-sm">
      {type.replace(/_/g, " ")}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--line)] opacity-50" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--ink-sub)] opacity-50">
        {children}
      </span>
      <div className="h-px flex-1 bg-[var(--line)] opacity-50" />
    </div>
  );
}

type ProductRow = {
  id: string;
  type: string | null;
  accessible: boolean | null;
  external_source: string | null;
  url_primary: string | null;
  price_from: number | null;
  price_to: number | null;
  pricing_unit: string | null;
  duration_days: number | null;
  duration_hours: number | null;
  duration_minutes: number | null;
  capacity_min: number | null;
  capacity_max: number | null;
  available_months: string[] | null;
  bf_product_id: string | null;
  product_information: InfoRow[];
  product_images: ImgRow[];
  product_tags: TagRow[];
  product_target_groups: TargetRow[];
  product_certificates: CertRow[];
  product_availability: AvailRow[];
};

export default function ProductDetailClient({
  product: rawProduct,
}: {
  product: Record<string, unknown>;
}) {
  const product = rawProduct as unknown as ProductRow;
  const infos = product.product_information ?? [];
  const images = (product.product_images ?? []).sort(
    (a, b) => (a.order_index ?? 99) - (b.order_index ?? 99),
  );
  const tags = product.product_tags ?? [];
  const targets = product.product_target_groups ?? [];
  const certs = product.product_certificates ?? [];
  const availability = product.product_availability ?? [];
  const months = product.available_months ?? [];

  const coverImg = images.find((i) => i.is_cover) ?? images[0];
  const galleryImgs = images
    .filter((i) => !i.is_cover || images.indexOf(i) !== 0)
    .slice(0, 6);

  const availLangs = infos.map((i) => i.language);
  const [activeLang, setActiveLang] = useState(
    availLangs.includes("en") ? "en" : (availLangs[0] ?? "en"),
  );
  const activeInfo = infos.find((i) => i.language === activeLang) ?? infos[0];

  const sortedMonths = months
    .slice()
    .sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b));

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Top nav bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/provider/products"
              className="text-[var(--ink-sub)] hover:text-[var(--green-900)] transition-colors"
            >
              Products
            </Link>
            <span className="text-[var(--line)]">/</span>
            <span className="text-[var(--green-900)] truncate max-w-[240px]">
              {infos.find((i) => i.language === "en")?.name ??
                (product.type as string)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {(product.url_primary as string | null) && (
              <a
                href={product.url_primary as string}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors shadow-sm"
              >
                VIEW ON BF ↗
              </a>
            )}
            <Link
              href={`/provider/products/${product.id as string}/edit`}
              className="rounded-lg bg-[var(--green-900)] px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-[var(--green-900)]/10"
            >
              EDIT PRODUCT
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-[var(--green-900)] shadow-2xl">
          {coverImg ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImg.large_url}
                alt={coverImg.alt_text ?? ""}
                className="w-full h-80 object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--green-900)] via-[var(--green-900)]/20 to-transparent" />
            </>
          ) : (
            <div className="h-80 bg-gradient-to-br from-[var(--green-900)] to-[var(--green-800)]" />
          )}

          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <TypeBadge type={product.type as string} />
                {product.accessible && (
                  <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                    Accessible
                  </span>
                )}
                {targets.map((t) => (
                  <span
                    key={t.target_group}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80 uppercase tracking-widest"
                  >
                    {t.target_group}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {activeInfo?.name ?? (product.type as string)}
              </h1>
            </div>

            {product.price_from != null && (
              <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-3xl font-black text-white">
                  €{product.price_from as number}
                  {product.price_to ? (
                    <span className="text-xl font-medium text-white/70">
                      –{product.price_to as number}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                {product.pricing_unit && (
                  <div className="text-xs font-bold text-[var(--terracotta)] uppercase tracking-wider mt-1">
                    per {product.pricing_unit as string}
                  </div>
                )}
              </div>
            )}
          </div>

          {coverImg?.copyright && (
            <div className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest text-white/40">
              © {coverImg.copyright}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: description + gallery */}
          <div className="xl:col-span-2 space-y-8">
            {/* Language tabs + description */}
            {infos.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm overflow-hidden">
                {/* Lang tabs */}
                <div className="flex border-b border-[var(--line)] overflow-x-auto bg-[var(--cream-50)]/30">
                  {infos.map((info) => (
                    <button
                      key={info.language}
                      onClick={() => setActiveLang(info.language)}
                      className={`flex-shrink-0 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                        activeLang === info.language
                          ? "border-[var(--green-900)] text-[var(--green-900)] bg-white"
                          : "border-transparent text-[var(--ink-sub)] hover:text-[var(--ink)] opacity-60 hover:opacity-100"
                      }`}
                    >
                      {LANG_LABELS[info.language] ??
                        info.language.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {activeInfo?.name && (
                    <h2 className="text-xl font-bold text-[var(--green-900)] mb-6">
                      {activeInfo.name}
                    </h2>
                  )}
                  {activeInfo?.description ? (
                    <div
                      className="rich-text text-sm text-[var(--ink)] leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{
                        __html: activeInfo.description,
                      }}
                    />
                  ) : (
                    <p className="text-sm text-[var(--ink-sub)] italic opacity-50">
                      No description in this language.
                    </p>
                  )}
                  {(activeInfo?.url || activeInfo?.webshop_url) && (
                    <div className="mt-8 pt-8 border-t border-[var(--line)] flex flex-wrap gap-4">
                      {activeInfo.url && (
                        <a
                          href={activeInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--green-900)] hover:text-[var(--terracotta)] transition-colors group"
                        >
                          PRODUCT PAGE <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                        </a>
                      )}
                      {activeInfo.webshop_url && (
                        <a
                          href={activeInfo.webshop_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--green-900)] hover:text-[var(--terracotta)] transition-colors group"
                        >
                          BOOK ONLINE <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-8">
                <SectionLabel>Categorization</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.tag}
                      className="rounded-lg border border-[var(--line)] bg-[var(--cream-50)]/30 px-3 py-2 text-xs font-semibold text-[var(--ink)] hover:border-[var(--green-800)]/30 transition-all cursor-default"
                    >
                      {t.tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image gallery */}
            {galleryImgs.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-8">
                <SectionLabel>Gallery</SectionLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImgs.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--cream-100)] group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.thumbnail_url ?? img.large_url}
                        alt={img.alt_text ?? ""}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[var(--green-900)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability windows */}
            {availability.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-8">
                <SectionLabel>Availability Windows</SectionLabel>
                <div className="space-y-3">
                  {availability.map((av, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--cream-50)]/20 px-5 py-4 transition-all hover:border-[var(--green-800)]/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex-shrink-0" />
                        <span className="text-sm font-bold text-[var(--green-900)]">
                          {av.start_date ?? "—"}{" "}
                          {av.end_date && av.end_date !== av.start_date
                            ? `→ ${av.end_date}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        {av.start_time && (
                          <span className="text-xs font-mono text-[var(--ink-sub)]">
                            {av.start_time.slice(0, 5)}
                            {av.end_time ? `–${av.end_time.slice(0, 5)}` : ""}
                          </span>
                        )}
                        {av.nr_of_tickets != null && (
                          <span className="rounded-full bg-[var(--green-900)] px-3 py-1 text-[10px] font-black text-white uppercase tracking-tighter">
                            {av.nr_of_tickets} tickets
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificates */}
            {certs.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-8">
                <SectionLabel>Sustainability & Quality</SectionLabel>
                <div className="flex flex-wrap gap-4">
                  {certs.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--cream-50)]/30 px-4 py-3 hover:border-[var(--green-800)]/30 transition-all"
                    >
                      {c.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.logo_url}
                          alt={c.name}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <span className="text-sm font-bold text-[var(--green-900)] uppercase tracking-tight">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: stats */}
          <div className="space-y-6">
            {/* Duration & capacity */}
            <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6">
              <SectionLabel>At a glance</SectionLabel>
              <dl className="space-y-4 pt-2">
                {(product.duration_days != null ||
                  product.duration_hours != null ||
                  product.duration_minutes != null) && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs font-bold text-[var(--ink-sub)] uppercase tracking-widest opacity-60">Duration</dt>
                    <dd className="text-sm font-black text-[var(--green-900)]">
                      {[
                        (product.duration_days as number | null) &&
                          `${product.duration_days}d`,
                        (product.duration_hours as number | null) &&
                          `${product.duration_hours}h`,
                        (product.duration_minutes as number | null) &&
                          `${product.duration_minutes}m`,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </dd>
                  </div>
                )}
                {(product.capacity_min != null ||
                  product.capacity_max != null) && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs font-bold text-[var(--ink-sub)] uppercase tracking-widest opacity-60">Group size</dt>
                    <dd className="text-sm font-black text-[var(--green-900)]">
                      {product.capacity_min ?? "1"}–
                      {product.capacity_max ?? "∞"} pax
                    </dd>
                  </div>
                )}
                {product.pricing_unit && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs font-bold text-[var(--ink-sub)] uppercase tracking-widest opacity-60">Unit</dt>
                    <dd className="text-sm font-black text-[var(--green-900)] capitalize">
                      {product.pricing_unit as string}
                    </dd>
                  </div>
                )}
                {product.accessible != null && (
                  <div className="flex items-center justify-between">
                    <dt className="text-xs font-bold text-[var(--ink-sub)] uppercase tracking-widest opacity-60">Accessible</dt>
                    <dd
                      className={`text-sm font-black uppercase tracking-tighter ${product.accessible ? "text-emerald-600" : "text-[var(--ink-sub)]/40"}`}
                    >
                      {product.accessible ? "Yes" : "No"}
                    </dd>
                  </div>
                )}
                {product.external_source && (
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
                    <dt className="text-[10px] font-bold text-[var(--ink-sub)] uppercase tracking-widest opacity-40">Source</dt>
                    <dd className="text-[10px] font-black text-[var(--ink-sub)] uppercase opacity-60">
                      {product.external_source as string}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Available months */}
            {sortedMonths.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6">
                <SectionLabel>Operational Season</SectionLabel>
                <div className="grid grid-cols-4 gap-1.5 pt-2">
                  {MONTH_ORDER.map((m) => {
                    const active = sortedMonths.includes(m);
                    return (
                      <div
                        key={m}
                        className={`rounded-lg py-2 text-center text-[9px] font-black uppercase tracking-tighter transition-all ${
                          active
                            ? "bg-[var(--green-900)] text-white shadow-md shadow-[var(--green-900)]/10"
                            : "bg-[var(--cream-50)] text-[var(--ink-sub)]/30 border border-[var(--line)]/50"
                        }`}
                      >
                        {m.slice(0, 3)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Languages available */}
            {infos.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6">
                <SectionLabel>Translations</SectionLabel>
                <div className="flex flex-wrap gap-2 pt-1">
                  {infos.map((i) => (
                    <span
                      key={i.language}
                      className="rounded-lg border border-[var(--line)] bg-[var(--cream-50)]/30 px-3 py-1.5 text-[10px] font-black text-[var(--green-900)] uppercase tracking-widest shadow-sm"
                    >
                      {i.language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BF metadata */}
            <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6">
              <SectionLabel>Systems Info</SectionLabel>
              <dl className="space-y-4 pt-2">
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--ink-sub)] mb-1 opacity-50">
                    BF Product ID
                  </dt>
                  <dd className="font-mono text-[10px] text-[var(--green-900)] font-semibold break-all bg-[var(--cream-50)]/50 p-2 rounded-lg border border-[var(--line)]">
                    {product.bf_product_id as string}
                  </dd>
                </div>
                <div>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--ink-sub)] mb-1 opacity-50">
                    Internal Identifier
                  </dt>
                  <dd className="font-mono text-[10px] text-[var(--ink-sub)] break-all opacity-60">
                    {product.id as string}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
