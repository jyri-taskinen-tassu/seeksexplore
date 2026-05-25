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
    .from("customers")
    .select("*")
    .eq("provider_id", provider.id)
    .order("last_booking_date", { ascending: false, nullsFirst: false });

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

  // Get next position for the stage
  const { count } = await supabase
    .schema(SCHEMA)
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .eq("pipeline_stage", body.pipeline_stage || "inquiry");
  const nextPosition = count ?? 0;

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("customers")
    .insert({
      provider_id: provider.id,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone ?? null,
      country: body.country ?? null,
      tags: body.tags ?? [],
      pipeline_stage: body.pipeline_stage || "inquiry",
      pipeline_product_name: body.pipeline_product_name || null,
      pipeline_estimated_value: body.pipeline_estimated_value ?? 0,
      pipeline_guests: body.pipeline_guests ?? 1,
      pipeline_preferred_date: body.pipeline_preferred_date ?? null,
      pipeline_notes: body.pipeline_notes ?? null,
      pipeline_position: nextPosition,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
