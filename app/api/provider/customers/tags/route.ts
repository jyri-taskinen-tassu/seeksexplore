import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

/**
 * GET /api/provider/customers/tags?q=<search>
 * Returns grouped tag suggestions from Supabase RPC.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const { data, error } = await supabase
    .schema(SCHEMA)
    .rpc("search_customer_tags", {
      p_provider_id: provider.id,
      p_query: query,
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // data is an array of { category: string, tags: TagItem[] }
  return NextResponse.json(data ?? []);
}

/**
 * POST /api/provider/customers/tags
 * Body: { tag: string, category?: string }
 * Upserts a tag into the provider's customer_tags catalog.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const body = await request.json();
  const tag = (body.tag ?? "").trim();
  const category = (body.category ?? "Custom").trim();

  if (!tag)
    return NextResponse.json({ error: "tag is required" }, { status: 400 });

  const { data, error } = await supabase
    .schema(SCHEMA)
    .rpc("upsert_customer_tag", {
      p_provider_id: provider.id,
      p_tag: tag,
      p_category: category,
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
