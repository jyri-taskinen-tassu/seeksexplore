import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

type DemoUser = {
  email: string;
  role: "admin" | "provider" | "customer";
};

const DEMO_USERS: DemoUser[] = [
  { email: "demo.customer@seeksandexplore.com", role: "customer" },
  { email: "demo.provider@seeksandexplore.com", role: "provider" },
  { email: "demo.admin@seeksandexplore.com", role: "admin" },
];

const DEMO_PROVIDER_NAME = "Demo Provider Ltd";
const ENV_PATH = path.resolve(process.cwd(), ".env.local");

function parseEnvFile(fileContents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of fileContents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (val.startsWith("\"") && val.endsWith("\"")) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

async function main() {
  // Read .env.local explicitly for SUPABASE_SERVICE_ROLE_KEY (required)
  if (!fs.existsSync(ENV_PATH)) {
    console.error(".env.local not found in project root. Place SUPABASE_SERVICE_ROLE_KEY there and retry.");
    process.exit(1);
  }

  const envFile = fs.readFileSync(ENV_PATH, "utf8");
  const env = parseEnvFile(envFile);

  const serviceKey = env["SUPABASE_SERVICE_ROLE_KEY"];
  const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"] ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY not found in .env.local. Aborting.");
    process.exit(1);
  }

  if (!supabaseUrl) {
    console.error("NEXT_PUBLIC_SUPABASE_URL not found in .env.local or process.env. Aborting.");
    process.exit(1);
  }

  // Read separate demo passwords from .env.local as required
  const demoCustomerPassword = env["DEMO_CUSTOMER_PASSWORD"] ?? process.env.DEMO_CUSTOMER_PASSWORD;
  const demoProviderPassword = env["DEMO_PROVIDER_PASSWORD"] ?? process.env.DEMO_PROVIDER_PASSWORD;
  const demoAdminPassword = env["DEMO_ADMIN_PASSWORD"] ?? process.env.DEMO_ADMIN_PASSWORD;

  // We'll require the three passwords to be present for non-dry-run execution.
  const DRY_RUN = process.argv.includes("--dry-run");

  if (!DRY_RUN) {
    if (!demoCustomerPassword || !demoProviderPassword || !demoAdminPassword) {
      console.error(
        "Security: set DEMO_CUSTOMER_PASSWORD, DEMO_PROVIDER_PASSWORD and DEMO_ADMIN_PASSWORD in .env.local before running (or run with --dry-run). Aborting.",
      );
      process.exit(1);
    }
  }

  const SCHEMA = process.env.NEXT_PUBLIC_APP_SCHEMA ?? "seeks_and_explore_demo";

  // Security: ensure the Supabase URL contains the expected project id
  const EXPECTED_PROJECT = "dhviotovdnxbfdbkywid";
  if (!supabaseUrl.includes(EXPECTED_PROJECT)) {
    console.error(
      `NEXT_PUBLIC_SUPABASE_URL does not contain expected project id (${EXPECTED_PROJECT}). Found: ${supabaseUrl}`,
    );
    process.exit(1);
  }

  // Create admin client directly to avoid importing modules that log secrets
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Helper: find profile by email
  async function findProfileByEmail(email: string) {
    const { data, error } = await admin
      .schema(SCHEMA)
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    return data as { id: string } | null;
  }

  // Helper: ensure provider exists (by official_name)
  async function ensureProvider(name: string) {
    const { data: existing } = await admin
      .schema(SCHEMA)
      .from("providers")
      .select("id")
      .eq("official_name", name)
      .maybeSingle();
    if (existing?.id) return existing.id as string;

    if (DRY_RUN) {
      console.log(`[dry-run] Would create provider with official_name='${name}'`);
      return "<dry-run-provider-id>";
    }

    const { data, error } = await admin
      .schema(SCHEMA)
      .from("providers")
      .insert({ official_name: name })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  // Helper: create auth user idempotently via admin API
  async function ensureAuthUser(email: string, role: "admin" | "provider" | "customer") {
    // Try to find existing profile first
    const profile = await findProfileByEmail(email);
    if (profile?.id) return profile.id;

    if (DRY_RUN) {
      console.log(`[dry-run] Would create auth user for ${email} with email_confirm=true`);
      return `<dry-run-user-${role}>`;
    }

    // Create user with role-specific password from .env.local
    const pw = role === "admin" ? demoAdminPassword : role === "provider" ? demoProviderPassword : demoCustomerPassword;
    const { data, error } = await (admin.auth as any).admin.createUser({
      email,
      password: pw,
      email_confirm: true,
    });

    if (error) throw error;

    const userId = data.user.id;

    // Upsert profile to ensure email is present (trigger usually creates profile)
    const { error: upsertErr } = await admin
      .schema(SCHEMA)
      .from("profiles")
      .upsert({ id: userId, email }, { onConflict: "id" });
    if (upsertErr) throw upsertErr;

    return userId;
  }

  // Validate local migrations to ensure expected tables, columns and RPC signatures exist
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) {
    console.error("migrations directory not found:", migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  let mig = "";
  for (const f of files) {
    mig += fs.readFileSync(path.join(migrationsDir, f), "utf8") + "\n";
  }
  // Basic string checks (do not guess other params)
  if (!/CREATE OR REPLACE FUNCTION create_admin\(target_email text\)/m.test(mig)) {
    console.error("create_admin RPC signature not found or differs in migrations. Aborting.");
    process.exit(1);
  }

  if (!/CREATE OR REPLACE FUNCTION create_provider_profile\([\s\S]*?p_user_id\s+uuid[\s\S]*?p_email\s+text[\s\S]*?p_provider_id\s+uuid[\s\S]*?\)/m.test(mig)) {
    console.error("create_provider_profile RPC signature not found or differs in migrations. Aborting.");
    process.exit(1);
  }

  if (!/CREATE TABLE IF NOT EXISTS providers[\s\S]*?official_name[\s\S]*?NOT NULL/m.test(mig)) {
    console.error("providers.official_name NOT NULL not found in migrations. Aborting.");
    process.exit(1);
  }

  if (!/CREATE TABLE\s+customers[\s\S]*?first_name[\s\S]*?NOT NULL[\s\S]*?last_name[\s\S]*?NOT NULL[\s\S]*?email[\s\S]*?NOT NULL/m.test(mig)) {
    console.error("customers required columns (first_name,last_name,email) not found in migrations. Aborting.");
    process.exit(1);
  }

  // If dry-run, do not perform any network/database calls — only validate environment and migrations
  if (DRY_RUN) {
    console.log(`Project id check passed: ${EXPECTED_PROJECT}`);
    console.log("Environment variables found:");
    console.log(` - NEXT_PUBLIC_SUPABASE_URL: ${!!supabaseUrl}`);
    console.log(` - SUPABASE_SERVICE_ROLE_KEY: ${!!serviceKey}`);
    console.log(` - DEMO_CUSTOMER_PASSWORD: ${!!demoCustomerPassword}`);
    console.log(` - DEMO_PROVIDER_PASSWORD: ${!!demoProviderPassword}`);
    console.log(` - DEMO_ADMIN_PASSWORD: ${!!demoAdminPassword}`);
    console.log("");
    console.log("Planned operations (dry-run):");
    console.log(" - Ensure provider row exists with official_name='Demo Provider Ltd'");
    console.log(" - For demo.provider@seeksandexplore.com: create auth user (email_confirm=true), call RPC create_provider_profile(p_user_id, p_email, p_provider_id)");
    console.log(" - For demo.admin@seeksandexplore.com: create auth user (email_confirm=true), call RPC create_admin(target_email)");
    console.log(" - For demo.customer@seeksandexplore.com: create auth user (email_confirm=true) and insert customers row linked to provider");
    console.log("");
    console.log("Validated migrations and RPC signatures.");
    return;
  }

  // Ensure demo provider exists once
  const demoProviderId = await ensureProvider(DEMO_PROVIDER_NAME);

  for (const u of DEMO_USERS) {
    try {
      console.log(`Processing ${u.email} as ${u.role}`);

      const userId = await ensureAuthUser(u.email, u.role);

      if (u.role === "admin") {
        // Promote via RPC
        const { error } = await admin.rpc("create_admin", { target_email: u.email }, { get: false });
        if (error) throw error;
        console.log(`Ensured admin role for ${u.email}`);
      } else if (u.role === "provider") {
        // Link provider profile using RPC
        const { error } = await admin.rpc(
          "create_provider_profile",
          { p_user_id: userId, p_email: u.email, p_provider_id: demoProviderId },
          { get: false },
        );
        if (error) throw error;
        console.log(`Ensured provider and linked ${u.email} -> provider ${demoProviderId}`);
      } else if (u.role === "customer") {
        // Create customer row for demo provider if not exists
        const { data: existingCustomer } = await admin
          .schema(SCHEMA)
          .from("customers")
          .select("id")
          .eq("provider_id", demoProviderId)
          .eq("email", u.email)
          .maybeSingle();

        if (existingCustomer?.id) {
          console.log(`Customer record already exists for ${u.email}`);
        } else {
          const { error } = await admin
            .schema(SCHEMA)
            .from("customers")
            .insert({ provider_id: demoProviderId, first_name: "Demo", last_name: "Customer", email: u.email })
            .select("id");
          if (error) throw error;
          console.log(`Created customer record for ${u.email}`);
        }
      }
    } catch (err: any) {
      console.error(`Error processing ${u.email}: ${err.message ?? String(err)}`);
    }
  }

  console.log("Done. Created/ensured demo users (no passwords printed). Use password reset or DEMO_USERS_PASSWORD for known credentials.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
