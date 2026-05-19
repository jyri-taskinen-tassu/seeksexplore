import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verify the booking belongs to this provider
  const { data: existing } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .select("id")
    .eq("id", id)
    .eq("provider_id", (provider as unknown as { id: string }).id)
    .single();

  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { status, notes, cancelled_reason } = body;

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;
  if (cancelled_reason !== undefined)
    updates.cancelled_reason = cancelled_reason;

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ booking: data });
}
