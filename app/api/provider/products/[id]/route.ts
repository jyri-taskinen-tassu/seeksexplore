import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user owns this product via provider_users
  const { data: link } = await supabase
    .schema(SCHEMA)
    .from("provider_users")
    .select("provider_id")
    .eq("profile_id", user.id)
    .single();

  if (!link) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: prod } = await supabase
    .schema(SCHEMA)
    .from("products")
    .select("id")
    .eq("id", id)
    .eq("provider_id", link.provider_id)
    .single();

  if (!prod) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { product_information, tags, ...productFields } = body;

  // Update products table
  const { error: productErr } = await supabase
    .schema(SCHEMA)
    .from("products")
    .update(productFields)
    .eq("id", id);

  if (productErr) return NextResponse.json({ error: productErr.message }, { status: 500 });

  // Update product_information (upsert per language)
  if (Array.isArray(product_information)) {
    for (const info of product_information) {
      await supabase
        .schema(SCHEMA)
        .from("product_information")
        .upsert({
          product_id: id,
          language: info.language,
          name: info.name ?? null,
          description: info.description ?? null,
          url: info.url ?? null,
          webshop_url: info.webshop_url ?? null,
        }, { onConflict: "product_id,language" });
    }
  }

  // Sync tags: delete all then re-insert
  if (Array.isArray(tags)) {
    await supabase.schema(SCHEMA).from("product_tags").delete().eq("product_id", id);
    if (tags.length > 0) {
      await supabase.schema(SCHEMA).from("product_tags").insert(
        tags.map((tag: string) => ({ product_id: id, tag }))
      );
    }
  }

  return NextResponse.json({ ok: true });
}
