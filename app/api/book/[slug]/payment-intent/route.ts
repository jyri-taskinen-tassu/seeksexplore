import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const admin = createAdminClient();
  const { data: provider } = await admin
    .schema(SCHEMA)
    .from("providers")
    .select("id, business_name, official_name")
    .eq("provider_slug", slug)
    .single();

  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const { product_id, guests, price_per_person } = (await request.json()) as {
    product_id: string;
    guests: number;
    price_per_person: number;
  };

  if (!product_id || !guests || !price_per_person) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: product } = await admin
    .schema(SCHEMA)
    .from("products")
    .select("id, name")
    .eq("id", product_id)
    .eq("provider_id", provider.id)
    .single();

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const amountCents = Math.round(price_per_person * guests * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "eur",
    automatic_payment_methods: { enabled: true },
    metadata: {
      slug,
      provider_id: provider.id,
      provider_name: provider.business_name ?? provider.official_name,
      product_id,
      product_name: product.name,
      guests: String(guests),
      price_per_person: String(price_per_person),
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}
