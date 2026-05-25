import Link from "next/link";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderDashboardPage() {
  const provider = await getProviderForUser();
  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-50)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--green-900)]">Access Denied</h1>
          <p className="mt-2 text-[var(--ink-sub)]">Please log in as a provider to access the dashboard.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--green-900)]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const providerId = (provider as { id: string }).id;
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch Today's Bookings
  const { data: bookings } = await supabase
    .schema(SCHEMA)
    .from("bookings")
    .select("*")
    .eq("provider_id", providerId)
    .eq("booking_date", today);

  // 2. Fetch Resource Availability
  const { data: resourceAvailability } = await supabase
    .schema(SCHEMA)
    .rpc("get_resource_availability", {
      p_date: today,
      p_provider_id: providerId,
    });

  // 3. Fetch Products for capacity and tags
  const { data: products } = await supabase
    .schema(SCHEMA)
    .from("products")
    .select("id, capacity_max, resources, product_tags(tag)")
    .eq("provider_id", providerId);

  return (
    <DashboardClient
      provider={provider as { id: string; official_name: string; provider_slug: string }}
      initialBookings={bookings || []}
      initialResources={resourceAvailability || []}
      products={(products as unknown as { id: string; capacity_max: number | null; product_tags: { tag: string }[] }[]) || []}
    />
  );
}

