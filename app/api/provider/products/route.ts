import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: link } = await supabase
    .schema(SCHEMA)
    .from("provider_users")
    .select("provider_id")
    .eq("profile_id", user.id)
    .single();

  if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    name,
    description,
    languages,
    type,
    accessible,
    price_from,
    capacity_max,
    duration_hours,
    duration_minutes,
    city,
    street_name,
    available_months,
    tags,
  } = body;

  const { data: product, error: productErr } = await supabase
    .schema(SCHEMA)
    .from("products")
    .insert({
      provider_id: link.provider_id,
      type: type ?? "experience",
      accessible: accessible ?? false,
      price_from: price_from ?? null,
      capacity_max: capacity_max ?? null,
      duration_hours: duration_hours ?? null,
      duration_minutes: duration_minutes ?? null,
      city: city ?? null,
      street_name: street_name ?? null,
      available_months: available_months ?? [],
    })
    .select("id")
    .single();

  if (productErr || !product) {
    return NextResponse.json(
      { error: productErr?.message ?? "Insert failed" },
      { status: 500 },
    );
  }

  if (Array.isArray(languages) && languages.length > 0) {
    await supabase
      .schema(SCHEMA)
      .from("product_information")
      .insert(
        languages.map((lang: string) => ({
          product_id: product.id,
          language: lang.toLowerCase(),
          name: name ?? null,
          description: description ?? null,
        })),
      );
  }

  if (Array.isArray(tags) && tags.length > 0) {
    await supabase
      .schema(SCHEMA)
      .from("product_tags")
      .insert(tags.map((tag: string) => ({ product_id: product.id, tag })));
  }

  return NextResponse.json({ id: product.id });
}
