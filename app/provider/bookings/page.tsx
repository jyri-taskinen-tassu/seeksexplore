import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import BookingsClient, { type Booking } from "./BookingsClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderBookingsPage() {
  const supabase = await createClient();
  const provider = await getProviderForUser();

  let bookings: Booking[] = [];

  if (provider) {
    const { data } = await supabase
      .schema(SCHEMA)
      .from("bookings")
      .select("*")
      .eq("provider_id", (provider as unknown as { id: string }).id)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    bookings = (data ?? []) as Booking[];
  }

  return <BookingsClient initialBookings={bookings} />;
}
