import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

async function getAuthenticatedProvider() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, providerId: null };

  const { data } = await supabase
    .schema(SCHEMA)
    .from("provider_users")
    .select("provider_id")
    .eq("profile_id", user.id)
    .single();

  return { supabase, user, providerId: data?.provider_id ?? null };
}

/** PATCH /api/provider/departures/[id] */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, providerId } = await getAuthenticatedProvider();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!providerId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  // Whitelist updatable fields
  const allowed = [
    "title",
    "departure_date",
    "start_time",
    "duration_minutes",
    "guest_capacity",
    "guests_booked",
    "status",
    "guide_name",
    "notes",
    "resources",
    "product_id",
  ] as const;

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("departures")
    .update(update)
    .eq("id", id)
    .eq("provider_id", providerId) // ownership check
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ departure: data });
}

/** DELETE /api/provider/departures/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, user, providerId } = await getAuthenticatedProvider();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!providerId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const { error } = await supabase
    .schema(SCHEMA)
    .from("departures")
    .delete()
    .eq("id", id)
    .eq("provider_id", providerId); // ownership check

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return new Response(null, { status: 204 });
}
