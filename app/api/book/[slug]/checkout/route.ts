/**
 * POST /api/book/[slug]/checkout
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY      — Stripe secret key (sk_test_... or sk_live_...)
 *   STRIPE_WEBHOOK_SECRET  — for webhook signature verification
 *
 * If price is null / 0: creates a pending booking directly (no Stripe).
 * If price > 0: creates a Stripe Checkout session and returns { url }.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

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

  // Verify product belongs to provider
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

  // No price → create pending booking directly (no payment)
  if (totalPrice === 0) {
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
        total_price: 0,
        currency: "EUR",
        notes: notes ?? null,
      })
      .select("id")
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ booking_id: booking.id, reference });
  }

  // Price > 0 → Stripe Checkout
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = getBaseUrl(request);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customer_email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: product_name,
            description: `${slot_date} at ${slot_time} · ${guests} ${guests === 1 ? "person" : "people"}`,
          },
          unit_amount: Math.round(price_per_person! * 100),
        },
        quantity: guests,
      },
    ],
    metadata: {
      slug,
      provider_id: provider.id,
      provider_name: provider.business_name ?? provider.official_name,
      product_id,
      product_name,
      slot_date,
      slot_time,
      guests: String(guests),
      customer_name: customerName,
      customer_email,
      customer_phone: customer_phone ?? "",
      notes: notes ?? "",
    },
    success_url: `${baseUrl}/book/${slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/book/${slug}`,
  });

  return NextResponse.json({ url: session.url });
}
