import { createClient } from "@/lib/supabase/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function getProviderForUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .schema(SCHEMA)
    .from("provider_users")
    .select("provider_id, providers(*)")
    .eq("profile_id", user.id)
    .single();

  return data?.providers ?? null;
}
