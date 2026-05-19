import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo",
  },
});

export type TagSuggestionGroup = {
  category: string;
  tags: {
    id: string;
    tag: string;
    category: string;
    usage_count: number;
  }[];
};

/**
 * Fetch tag suggestions grouped by category from the RPC.
 * Returns empty array on error or when query is blank.
 */
export async function searchCustomerTags(
  providerId: string,
  query: string,
): Promise<TagSuggestionGroup[]> {
  const { data, error } = await supabase.rpc("search_customer_tags", {
    p_provider_id: providerId,
    p_query: query,
  });

  if (error) {
    console.error("[searchCustomerTags]", error.message);
    return [];
  }

  return (data ?? []).map((row: { category: string; tags: string }) => ({
    category: row.category,
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
  }));
}

/**
 * Create a new tag in the catalog (or increment usage if it exists).
 */
export async function upsertCustomerTag(
  providerId: string,
  tag: string,
  category: string = "General",
): Promise<void> {
  const { error } = await supabase.rpc("upsert_customer_tag", {
    p_provider_id: providerId,
    p_tag: tag,
    p_category: category,
  });

  if (error) {
    console.error("[upsertCustomerTag]", error.message);
  }
}
