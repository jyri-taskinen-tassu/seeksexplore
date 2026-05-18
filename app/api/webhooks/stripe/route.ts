/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. On payment_intent.succeeded, updates the
 * matching pending booking to confirmed.
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

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const admin = createAdminClient();

    await admin
      .schema(SCHEMA)
      .from("bookings")
      .update({
        status: "confirmed",
        total_price: pi.amount_received / 100,
      })
      .eq("stripe_payment_intent_id", pi.id);
  }

  return NextResponse.json({ ok: true });
}
