import { getProviderForUser } from "@/lib/supabase/getProviderData";
import Link from "next/link";
import IntegrateClient from "./IntegrateClient";

export default async function IntegratePage() {
  const provider = await getProviderForUser();

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--cream-50)]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--green-900)]">Access Denied</h1>
          <p className="mt-2 text-[var(--ink-sub)]">Please log in as a provider to access this page.</p>
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

  return (
    <IntegrateClient 
      providerName={provider.official_name || "Your Company"} 
      providerSlug={provider.provider_slug || ""} 
    />
  );
}
