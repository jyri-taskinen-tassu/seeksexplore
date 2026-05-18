import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetailClient from "./ProductDetailClient";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = await getProviderForUser();
  if (!provider) notFound();

  const supabase = await createClient();
  const { data: product } = await supabase
    .schema(SCHEMA)
    .from("products")
    .select(
      `
      *,
      product_information(*),
      product_images(*),
      product_tags(*),
      product_target_groups(*),
      product_certificates(*),
      product_availability(*)
    `,
    )
    .eq("id", id)
    .eq("provider_id", (provider as unknown as { id: string }).id)
    .single();

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
