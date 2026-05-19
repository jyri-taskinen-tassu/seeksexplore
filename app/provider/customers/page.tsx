import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { redirect } from "next/navigation";
import CustomersClient, {
  type Booking,
  type Customer,
  type SalesOpportunity,
} from "./CustomersClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderCustomersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/provider/login");

  const provider = await getProviderForUser();
  if (!provider) redirect("/provider/login");

  const [
    { data: customersData },
    { data: opportunitiesData },
    { data: bookingsData },
  ] = await Promise.all([
    supabase
      .schema(SCHEMA)
      .from("customers")
      .select("*")
      .eq("provider_id", provider.id)
      .order("last_booking_date", { ascending: false, nullsFirst: false }),
    supabase
      .schema(SCHEMA)
      .from("sales_opportunities")
      .select("*")
      .eq("provider_id", provider.id)
      .order("created_at", { ascending: false }),
    supabase
      .schema(SCHEMA)
      .from("bookings")
      .select(
        "id, customer_email, customer_name, product_name, booking_date, booking_time, guests, status, total_price, currency, notes",
      )
      .eq("provider_id", provider.id)
      .order("booking_date", { ascending: false }),
  ]);

  // Group bookings by customer_email for O(1) lookup in the client
  const bookingsByEmail: Record<string, Booking[]> = {};
  for (const booking of (bookingsData ?? []) as Booking[]) {
    const key = booking.customer_email.toLowerCase();
    if (!bookingsByEmail[key]) bookingsByEmail[key] = [];
    bookingsByEmail[key].push(booking);
  }

  return (
    <CustomersClient
      initialCustomers={(customersData ?? []) as Customer[]}
      initialOpportunities={(opportunitiesData ?? []) as SalesOpportunity[]}
      initialBookingsByEmail={bookingsByEmail}
    />
  );
}
