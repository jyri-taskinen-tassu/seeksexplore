import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const BF_URL = process.env.BF_API_URL!;
const BF_KEY = process.env.BF_API_KEY!;
const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .schema(SCHEMA)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = new URL(request.url).searchParams.get("q") ?? "";

  const gql = {
    query: `query SearchCompanies($name: String!) {
      company(
        where: { officialName: { _ilike: $name } }
        limit: 20
        order_by: { officialName: asc }
      ) {
        id
        businessEntityId
        officialName
        businessName
        description
        websiteUrl
        webshopUrl
        logoUrl
        logoThumbnailUrl
        contactDetails(limit: 1) { email phone }
        postalAddresses(limit: 1) { streetName city postalCode }
      }
    }`,
    variables: { name: `%${q}%` },
  };

  const res = await fetch(`${BF_URL}?subscription-key=${BF_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify(gql),
  });

  const data = await res.json();
  const raw = data?.data?.company ?? [];

  const companies = raw.map((c: Record<string, unknown>) => {
    const contact = (c.contactDetails as Record<string, string>[])?.[0] ?? {};
    const address = (c.postalAddresses as Record<string, string>[])?.[0] ?? {};
    return {
      id: c.id,
      businessEntityId: c.businessEntityId ?? null,
      officialName: c.officialName,
      businessName: c.businessName ?? null,
      description: c.description ?? null,
      websiteUrl: c.websiteUrl ?? null,
      webshopUrl: c.webshopUrl ?? null,
      logoUrl: c.logoUrl ?? null,
      logoThumbnailUrl: c.logoThumbnailUrl ?? null,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      streetName: address.streetName ?? null,
      city: address.city ?? null,
      postalCode: address.postalCode ?? null,
      productCount: 0,
    };
  });

  return NextResponse.json({ companies });
}
