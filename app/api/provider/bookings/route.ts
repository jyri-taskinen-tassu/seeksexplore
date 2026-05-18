import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  let query = supabase
    .schema(SCHEMA)
    .from("bookings")
    .select("*")
    .eq("provider_id", (provider as { id: string }).id)
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (startDate) query = query.gte("booking_date", startDate);
  if (endDate) query = query.lte("booking_date", endDate);

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookings: data ?? [] });
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    customer_name,
    customer_email,
    customer_phone,
    product_id,
    product_name,
    booking_date,
    booking_time,
    guests,
    notes,
    total_price,
    currency,
  } = body;

  if (
    !customer_name ||
    !customer_email ||
    !product_name ||
    !booking_date ||
    !booking_time
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .insert({
      provider_id: (provider as { id: string }).id,
      customer_name,
      customer_email,
      customer_phone: customer_phone ?? null,
      product_id: product_id ?? null,
      product_name,
      booking_date,
      booking_time,
      guests: guests ?? 1,
      status: "confirmed",
      total_price: total_price ?? 0,
      currency: currency ?? "EUR",
      notes: notes ?? null,
    })
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ booking: data }, { status: 201 });
}
