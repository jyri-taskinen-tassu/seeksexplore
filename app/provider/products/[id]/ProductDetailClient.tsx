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
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 uppercase tracking-wide">
      {type.replace(/_/g, " ")}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-neutral-100" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
}

export default function ProductDetailClient({
  product,
}: {
  product: Record<string, unknown>;
}) {
  const infos = (product.product_information as InfoRow[]) ?? [];
  const images = ((product.product_images as ImgRow[]) ?? []).sort(
    (a, b) => (a.order_index ?? 99) - (b.order_index ?? 99),
  );
  const tags = (product.product_tags as TagRow[]) ?? [];
  const targets = (product.product_target_groups as TargetRow[]) ?? [];
  const certs = (product.product_certificates as CertRow[]) ?? [];
  const availability = (product.product_availability as AvailRow[]) ?? [];
  const months = (product.available_months as string[] | null) ?? [];

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
    <div className="min-h-screen bg-neutral-50">
      {/* Top nav bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/provider/products"
              className="text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Products
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="font-medium text-neutral-900 truncate max-w-[240px]">
              {infos.find((i) => i.language === "en")?.name ??
                (product.type as string)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(product.url_primary as string | null) && (
              <a
                href={product.url_primary as string}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                View on BF ↗
              </a>
            )}
            <Link
              href={`/provider/products/${product.id as string}/edit`}
              className="rounded-lg bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              Edit product
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 shadow-lg">
          {coverImg ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImg.large_url}
                alt={coverImg.alt_text ?? ""}
                className="w-full h-72 object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/20 to-transparent" />
            </>
          ) : (
            <div className="h-72 bg-gradient-to-br from-neutral-800 to-neutral-900" />
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <TypeBadge type={product.type as string} />
                {product.accessible && (
                  <span className="inline-flex items-center rounded-full border border-emerald-300/40 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                    Accessible
                  </span>
                )}
                {targets.map((t) => (
                  <span
                    key={t.target_group}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 uppercase tracking-wide"
                  >
                    {t.target_group}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {activeInfo?.name ?? (product.type as string)}
              </h1>
            </div>

            {product.price_from != null && (
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-white">
                  €{product.price_from as number}
                  {product.price_to ? (
                    <span className="text-lg font-normal text-white/70">
                      –{product.price_to as number}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                {product.pricing_unit && (
                  <div className="text-sm text-white/60">
                    per {product.pricing_unit as string}
                  </div>
                )}
              </div>
            )}
          </div>

          {coverImg?.copyright && (
            <div className="absolute top-3 right-3 text-[10px] text-white/40">
              © {coverImg.copyright}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: description + gallery */}
          <div className="xl:col-span-2 space-y-6">
            {/* Language tabs + description */}
            {infos.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                {/* Lang tabs */}
                <div className="flex border-b border-neutral-100 overflow-x-auto">
                  {infos.map((info) => (
                    <button
                      key={info.language}
                      onClick={() => setActiveLang(info.language)}
                      className={`flex-shrink-0 px-4 py-3 text-xs font-semibold tracking-wide transition-colors border-b-2 ${
                        activeLang === info.language
                          ? "border-neutral-900 text-neutral-900 bg-neutral-50"
                          : "border-transparent text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      {LANG_LABELS[info.language] ??
                        info.language.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeInfo?.name && (
                    <h2 className="text-lg font-semibold text-neutral-900 mb-3">
                      {activeInfo.name}
                    </h2>
                  )}
                  {activeInfo?.description ? (
                    <div
                      className="rich-text text-sm text-neutral-600 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: activeInfo.description,
                      }}
                    />
                  ) : (
                    <p className="text-sm text-neutral-400 italic">
                      No description in this language.
                    </p>
                  )}
                  {(activeInfo?.url || activeInfo?.webshop_url) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {activeInfo.url && (
                        <a
                          href={activeInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
                        >
                          Product page ↗
                        </a>
                      )}
                      {activeInfo.webshop_url && (
                        <a
                          href={activeInfo.webshop_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
                        >
                          Book online ↗
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
                <SectionLabel>Tags</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t.tag}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700"
                    >
                      {t.tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Image gallery */}
            {galleryImgs.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
                <SectionLabel>Gallery</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImgs.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.thumbnail_url ?? img.large_url}
                        alt={img.alt_text ?? ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability windows */}
            {availability.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
                <SectionLabel>Availability windows</SectionLabel>
                <div className="space-y-2">
                  {availability.map((av, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="font-medium text-neutral-900">
                          {av.start_date ?? "—"}{" "}
                          {av.end_date && av.end_date !== av.start_date
                            ? `→ ${av.end_date}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-neutral-500">
                        {av.start_time && (
                          <span>
                            {av.start_time.slice(0, 5)}
                            {av.end_time ? `–${av.end_time.slice(0, 5)}` : ""}
                          </span>
                        )}
                        {av.nr_of_tickets != null && (
                          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700">
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
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-6">
                <SectionLabel>Certificates & accreditations</SectionLabel>
                <div className="flex flex-wrap gap-3">
                  {certs.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
                    >
                      {c.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.logo_url}
                          alt={c.name}
                          className="h-5 w-5 object-contain"
                        />
                      )}
                      <span className="text-sm font-medium text-neutral-700">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: stats */}
          <div className="space-y-4">
            {/* Duration & capacity */}
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
              <SectionLabel>Details</SectionLabel>
              <dl className="space-y-3">
                {(product.duration_days != null ||
                  product.duration_hours != null ||
                  product.duration_minutes != null) && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-neutral-500">Duration</dt>
                    <dd className="text-sm font-semibold text-neutral-900">
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
                    <dt className="text-sm text-neutral-500">Group size</dt>
                    <dd className="text-sm font-semibold text-neutral-900">
                      {product.capacity_min ?? "1"}–
                      {product.capacity_max ?? "∞"} pax
                    </dd>
                  </div>
                )}
                {product.pricing_unit && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-neutral-500">Pricing unit</dt>
                    <dd className="text-sm font-semibold text-neutral-900 capitalize">
                      {product.pricing_unit as string}
                    </dd>
                  </div>
                )}
                {product.accessible != null && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-neutral-500">Accessible</dt>
                    <dd
                      className={`text-sm font-semibold ${product.accessible ? "text-emerald-600" : "text-neutral-400"}`}
                    >
                      {product.accessible ? "Yes" : "No"}
                    </dd>
                  </div>
                )}
                {product.external_source && (
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-neutral-500">Source</dt>
                    <dd className="text-sm font-semibold text-neutral-900">
                      {product.external_source as string}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Available months */}
            {sortedMonths.length > 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
                <SectionLabel>Season</SectionLabel>
                <div className="grid grid-cols-4 gap-1">
                  {MONTH_ORDER.map((m) => {
                    const active = sortedMonths.includes(m);
                    return (
                      <div
                        key={m}
                        className={`rounded-md py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                          active
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-400"
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
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
                <SectionLabel>Languages</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {infos.map((i) => (
                    <span
                      key={i.language}
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700 uppercase"
                    >
                      {i.language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BF metadata */}
            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm p-5">
              <SectionLabel>Source data</SectionLabel>
              <dl className="space-y-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-0.5">
                    BF Product ID
                  </dt>
                  <dd className="font-mono text-xs text-neutral-600 break-all">
                    {product.bf_product_id as string}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-0.5">
                    Internal ID
                  </dt>
                  <dd className="font-mono text-xs text-neutral-600 break-all">
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
