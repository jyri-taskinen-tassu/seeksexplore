import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

async function getAuthenticatedProvider() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, provider: null };

  const { data } = await supabase
    .schema(SCHEMA)
    .from("provider_users")
    .select("provider_id")
    .eq("profile_id", user.id)
    .single();

  return { supabase, user, providerId: data?.provider_id ?? null };
}

/** GET /api/provider/departures?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(request: Request) {
  const { supabase, user, providerId } = await getAuthenticatedProvider();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!providerId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = supabase
    .schema(SCHEMA)
    .from("departures")
    .select("*")
    .eq("provider_id", providerId)
    .order("departure_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (from) query = query.gte("departure_date", from);
  if (to) query = query.lte("departure_date", to);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ departures: data });
}

/** POST /api/provider/departures */
export async function POST(request: Request) {
  const { supabase, user, providerId } = await getAuthenticatedProvider();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!providerId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    title,
    departure_date,
    start_time,
    duration_minutes,
    guest_capacity,
    guide_name,
    notes,
    resources,
    product_id,
  } = body;

  if (!title || !departure_date || !start_time) {
    return NextResponse.json(
      { error: "title, departure_date and start_time are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("departures")
    .insert({
      provider_id: providerId,
      product_id: product_id ?? null,
      title,
      departure_date,
      start_time,
      duration_minutes: duration_minutes ?? null,
      guest_capacity: guest_capacity ?? null,
      guests_booked: 0,
      status: "scheduled",
      guide_name: guide_name ?? null,
      notes: notes ?? null,
      resources: resources ?? {},
    })
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ departure: data }, { status: 201 });
}
