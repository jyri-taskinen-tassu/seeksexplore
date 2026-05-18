import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

/** GET /api/book/[slug]/availability?product_id=X&from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!productId || !from || !to) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: provider } = await admin
    .schema(SCHEMA)
    .from("providers")
    .select("id")
    .eq("provider_slug", slug)
    .single();

  if (!provider)
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const { data: product } = await admin
    .schema(SCHEMA)
    .from("products")
    .select("id, capacity_max, available_months")
    .eq("id", productId)
    .eq("provider_id", provider.id)
    .single();

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { data: bookings } = await admin
    .schema(SCHEMA)
    .from("bookings")
    .select("booking_date, booking_time, guests")
    .eq("product_id", productId)
    .eq("status", "confirmed")
    .gte("booking_date", from)
    .lte("booking_date", to);

  const booked: Record<string, number> = {};
  for (const b of bookings ?? []) {
    const key = `${b.booking_date}|${b.booking_time}`;
    booked[key] = (booked[key] ?? 0) + (b.guests as number);
  }

  const availableMonths = (product.available_months as string[] | null) ?? null;
  const capacityMax = (product.capacity_max as number | null) ?? 12;

  const days: Array<{
    date: string;
    inSeason: boolean;
    slots: Array<{ time: string; available: boolean; spotsLeft: number }>;
  }> = [];

  const fromDate = new Date(from + "T00:00:00");
  const toDate = new Date(to + "T00:00:00");

  for (let d = new Date(fromDate); d <= toDate; d = addDays(d, 1)) {
    const monthName = MONTH_NAMES[d.getMonth()];
    const dateStr = formatISO(d);
    const inSeason =
      !availableMonths ||
      availableMonths.length === 0 ||
      availableMonths.includes(monthName);

    const slots = TIME_SLOTS.map((time) => {
      const key = `${dateStr}|${time}`;
      const guestsBooked = booked[key] ?? 0;
      const spotsLeft = inSeason ? Math.max(0, capacityMax - guestsBooked) : 0;
      return { time, available: inSeason && spotsLeft > 0, spotsLeft };
    });

    days.push({ date: dateStr, inSeason, slots });
  }

  // Find next available date when this week has no in-season days
  let nextAvailableDate: string | null = null;
  if (days.every((d) => !d.inSeason)) {
    const today = new Date();
    for (let i = 1; i <= 400; i++) {
      const futureDate = addDays(today, i);
      const monthName = MONTH_NAMES[futureDate.getMonth()];
      if (!availableMonths || availableMonths.includes(monthName)) {
        nextAvailableDate = formatISO(futureDate);
        break;
      }
    }
  }

  return NextResponse.json({ days, nextAvailableDate });
}
