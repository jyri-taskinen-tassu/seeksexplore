import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

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
  const items: { id: string; position: number; stage?: string }[] = body.items;
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "items required" }, { status: 400 });

  const errors: string[] = [];
  for (const item of items) {
    const updates: Record<string, unknown> = { position: item.position };
    if (item.stage !== undefined) updates.stage = item.stage;

    const { error } = await supabase
      .schema(SCHEMA)
      .from("sales_opportunities")
      .update(updates)
      .eq("id", item.id)
      .eq("provider_id", provider.id);

    if (error) errors.push(error.message);
  }

  if (errors.length > 0)
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });

  return NextResponse.json({ ok: true });
}
