import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { redirect } from "next/navigation";
import AvailabilityClient, { type DbBooking } from "./AvailabilityClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/provider/login");

  const provider = await getProviderForUser();
  if (!provider) redirect("/provider/login");

  const { data: bookings } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .select("*, products!product_id(capacity_max)")
    .eq("provider_id", (provider as { id: string }).id)
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  const { data: products } = await supabase
    .schema(SCHEMA)
    .from("products")
    .select("id, product_information!product_id(name, language)")
    .eq("provider_id", (provider as { id: string }).id);

  // Flatten product names (en preferred)
  type RawProduct = {
    id: string;
    product_information: { name: string; language: string }[];
  };
  const productNames: Record<string, string> = {};
  ((products ?? []) as RawProduct[]).forEach((p) => {
    const en = p.product_information?.find((i) => i.language === "en");
    const first = p.product_information?.[0];
    productNames[p.id] = en?.name ?? first?.name ?? "Unknown product";
  });

  // Flatten product capacity from join
  type RawBooking = {
    products: { capacity_max: number | null } | null;
    [key: string]: unknown;
  };
  const normalized: DbBooking[] = ((bookings ?? []) as RawBooking[]).map(
    (b) => ({
      ...(b as Omit<DbBooking, "product_capacity">),
      product_capacity: b.products?.capacity_max ?? null,
    }),
  );

  return (
    <AvailabilityClient
      initialBookings={normalized}
      productOptions={Object.entries(productNames).map(([id, name]) => ({
        id,
        name,
      }))}
    />
  );
}
