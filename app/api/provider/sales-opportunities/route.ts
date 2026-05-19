import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("sales_opportunities")
    .select("*")
    .eq("provider_id", provider.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

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

  const { count } = await supabase
    .schema(SCHEMA)
    .from("sales_opportunities")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .eq("stage", "inquiry");
  const nextPosition = count ?? 0;

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("sales_opportunities")
    .insert({
      provider_id: provider.id,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      product_name: body.productName,
      stage: "inquiry",
      estimated_value: body.estimatedValue ?? 0,
      currency: "EUR",
      guests: body.guests ?? 1,
      preferred_date: body.preferredDate ?? null,
      notes: body.notes ?? null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
