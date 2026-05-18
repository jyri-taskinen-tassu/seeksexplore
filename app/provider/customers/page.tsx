import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { redirect } from "next/navigation";
import CustomersClient, {
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

  const [{ data: customersData }, { data: opportunitiesData }] =
    await Promise.all([
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
    ]);

  return (
    <CustomersClient
      initialCustomers={(customersData ?? []) as Customer[]}
      initialOpportunities={(opportunitiesData ?? []) as SalesOpportunity[]}
    />
  );
}
