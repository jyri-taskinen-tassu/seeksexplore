import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};
  
  // Map frontend fields to DB pipeline fields
  if (body.pipeline_stage !== undefined) updates.pipeline_stage = body.pipeline_stage;
  if (body.pipeline_position !== undefined) updates.pipeline_position = body.pipeline_position;
  if (body.pipeline_notes !== undefined) updates.pipeline_notes = body.pipeline_notes;
  if (body.pipeline_estimated_value !== undefined) updates.pipeline_estimated_value = body.pipeline_estimated_value;
  if (body.pipeline_guests !== undefined) updates.pipeline_guests = body.pipeline_guests;
  if (body.pipeline_preferred_date !== undefined) updates.pipeline_preferred_date = body.pipeline_preferred_date;
  if (body.pipeline_product_name !== undefined) updates.pipeline_product_name = body.pipeline_product_name;

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("customers")
    .update(updates)
    .eq("id", id)
    .eq("provider_id", provider.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
