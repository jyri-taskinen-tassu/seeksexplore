/**
 * POST /api/book/[slug]/checkout
 *
 * Two modes:
 *   price = 0 / null  → creates pending booking directly, returns { booking_id, reference }
 *   price > 0         → expects paymentIntentId, creates pending booking with PI ID,
 *                        returns { booking_id, reference } — client then calls stripe.confirmPayment()
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY      — Stripe secret key (sk_test_... or sk_live_...)
 *   STRIPE_WEBHOOK_SECRET  — for webhook signature verification
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

function generateRef(): string {
  return "SE-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: provider } = await admin
    .schema(SCHEMA)
    .from("providers")
    .select("id, business_name, official_name")
    .eq("provider_slug", slug)
    .single();

  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const body = await request.json();
  const {
    product_id,
    product_name,
    slot_date,
    slot_time,
    guests,
    price_per_person,
    customer_first_name,
    customer_last_name,
    customer_email,
    customer_phone,
    notes,
    payment_intent_id,
  } = body as {
    product_id: string;
    product_name: string;
    slot_date: string;
    slot_time: string;
    guests: number;
    price_per_person: number | null;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    customer_phone?: string;
    notes?: string;
    payment_intent_id?: string;
  };

  if (
    !product_id ||
    !product_name ||
    !slot_date ||
    !slot_time ||
    !guests ||
    !customer_first_name ||
    !customer_last_name ||
    !customer_email
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const { data: product } = await admin
    .schema(SCHEMA)
    .from("products")
    .select("id")
    .eq("id", product_id)
    .eq("provider_id", provider.id)
    .single();

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const customerName = `${customer_first_name} ${customer_last_name}`;
  const totalPrice =
    price_per_person != null && price_per_person > 0
      ? price_per_person * guests
      : 0;

  const reference = generateRef();

  const { data: booking, error } = await admin
    .schema(SCHEMA)
    .from("bookings")
    .insert({
      provider_id: provider.id,
      product_id,
      product_name,
      customer_name: customerName,
      customer_email,
      customer_phone: customer_phone ?? null,
      booking_date: slot_date,
      booking_time: slot_time,
      guests,
      status: "pending",
      total_price: totalPrice,
      currency: "EUR",
      notes: notes ?? null,
      stripe_payment_intent_id: payment_intent_id ?? null,
    })
    .select("id")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Upsert customer record for provider CRM
  const { data: existing } = await admin
    .schema(SCHEMA)
    .from("customers")
    .select("id, total_bookings, total_spent")
    .eq("provider_id", provider.id)
    .eq("email", customer_email)
    .single();

  if (existing) {
    await admin
      .schema(SCHEMA)
      .from("customers")
      .update({
        first_name: customer_first_name,
        last_name: customer_last_name,
        phone: customer_phone ?? null,
        total_bookings: existing.total_bookings + 1,
        total_spent: Number(existing.total_spent) + totalPrice,
        last_booking_date: slot_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await admin
      .schema(SCHEMA)
      .from("customers")
      .insert({
        provider_id: provider.id,
        first_name: customer_first_name,
        last_name: customer_last_name,
        email: customer_email,
        phone: customer_phone ?? null,
        tags: [],
        total_bookings: 1,
        total_spent: totalPrice,
        currency: "EUR",
        first_booking_date: slot_date,
        last_booking_date: slot_date,
      });
  }

  return NextResponse.json({ booking_id: booking.id, reference });
}
