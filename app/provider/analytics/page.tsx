import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import AnalyticsClient from "./AnalyticsClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProviderAnalyticsPage() {
  const provider = await getProviderForUser();
  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-50)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--green-900)]">Access Denied</h1>
          <p className="mt-2 text-[var(--ink-sub)]">Please log in as a provider to access analytics.</p>
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

  // 1. Fetch Revenue Data (last 365 days)
  const { data: revenueData } = await supabase
    .schema(SCHEMA)
    .from("revenue_by_date")
    .select("*")
    .eq("provider_id", providerId)
    .order("date", { ascending: true });

  // 2. Fetch Product Performance
  const { data: productPerformance } = await supabase
    .schema(SCHEMA)
    .from("product_performance_analytics")
    .select("*")
    .eq("provider_id", providerId)
    .order("revenue", { ascending: false });

  // 3. Fetch Customer Summary
  const { data: customerSummary } = await supabase
    .schema(SCHEMA)
    .from("customer_analytics_summary")
    .select("*")
    .eq("provider_id", providerId)
    .single();

  // 4. Fetch Booking Trends
  const { data: bookingTrends } = await supabase
    .schema(SCHEMA)
    .from("booking_trends_daily")
    .select("*")
    .eq("provider_id", providerId)
    .order("date", { ascending: true });

  // 5. Fetch Resource Utilization (for today as a snapshot)
  const today = new Date().toISOString().split("T")[0];
  const { data: resourceUtilization } = await supabase
    .schema(SCHEMA)
    .rpc("get_resource_availability", {
      p_date: today,
      p_provider_id: providerId,
    });

  return (
    <AnalyticsClient 
      providerName={(provider as { official_name?: string })?.official_name || "Provider Analytics"}
      revenueData={revenueData || []}
      productPerformance={productPerformance || []}
      customerSummary={customerSummary || { total_customers: 0, returning_customers: 0, new_customers: 0, avg_bookings_per_customer: 0 }}
      bookingTrends={bookingTrends || []}
      resourceUtilization={resourceUtilization || []}
    />
  );
}
