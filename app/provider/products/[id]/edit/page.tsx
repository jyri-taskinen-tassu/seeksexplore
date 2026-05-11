import { createClient } from "@/lib/supabase/server";
import { getProviderForUser } from "@/lib/supabase/getProviderData";
import { notFound } from "next/navigation";
import ProductEditForm from "./ProductEditForm";

const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

export default async function ProductEditPage({
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
    .select(`*, product_information(*), product_images(*), product_tags(*), product_target_groups(*), product_availability(*)`)
    .eq("id", id)
    .eq("provider_id", (provider as { id: string }).id)
    .single();

  if (!product) notFound();

  return <ProductEditForm product={product} />;
}
