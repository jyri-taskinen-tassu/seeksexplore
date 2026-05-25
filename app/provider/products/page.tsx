import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { SafeImage } from "@/app/components/SafeImage";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderProductsPage() {
  const provider = await getProviderForUser();
  const supabase = await createClient();

  const products = provider
    ? await supabase
        .schema(SCHEMA)
        .from("products")
        .select("*, product_information(*), product_images(*), product_tags(*)")
        .eq("provider_id", (provider as unknown as { id: string }).id)
        .order("created_at")
        .then((r) => r.data ?? [])
    : [];

  return (
    <div className="flex-1 flex flex-col bg-[var(--cream-50)]">
      <header className="border-b border-[var(--line)] bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex w-full items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-[var(--green-900)]">
              Products
            </div>
            <div className="mt-1 text-sm text-[var(--ink-sub)]">
              Manage your product catalog
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/provider/products/new"
              className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
            >
              Create Product
            </Link>
            <Link
              href="/provider/products/new-ai"
              className="rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--green-900)] transition-colors shadow-sm"
            >
              Create with AI
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <section className="rounded-xl border border-[var(--line)] bg-white shadow-sm">
          <div className="border-b border-[var(--line)] px-6 py-4">
            <div className="text-base font-semibold text-[var(--green-900)]">
              Products
            </div>
            <div className="mt-1 text-sm text-[var(--ink-sub)]">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {products.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-sm text-[var(--ink-sub)] mb-4 opacity-50">
                  No products yet
                </div>
                <Link
                  href="/provider/products/new"
                  className="inline-block rounded-lg bg-[var(--green-900)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm transition-opacity"
                >
                  Create your first product
                </Link>
              </div>
            ) : (
              products.map((product) => {
                type InfoRow = {
                  language: string;
                  name: string | null;
                  description: string | null;
                };
                type ImgRow = {
                  thumbnail_url: string | null;
                  large_url: string;
                  is_cover: boolean;
                };
                type TagRow = { tag: string };
                const infos = product.product_information as InfoRow[];
                const enInfo =
                  infos?.find((i) => i.language === "en") ?? infos?.[0];
                const coverImg =
                  (product.product_images as ImgRow[])?.find(
                    (i) => i.is_cover,
                  ) ?? (product.product_images as ImgRow[])?.[0];
                const tags = (product.product_tags as TagRow[]) ?? [];

                return (
                  <div
                    key={product.id}
                    className="p-6 hover:bg-[var(--cream-50)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {coverImg && (
                          <SafeImage
                            src={coverImg.thumbnail_url ?? coverImg.large_url}
                            alt={enInfo?.name ?? ""}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-[var(--line)]"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-[var(--ink)]">
                              {enInfo?.name ?? product.type}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-[var(--cream-100)] px-2.5 py-0.5 text-xs font-medium text-[var(--ink)] ring-1 ring-[var(--line)]">
                              {product.type}
                            </span>
                            {product.accessible && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                Accessible
                              </span>
                            )}
                          </div>
                          {enInfo?.description && (
                            <p className="text-sm text-[var(--ink-sub)] mb-2 line-clamp-2">
                              {enInfo.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-sub)]">
                            {product.price_from != null && (
                              <span className="font-medium text-[var(--terracotta-dark)]">
                                From €{product.price_from}
                                {product.price_to
                                  ? `–€${product.price_to}`
                                  : ""}
                                {product.pricing_unit
                                  ? ` / ${product.pricing_unit}`
                                  : ""}
                              </span>
                            )}
                            {(product.duration_hours != null ||
                              product.duration_days != null) && (
                              <span className="opacity-70">
                                {[
                                  product.duration_days &&
                                    `${product.duration_days}d`,
                                  product.duration_hours &&
                                    `${product.duration_hours}h`,
                                  product.duration_minutes &&
                                    `${product.duration_minutes}m`,
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              </span>
                            )}
                            {product.available_months?.length > 0 && (
                              <span className="opacity-70">
                                {(product.available_months as string[])
                                  .map((m: string) => m.slice(0, 3))
                                  .join(", ")}
                              </span>
                            )}
                            {tags.slice(0, 3).map((t) => (
                              <span
                                key={t.tag}
                                className="rounded-full border border-[var(--line)] px-2 py-0.5 bg-white opacity-70"
                              >
                                {t.tag.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/provider/products/${product.id}`}
                          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream-50)] transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/provider/products/${product.id}/edit`}
                          className="rounded-lg bg-[var(--green-900)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-sm"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
