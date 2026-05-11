import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const BF_URL = process.env.BF_API_URL!;
const BF_KEY = process.env.BF_API_KEY!;
const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .schema(SCHEMA)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { company, providerEmail } = await request.json();
  if (!company?.id || !providerEmail) {
    return NextResponse.json(
      { message: "Missing company or email" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // 1. Fetch full company data + products from BF
  const gql = {
    query: `query ImportCompany($id: uuid!) {
      companyByPk(id: $id) {
        id
        businessEntity { id }
        officialName
        businessName
        description
        websiteUrl
        webshopUrl
        logoUrl
        logoThumbnailUrl
        socialMediaLinks { linkType url }
        contactDetails(limit: 1) { email phone }
        postalAddresses(limit: 1) {
          streetName city postalCode
          location
        }
        products {
          id
          type
          accessible
          externalSource
          urlPrimary
          webshopUrlPrimary
          productInformations { language name description url webshopUrl }
          productPricings { fromPrice toPrice pricingUnit }
          productDuration { days hours minutes }
          productCapacities { min max }
          productImages { largeUrl thumbnailUrl originalUrl altText copyright coverPhoto orientation orderIndex }
          productTags { tag }
          productTargetGroups { targetGroupId }
          productCertificates { certificate certificateDetails { name description logoUrl websiteUrl } }
          productAvailabilities { startDate endDate startTime endTime doorsOpenAt nroOfTickets }
          productAvailableMonths { month }
        }
      }
    }`,
    variables: { id: company.id },
  };

  let bfData;

  try {
    const bfRes = await fetch(`${BF_URL}?subscription-key=${BF_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify(gql),
    });
    const bfText = await bfRes.text();
    bfData = JSON.parse(bfText);
  } catch (err) {
    console.error("Error fetching from BF:", err);
  }
  const c = bfData?.data?.companyByPk;
  if (!c)
    return NextResponse.json(
      { message: "Company not found in BF" },
      { status: 404 },
    );

  // 2. Upsert provider
  const contact = c.contactDetails?.[0] ?? {};
  const address = c.postalAddresses?.[0] ?? {};
  const socialLinks = Object.fromEntries(
    (c.socialMediaLinks ?? []).map((s: { linkType: string; url: string }) => [
      s.linkType,
      s.url,
    ]),
  );

  // Parse point geometry from BF (format: "(lng,lat)")
  function parsePoint(pt: string | null): {
    lat: number | null;
    lng: number | null;
  } {
    if (!pt) return { lat: null, lng: null };
    const m = pt.match(/\(([^,]+),([^)]+)\)/);
    return m
      ? { lng: parseFloat(m[1]), lat: parseFloat(m[2]) }
      : { lat: null, lng: null };
  }
  const { lat, lng } = parsePoint(address.location);

  const { data: providerRow, error: providerErr } = await admin
    .schema(SCHEMA)
    .from("providers")
    .upsert(
      {
        bf_company_id: c.id,
        bf_business_entity_id: c.businessEntity?.id ?? null,
        official_name: c.officialName,
        business_name: c.businessName ?? null,
        description: c.description ?? null,
        website_url: c.websiteUrl ?? null,
        webshop_url: c.webshopUrl ?? null,
        logo_url: c.logoUrl ?? null,
        logo_thumbnail_url: c.logoThumbnailUrl ?? null,
        email: contact.email ?? null,
        phone: contact.phone ?? null,
        street_name: address.streetName ?? null,
        city: address.city ?? null,
        postal_code: address.postalCode ?? null,
        location_lat: lat,
        location_lng: lng,
        social_links: socialLinks,
      },
      { onConflict: "bf_company_id" },
    )
    .select("id")
    .single();

  if (providerErr)
    return NextResponse.json({ message: providerErr.message }, { status: 500 });
  const providerId = providerRow.id;

  // 3. Import products
  for (const p of c.products ?? []) {
    const pricing = p.productPricings?.[0] ?? {};
    const duration = p.productDuration?.[0] ?? {};
    const capacity = p.productCapacities?.[0] ?? {};
    // const pAddr = p.postalAddresses?.[0] ?? {};
    // const { lat: pLat, lng: pLng } = parsePoint(pAddr.location);
    const months = (p.productAvailableMonths ?? []).map(
      (m: { month: string }) => m.month,
    );

    const { data: productRow, error: productErr } = await admin
      .schema(SCHEMA)
      .from("products")
      .upsert(
        {
          provider_id: providerId,
          bf_product_id: p.id,
          type: p.type ?? null,
          accessible: p.accessible ?? null,
          external_source: p.externalSource ?? null,
          url_primary: p.urlPrimary ?? null,
          webshop_url_primary: p.webshopUrlPrimary ?? null,
          price_from: pricing.fromPrice ?? null,
          price_to: pricing.toPrice ?? null,
          pricing_unit: pricing.pricingUnit ?? null,
          duration_days: duration.days ?? null,
          duration_hours: duration.hours ?? null,
          duration_minutes: duration.minutes ?? null,
          capacity_min: capacity.min ?? null,
          capacity_max: capacity.max ?? null,
          // street_name: pAddr.streetName ?? null,
          // city: pAddr.city ?? null,
          // postal_code: pAddr.postalCode ?? null,
          // location_lat: pLat,
          // location_lng: pLng,
          available_months: months,
        },
        { onConflict: "bf_product_id" },
      )
      .select("id")
      .single();

    if (productErr || !productRow) continue;
    const productId = productRow.id;

    // Product sub-tables
    await Promise.all([
      // Information (multilingual)
      p.productInformations?.length &&
        admin
          .schema(SCHEMA)
          .from("product_information")
          .upsert(
            p.productInformations.map((i: Record<string, string>) => ({
              product_id: productId,
              language: i.language,
              name: i.name ?? null,
              description: i.description ?? null,
              url: i.url ?? null,
              webshop_url: i.webshopUrl ?? null,
            })),
            { onConflict: "product_id,language" },
          ),

      // Images
      p.productImages?.length &&
        admin
          .schema(SCHEMA)
          .from("product_images")
          .upsert(
            p.productImages.map((img: Record<string, unknown>) => ({
              product_id: productId,
              large_url: img.largeUrl,
              thumbnail_url: img.thumbnailUrl ?? null,
              original_url: img.originalUrl ?? null,
              alt_text: img.altText ?? null,
              copyright: img.copyright ?? null,
              is_cover: img.coverPhoto ?? false,
              orientation: img.orientation ?? null,
              order_index: img.orderIndex ?? null,
            })),
          ),

      // Tags
      p.productTags?.length &&
        admin
          .schema(SCHEMA)
          .from("product_tags")
          .upsert(
            p.productTags.map((t: { tag: string }) => ({
              product_id: productId,
              tag: t.tag,
            })),
            { onConflict: "product_id,tag" },
          ),

      // Target groups
      p.productTargetGroups?.length &&
        admin
          .schema(SCHEMA)
          .from("product_target_groups")
          .upsert(
            p.productTargetGroups.map((tg: { targetGroupId: string }) => ({
              product_id: productId,
              target_group: tg.targetGroupId,
            })),
            { onConflict: "product_id,target_group" },
          ),

      // Certificates
      p.productCertificates?.length &&
        admin
          .schema(SCHEMA)
          .from("product_certificates")
          .insert(
            p.productCertificates.map(
              (pc: {
                certificate: string;
                certificateDetails: {
                  name: string;
                  description: string | null;
                  logoUrl: string | null;
                  websiteUrl: string | null;
                } | null;
              }) => ({
                product_id: productId,
                name: pc.certificateDetails?.name ?? pc.certificate,
                description: pc.certificateDetails?.description ?? null,
                logo_url: pc.certificateDetails?.logoUrl ?? null,
                website_url: pc.certificateDetails?.websiteUrl ?? null,
              }),
            ),
          ),

      // Availability
      p.productAvailabilities?.length &&
        admin
          .schema(SCHEMA)
          .from("product_availability")
          .insert(
            p.productAvailabilities.map(
              (av: Record<string, string | number | null>) => ({
                product_id: productId,
                start_date: av.startDate ?? null,
                end_date: av.endDate ?? null,
                start_time: av.startTime ?? null,
                end_time: av.endTime ?? null,
                doors_open_at: av.doorsOpenAt ?? null,
                nr_of_tickets: av.nroOfTickets ?? null,
              }),
            ),
          ),
    ]);
  }

  // 4. Invite provider user via Supabase Auth
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: inviteData, error: inviteErr } =
    await admin.auth.admin.inviteUserByEmail(providerEmail, {
      redirectTo: `${siteUrl}/auth/callback`,
    });

  if (inviteErr) {
    return NextResponse.json(
      {
        message: `Provider imported but invite failed: ${inviteErr.message}. Manually add credentials.`,
      },
      { status: 207 },
    );
  }

  // 5. Create provider profile linking user → provider
  await admin.rpc(
    "create_provider_profile",
    {
      p_user_id: inviteData.user.id,
      p_email: providerEmail,
      p_provider_id: providerId,
    },
    { get: false },
  );

  return NextResponse.json({
    message: `${c.officialName} imported with ${c.products?.length ?? 0} products. Invite sent to ${providerEmail}.`,
  });
}
