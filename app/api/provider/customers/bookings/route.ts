import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export type SupabaseBooking = {
  id: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number;
  currency: string;
  notes: string | null;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "email query param required" },
      { status: 400 },
    );
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const encoded = encodeURIComponent(email);
  const url = `${SUPABASE_URL}/rest/v1/bookings?select=id,customer_name,customer_email,product_name,booking_date,booking_time,guests,status,total_price,currency,notes&customer_email=eq.${encoded}&order=booking_date.desc`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Accept-Profile": SCHEMA,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Supabase error: ${text}` },
      { status: res.status },
    );
  }

  const data: SupabaseBooking[] = await res.json();
  return NextResponse.json(data);
}
