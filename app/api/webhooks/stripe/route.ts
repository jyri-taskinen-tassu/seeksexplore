/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. On checkout.session.completed, creates
 * a confirmed booking in the database.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   (from `stripe listen` or Stripe dashboard)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature invalid" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;
    if (!meta) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

    await admin
      .schema(SCHEMA)
      .from("bookings")
      .insert({
        provider_id: meta.provider_id,
        product_id: meta.product_id,
        product_name: meta.product_name,
        customer_name: meta.customer_name,
        customer_email: meta.customer_email,
        customer_phone: meta.customer_phone || null,
        booking_date: meta.slot_date,
        booking_time: meta.slot_time,
        guests: parseInt(meta.guests, 10),
        status: "confirmed",
        total_price: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "eur").toUpperCase(),
        notes: meta.notes || null,
      });
  }

  return NextResponse.json({ ok: true });
}
