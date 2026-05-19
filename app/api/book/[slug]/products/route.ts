import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: provider } = await admin
    .schema(SCHEMA)
    .from("providers")
    .select("id, business_name, official_name, description, city, logo_url")
    .eq("provider_slug", slug)
    .single();

  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const { data: products } = await admin
    .schema(SCHEMA)
    .from("products")
    .select(
      "id, type, price_from, price_to, pricing_unit, duration_hours, duration_minutes, duration_days, capacity_max, capacity_min, city, available_months, resources, product_information(*), product_images(*), product_tags(*)",
    )
    .eq("provider_id", provider.id)
    .order("created_at");

  type InfoRow = {
    language: string;
    name: string | null;
    description: string | null;
  };
  type ImgRow = {
    large_url: string;
    thumbnail_url: string | null;
    is_cover: boolean | null;
    order_index: number | null;
  };
  type TagRow = { tag: string };

  const mapped = (products ?? []).map((p) => {
    const infos = (p.product_information as InfoRow[]) ?? [];
    const enInfo = infos.find((i) => i.language === "en") ?? infos[0] ?? null;
    const imgs = (p.product_images as ImgRow[]) ?? [];
    const coverImg =
      imgs.find((i) => i.is_cover) ??
      imgs.sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99))[0] ??
      null;
    const tags = (p.product_tags as TagRow[]).map((t) => t.tag);

    return {
      id: p.id,
      name: enInfo?.name ?? p.type ?? "Untitled",
      description: enInfo?.description ?? null,
      type: p.type,
      price_from: p.price_from != null ? Number(p.price_from) : null,
      price_to: p.price_to != null ? Number(p.price_to) : null,
      pricing_unit: p.pricing_unit,
      duration_hours: p.duration_hours,
      duration_minutes: p.duration_minutes,
      duration_days: p.duration_days,
      capacity_max: p.capacity_max,
      city: p.city,
      available_months: (p.available_months as string[] | null) ?? null,
      cover_image: coverImg
        ? (coverImg.thumbnail_url ?? coverImg.large_url)
        : null,
      tags,
    };
  });

  return NextResponse.json({
    provider: {
      id: provider.id,
      name: provider.business_name ?? provider.official_name,
      description: provider.description,
      city: provider.city,
      logo_url: provider.logo_url,
    },
    products: mapped,
  });
}
