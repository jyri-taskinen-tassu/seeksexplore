import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { NextResponse } from "next/server";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

/** GET /api/provider/availability/resources?date=YYYY-MM-DD */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const provider = await getProviderForUser();
  if (!provider)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date)
    return NextResponse.json({ error: "date is required" }, { status: 400 });

  const { data, error } = await supabase
    .schema(SCHEMA)
    .rpc("get_resource_availability", {
      p_date: date,
      p_provider_id: (provider as unknown as { id: string }).id,
    });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ resources: data ?? [] });
}
