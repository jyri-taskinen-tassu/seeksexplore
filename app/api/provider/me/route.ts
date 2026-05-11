import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .schema(SCHEMA)
    .from("provider_users")
    .select("providers(*)")
    .eq("profile_id", user.id)
    .single();

  const provider = data?.providers ?? null;
  return NextResponse.json({ provider });
}
