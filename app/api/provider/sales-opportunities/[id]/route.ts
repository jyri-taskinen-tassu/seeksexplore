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
  if (body.stage !== undefined) updates.stage = body.stage;
  if (body.notes !== undefined) updates.notes = body.notes;

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("sales_opportunities")
    .update(updates)
    .eq("id", id)
    .eq("provider_id", provider.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
