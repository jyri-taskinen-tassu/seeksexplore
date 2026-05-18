import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { redirect } from "next/navigation";
import AvailabilityClient, { type DbDeparture } from "./AvailabilityClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/provider/login");

  const provider = await getProviderForUser();
  if (!provider) redirect("/provider/login");

  const { data } = await supabase
    .schema(SCHEMA)
    .from("departures")
    .select("*")
    .eq("provider_id", provider.id)
    .order("departure_date", { ascending: true })
    .order("start_time", { ascending: true });

  return (
    <AvailabilityClient initialDepartures={(data ?? []) as DbDeparture[]} />
  );
}
