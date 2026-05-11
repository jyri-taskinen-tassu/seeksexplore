# Provider Admin Panel — Complete Development Plan

## Table of Contents

- [What You Have Now](#what-you-have-now)
- [1. Repo Structure — NX Monorepo](#1-repo-structure--nx-monorepo)
  - [Why NX Monorepo](#why-nx-monorepo)
  - [App Responsibilities](#app-responsibilities)
  - [Shared Packages](#shared-packages)
  - [NX Setup](#nx-setup)
  - [Path Aliases](#path-aliases-tsconfigbasejson)
  - [NX Commands](#nx-commands)
  - [Migrating the Current Codebase](#migrating-the-current-codebase)
- [2. Git Workflow & Branch Strategy](#2-git-workflow--branch-strategy)
  - [Branch Model](#branch-model)
  - [Branch Protection Rules](#github-branch-protection-rules)
  - [PR Checklist Template](#pr-checklist-template-githubpull_request_templatemd)
  - [Commit Convention](#commit-convention-conventional-commits)
- [3. CI/CD with GitHub Actions](#3-cicd-with-github-actions)
- [4. Environments](#4-environments)
- [5. Database — Supabase Schema & ERD](#5-database--supabase-schema--erd)
  - [Multi-Tenant Strategy](#multi-tenant-strategy--schema-per-tenant)
  - [public Schema — Shared Platform Data](#public-schema--shared-platform-data)
  - [Tenant Schema — Per-Tenant Tables](#tenant-schema--per-tenant-operational-tables)
  - [ERD — Within a Single Tenant Schema](#erd--within-a-single-tenant-schema)
  - [RLS — Simplified](#rls--simplified)
  - [Tenant Schema Provisioning](#tenant-schema-provisioning-on-signup)
  - [Marketplace — Cross-Schema Queries](#marketplace--cross-schema-queries)
  - [Migrating All Tenant Schemas at Once](#migrating-all-tenant-schemas-at-once)
  - [Cross-Schema Queries in Code](#cross-schema-queries-in-code-emergency--admin-use)
- [6. Feature Development Phases](#6-feature-development-phases)
  - [Phase 0 — Foundation](#phase-0--foundation-week-12)
  - [Phase 1 — Products CRUD](#phase-1--products-crud-week-34)
  - [Phase 2 — Resources & Availability](#phase-2--resources--availability-week-56)
  - [Phase 3 — Bookings](#phase-3--bookings-week-78)
  - [Phase 4 — Analytics](#phase-4--analytics-week-9)
  - [Phase 5 — AI Features](#phase-5--ai-features-week-1012)
- [7. AI Features](#7-ai-features)
  - [7a. AI Product Creation](#7a-ai-product-creation-providerproductsnew-ai)
  - [7b. AI Description Writer](#7b-ai-description-writer)
  - [7c. AI Pricing Suggester](#7c-ai-pricing-suggester)
  - [7d. Smart Availability Suggestions](#7d-smart-availability-suggestions-phase-5)
- [8. Additional Packages to Install](#8-additional-packages-to-install)
- [9. File Structure After Phase 1](#9-file-structure-after-phase-1)
- [10. Recommended Start Order](#10-recommended-start-order)

---

## What You Have Now

The UI shell is built: dashboard, products, bookings, availability, resources, customers, analytics, settings — all wired to **in-memory mock data**. No auth, no DB, no persistence. The task is to make it real.

---

## 1. Repo Structure — NX Monorepo

### Why NX Monorepo

One repo holds everything: the provider frontend, the API backend, and all shared code. Different apps deploy to different servers, but types, constants, and utility libraries are written once and imported everywhere with no duplication and no version drift between packages.

```
seeksexplore/                      ← repo root
├── apps/
│   ├── web/                       ← Next.js frontend (provider admin + landing page)
│   ├── api/                       ← Express / Hono backend (REST API + AI routes)
│   └── worker/                    ← Background jobs (email, marketplace sync, etc.)
│
├── packages/
│   ├── types/                     ← Shared TypeScript types (ProductDraft, Booking, etc.)
│   ├── constants/                 ← Shared enums, config values, currency lists, etc.
│   ├── utils/                     ← Pure utility functions (date helpers, formatters, etc.)
│   ├── db/                        ← Supabase client factory + generated DB types
│   └── ui/                        ← Shared React component library (buttons, inputs, etc.)
│
├── nx.json
├── package.json                   ← root workspace (single node_modules)
└── tsconfig.base.json             ← base TS config, path aliases for all packages
```

### App Responsibilities

| App | Framework | Deployed to | Purpose |
| --- | --------- | ----------- | ------- |
| `apps/web` | Next.js 16 | Vercel | Provider admin panel, landing page, auth pages |
| `apps/api` | Hono (or Express) | Railway / Fly.io | Booking API, AI endpoints, webhook handlers |
| `apps/worker` | Node.js | Railway (cron) | Marketplace sync, email queues, scheduled jobs |

**Why separate `apps/api` from `apps/web`:**
- AI endpoints (streaming responses, long Claude calls) can time out on Vercel's 10s edge limit — a dedicated API server has no timeout ceiling
- The booking API will eventually serve the public marketplace too, not just the provider panel
- Independent scaling: the API can scale without redeploying the frontend

### Shared Packages

**`packages/types`** — the single source of truth for all data shapes:
```typescript
// packages/types/src/product.ts
export type ProductStatus = 'draft' | 'published' | 'archived';

export type Product = {
  id: string;
  title: string;
  status: ProductStatus;
  // ...
};

// Both apps/web and apps/api import from here — never drift
import type { Product } from '@seeksexplore/types';
```

**`packages/constants`** — shared enums and config values:
```typescript
// packages/constants/src/index.ts
export const CURRENCIES = ['EUR', 'SEK', 'NOK', 'DKK'] as const;
export const CANCELLATION_POLICIES = ['Flexible', 'Standard', 'Strict'] as const;
export const BOOKING_SOURCES = ['manual', 'online', 'api'] as const;
```

**`packages/db`** — Supabase client factory + generated types:
```typescript
// packages/db/src/client.ts
export { createBrowserClient, createServerClient } from './supabase';
export type { Database } from './generated/database.types';
// Run `supabase gen types` here, import the output everywhere
```

**`packages/utils`** — pure functions, no framework dependencies:
```typescript
// packages/utils/src/dates.ts
export function formatDeparture(date: string, time: string): string { ... }

// packages/utils/src/pricing.ts
export function calculateBookingTotal(items: BookingItem[]): number { ... }
```

**`packages/ui`** — shared React components (only if web + a future customer-facing app share UI):
```
Button, Input, Badge, Modal, Card
```
Skip this package until you have a second frontend that needs it. Don't abstract prematurely.

### NX Setup

```bash
# Create NX workspace (from scratch) or add NX to existing repo
npx create-nx-workspace@latest seeksexplore --preset=ts

# Add Next.js app
nx g @nx/next:app web

# Add Hono API app
nx g @nx/node:app api

# Add shared packages
nx g @nx/js:lib types
nx g @nx/js:lib constants
nx g @nx/js:lib utils
nx g @nx/js:lib db
```

### Path Aliases (`tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@seeksexplore/types":     ["packages/types/src/index.ts"],
      "@seeksexplore/constants": ["packages/constants/src/index.ts"],
      "@seeksexplore/utils":     ["packages/utils/src/index.ts"],
      "@seeksexplore/db":        ["packages/db/src/index.ts"],
      "@seeksexplore/ui":        ["packages/ui/src/index.ts"]
    }
  }
}
```

### NX Commands

```bash
# Run dev for all apps in parallel
nx run-many --target=dev --all

# Run only the web app
nx dev web

# Run only the API
nx dev api

# Build only what changed since last commit (NX caching)
nx affected --target=build

# Run lint across all packages
nx run-many --target=lint --all

# Generate DB types from Supabase (run in packages/db)
nx run db:generate-types
```

### Migrating the Current Codebase

The current Next.js app (`seeksexplore/`) becomes `apps/web`. Steps:

1. Init NX workspace at the repo root
2. Move current Next.js files into `apps/web/`
3. Extract `lib/types.ts` → `packages/types/`
4. Extract constants (currencies, statuses) → `packages/constants/`
5. Extract utility functions → `packages/utils/`
6. Move Supabase client setup → `packages/db/`
7. Update all imports to use `@seeksexplore/*` aliases
8. Create `apps/api/` as a new Hono app
9. Move `/api/*` route handlers from Next.js into `apps/api/`

The existing in-memory stores (`lib/productStore.tsx`, etc.) stay in `apps/web/` — they're React Context, frontend-only.

---

## 2. Git Workflow & Branch Strategy

### Branch Model

```
main        ← production (protected, never push directly)
staging     ← staging env (protected, merge via PR only)
develop     ← integration branch (team merges features here)
feat/*      ← individual features (feat/product-crud)
fix/*       ← bug fixes
chore/*     ← deps, config, non-functional
```

### GitHub Branch Protection Rules

**`main` branch:**

- Require PR with 1 approval
- Require status checks: `build`, `lint`, `type-check`
- No force push, no deletion
- Require branch to be up to date before merge
- Dismiss stale reviews on new push

**`staging` branch:**

- Require PR with 1 approval
- Same status checks
- No force push

**`develop` branch:**

- Require PR with 1 approval
- Status checks: `build`, `lint`

### PR Checklist Template (`.github/pull_request_template.md`)

```markdown
## What does this PR do?

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / chore
- [ ] DB migration

## Checklist

- [ ] Types are defined (no `any` shortcuts)
- [ ] No hardcoded secrets or API keys
- [ ] Migration file included (if schema changed)
- [ ] Tested locally against staging Supabase
- [ ] UI tested in browser (if frontend change)
- [ ] i18n keys added for new UI strings (EN + FI)

## Screenshots (if UI change)

## Linked issue / ticket
```

### Commit Convention (Conventional Commits)

```
feat(products): add resource rule builder
fix(bookings): correct timezone offset
chore(deps): upgrade next to 16.2
feat(auth)!: add multi-tenant RLS  ← breaking change
```

Enforce via `commitlint` + `husky` pre-commit hook.

---

## 3. CI/CD with GitHub Actions

**Workflow: `.github/workflows/ci.yml`**

Runs on every PR:

1. `npm run lint`
2. `tsc --noEmit` (type check)
3. `npm run build`

**Workflow: `.github/workflows/deploy-staging.yml`**

Triggers on merge to `staging` → Vercel staging deploy.

**Workflow: `.github/workflows/deploy-prod.yml`**

Triggers on merge to `main` → Vercel production deploy. Requires manual approval gate.

---

## 4. Environments

### Three Environments

| Environment | Branch    | Vercel Project         | Supabase Project       | URL                      |
| ----------- | --------- | ---------------------- | ---------------------- | ------------------------ |
| Local       | any       | localhost:3000         | `seeksexplore-local`   | localhost                |
| Staging     | `staging` | `seeksexplore-staging` | `seeksexplore-staging` | staging.seeksexplore.com |
| Production  | `main`    | `seeksexplore-prod`    | `seeksexplore-prod`    | app.seeksexplore.com     |

### Vercel Setup

Use **separate Vercel projects** for staging and prod, not preview URLs. This gives you:

- Separate env vars per project
- Separate Supabase connection strings
- No risk of staging data bleeding into prod

### Environment Variables per project

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-side only
RESEND_API_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_ENV=staging|production
```

---

## 5. Database — Supabase Schema & ERD

### Multi-Tenant Strategy — Schema-per-Tenant

Each tenant gets their **own PostgreSQL schema** (`tenant_<slug>`). Tables are identical in structure across all schemas but completely isolated — no `tenant_id` column needed on every row, no cross-tenant RLS rules to maintain. The `public` schema holds platform-level shared data only.

```
PostgreSQL database
├── public                    ← shared platform data (tenants, users, categories, locations)
│   └── marketplace_listings  ← denormalized snapshot for future marketplace
│
├── tenant_arcticfox          ← Arctic Fox Safaris — their data only
│   ├── products
│   ├── pricing_tiers
│   ├── resources
│   ├── resource_variants
│   ├── product_resource_rules
│   ├── departures
│   ├── bookings
│   ├── booking_items
│   └── customers
│
├── tenant_laplandrides        ← Lapland Rides — identical table structure, separate data
│   └── (same tables)
│
└── tenant_<slug>              ← provisioned automatically on signup
    └── (same tables)
```

**Why schema-per-tenant over RLS row-filtering:**
- Zero risk of a misconfigured policy leaking one tenant's data to another
- Each tenant's tables are small and indexed independently — no multi-million-row tables filtered by `tenant_id`
- Drop a tenant = `DROP SCHEMA tenant_slug CASCADE`. Export one tenant = `pg_dump --schema=tenant_slug`. No other tenants touched.
- Simpler queries inside the provider app — no `WHERE tenant_id = $1` on every query
- Tradeoff: schema provisioning requires a helper function on signup; adding a column requires a migration loop across all schemas (pattern shown below)

---

### `public` Schema — Shared Platform Data

```
public.tenants
├── id (uuid, PK)
├── slug (unique — becomes schema name: tenant_<slug>)
├── name
├── schema_name (stored as 'tenant_' || slug)
├── plan: 'trial' | 'basic' | 'pro'
└── created_at

public.users (extends Supabase auth.users)
├── id (uuid, FK → auth.users)
├── tenant_id (FK → public.tenants)
├── role: 'owner' | 'admin' | 'staff'
├── full_name
└── email

public.categories (platform-defined activity types)
├── id (uuid, PK)
├── name (e.g. "Snowmobile Safari")
├── slug
├── parent_id (FK → categories, nullable — sub-categories)
└── icon

public.locations (geographic reference data)
├── id (uuid, PK)
├── name (e.g. "Rovaniemi")
├── country_code
├── region
└── coordinates (point)

public.marketplace_listings (see Marketplace section below)
├── id (uuid, PK)
├── tenant_id (FK → public.tenants)
├── product_id (uuid — mirrors the id in the tenant schema)
├── title
├── short_description
├── category_id (FK → public.categories)
├── location_id (FK → public.locations)
├── duration_minutes
├── price_from
├── currency
├── languages: text[]
├── cover_image_url
├── status: 'active' | 'paused' | 'removed'
└── last_synced_at
```

---

### Tenant Schema — Per-Tenant Operational Tables

Every `tenant_<slug>` schema contains these tables. No `tenant_id` column — the schema is the boundary.

```
products
├── id (uuid, PK)
├── title
├── short_description
├── description
├── category_id (FK → public.categories)
├── location_id (FK → public.locations)
├── location_name
├── address
├── duration_minutes
├── meeting_point
├── currency: 'EUR' | 'SEK' | 'NOK' | 'DKK'
├── capacity_mode: 'per_departure' | 'per_resource'
├── capacity_max
├── languages: text[]
├── included
├── not_included
├── requirements
├── cancellation_policy: 'Flexible' | 'Standard' | 'Strict'
├── status: 'draft' | 'published' | 'archived'
└── created_at, updated_at

pricing_tiers
├── id (uuid, PK)
├── product_id (FK → products)
├── label (e.g. "Adult", "Child")
└── price

resources
├── id (uuid, PK)
├── name (e.g. "Snowmobiles")
└── description

resource_variants
├── id (uuid, PK)
├── resource_id (FK → resources)
├── name (e.g. "Sport 1-seat")
├── capacity_per_unit
├── unit_label
├── total_units
├── buffer_units
└── status: 'active' | 'maintenance'

product_resource_rules
├── id (uuid, PK)
├── product_id (FK → products)
├── resource_variant_id (FK → resource_variants)
└── units_per_booking

departures
├── id (uuid, PK)
├── product_id (FK → products)
├── date
├── start_time
├── capacity_override (nullable)
└── status: 'open' | 'closed' | 'cancelled'

bookings
├── id (uuid, PK)
├── product_id (FK → products)
├── departure_id (FK → departures, nullable)
├── customer_name
├── customer_email
├── customer_phone
├── guests
├── status: 'confirmed' | 'pending' | 'cancelled'
├── total_price
├── currency
├── notes
├── booked_at
└── source: 'manual' | 'online' | 'api'

booking_items
├── id (uuid, PK)
├── booking_id (FK → bookings)
├── pricing_tier_id (FK → pricing_tiers)
├── quantity
└── unit_price

customers
├── id (uuid, PK)
├── email (unique within this schema)
├── name
├── phone
└── created_at
```

---

### ERD — Within a Single Tenant Schema

```
products ──< pricing_tiers
         ──< product_resource_rules >── resource_variants ──< resources
         ──< departures ──< bookings ──< booking_items >── pricing_tiers
                                    >── customers

products >── public.categories
         >── public.locations
```

---

### RLS — Simplified

Tenant schemas need no RLS — the schema is the isolation. Only `public` tables need policies:

```sql
-- Users can only read their own row
CREATE POLICY "self_only" ON public.users
  USING (id = auth.uid());

-- Users can only read their own tenant
CREATE POLICY "own_tenant" ON public.tenants
  USING (id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Categories and locations are read-only public reference data
CREATE POLICY "read_only" ON public.categories FOR SELECT USING (true);
CREATE POLICY "read_only" ON public.locations  FOR SELECT USING (true);
```

**Setting `search_path` per request (Next.js API route):**

```typescript
// lib/supabase/tenant.ts
export async function withTenantSchema<T>(
  tenantSlug: string,
  fn: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const client = createServerClient();
  await client.rpc('set_config', {
    setting: 'search_path',
    value: `tenant_${tenantSlug}, public`,
  });
  return fn(client);
}

// Usage in an API route:
const products = await withTenantSchema(slug, (db) =>
  db.from('products').select('*')
);
```

---

### Tenant Schema Provisioning (on signup)

```sql
-- supabase/functions/provision_tenant.sql
CREATE OR REPLACE FUNCTION provision_tenant(p_slug text)
RETURNS void AS $$
DECLARE
  schema_name text := 'tenant_' || p_slug;
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  EXECUTE format('SET search_path = %I, public', schema_name);

  -- Create all tenant tables in the new schema
  EXECUTE format('
    CREATE TABLE %I.products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      status text NOT NULL DEFAULT ''draft'',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
      -- ... full column list from supabase/tenant_schema.sql
    )
  ', schema_name);

  -- Repeat for all tables...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Keep the full per-tenant DDL in **`supabase/tenant_schema.sql`** — `provision_tenant()` reads from it. One source of truth.

---

### Marketplace — Cross-Schema Queries

The `public.marketplace_listings` table is the bridge. Tenants **publish** to it explicitly — the marketplace never queries individual tenant schemas at runtime.

#### Publish flow

```
tenant_arcticfox.products  (status → 'published')
        │
        │  trigger fires on UPDATE
        ▼
public.marketplace_listings  ← upsert denormalized snapshot
        │
        │  marketplace page queries only this table
        ▼
Customer-facing browse / search
```

#### Publish trigger (runs inside the tenant schema)

```sql
CREATE OR REPLACE FUNCTION sync_to_marketplace()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id uuid;
  v_price_from numeric;
BEGIN
  SELECT id INTO v_tenant_id
  FROM public.tenants
  WHERE schema_name = current_schema();

  SELECT MIN(price) INTO v_price_from
  FROM pricing_tiers
  WHERE product_id = NEW.id;

  IF NEW.status = 'published' THEN
    INSERT INTO public.marketplace_listings (
      tenant_id, product_id, title, short_description,
      category_id, location_id, duration_minutes,
      price_from, currency, languages, status, last_synced_at
    ) VALUES (
      v_tenant_id, NEW.id, NEW.title, NEW.short_description,
      NEW.category_id, NEW.location_id, NEW.duration_minutes,
      v_price_from, NEW.currency, NEW.languages, 'active', now()
    )
    ON CONFLICT (tenant_id, product_id) DO UPDATE SET
      title           = EXCLUDED.title,
      price_from      = EXCLUDED.price_from,
      status          = 'active',
      last_synced_at  = now();

  ELSIF NEW.status = 'archived' THEN
    UPDATE public.marketplace_listings
    SET status = 'removed'
    WHERE tenant_id = v_tenant_id AND product_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_marketplace
  AFTER INSERT OR UPDATE OF status ON products
  FOR EACH ROW EXECUTE FUNCTION sync_to_marketplace();
```

#### Marketplace search query (no cross-schema joins, always fast)

```sql
SELECT
  ml.id,
  ml.title,
  ml.price_from,
  ml.currency,
  ml.duration_minutes,
  ml.languages,
  t.name  AS provider_name,
  t.slug  AS provider_slug,
  c.name  AS category,
  l.name  AS location
FROM  public.marketplace_listings ml
JOIN  public.tenants    t ON t.id = ml.tenant_id
JOIN  public.categories c ON c.id = ml.category_id
JOIN  public.locations  l ON l.id = ml.location_id
WHERE ml.status = 'active'
  AND l.name    = 'Rovaniemi'          -- optional filter
  AND c.slug    = 'snowmobile-safari'  -- optional filter
ORDER BY ml.price_from ASC;
```

#### Customer booking flow (crosses back into tenant schema)

```
marketplace_listings  →  /book/[tenant-slug]/[product-id]
                               │
                      SET search_path = tenant_arcticfox, public
                               │
                      SELECT departures, pricing_tiers
                               │
                      INSERT INTO bookings (...)
```

The marketplace handles **discovery only**. All transactional data stays in the tenant's own schema.

---

### Migrating All Tenant Schemas at Once

When you add a column or table to the tenant structure:

```sql
-- supabase/migrations/007_add_product_tags.sql
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT schema_name FROM public.tenants LOOP
    EXECUTE format(
      'ALTER TABLE %I.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[]',
      r.schema_name
    );
  END LOOP;
END $$;
```

One migration file, applied to all tenant schemas automatically. Add this pattern to every structural change.

---

### Cross-Schema Queries in Code (Emergency / Admin Use)

The normal path is: set `search_path` to one tenant schema and query normally. But occasionally — admin dashboards, platform-level analytics, data exports — you genuinely need to query across all tenant schemas at once. Here's how to do it safely in TypeScript.

#### Pattern: Build a `UNION ALL` dynamically from the tenant list

```typescript
// packages/db/src/crossSchema.ts
import { createServiceClient } from './client';

/**
 * Runs the same query across every tenant schema and merges results.
 * Use only for admin/platform queries — never in the provider app hot path.
 *
 * @param buildQuery - receives a schema name, returns a SQL fragment for that schema
 * @returns merged rows from all tenant schemas
 */
export async function queryAllTenants<T>(
  buildQuery: (schema: string) => string
): Promise<T[]> {
  const db = createServiceClient(); // service role — bypasses RLS

  // 1. Fetch all tenant schema names from the registry
  const { data: tenants, error } = await db
    .from('tenants')
    .select('schema_name')
    .order('created_at');

  if (error) throw error;
  if (!tenants?.length) return [];

  // 2. Build a UNION ALL across every schema
  const unionSql = tenants
    .map((t) => `(${buildQuery(t.schema_name)})`)
    .join('\n  UNION ALL\n  ');

  // 3. Execute as a single query
  const { data, error: queryError } = await db.rpc('run_cross_schema_query', {
    sql: unionSql,
  });

  if (queryError) throw queryError;
  return data as T[];
}
```

#### The `run_cross_schema_query` RPC (SQL)

Supabase doesn't let you run arbitrary SQL from the client directly. Wrap it in a Postgres function with `SECURITY DEFINER`:

```sql
-- supabase/migrations/008_cross_schema_rpc.sql
CREATE OR REPLACE FUNCTION run_cross_schema_query(sql text)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  -- Only callable by service role — add a guard
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || sql || ') t'
  INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Usage examples

**Example 1 — Total revenue across all tenants (admin analytics):**

```typescript
type RevenueRow = {
  schema_name: string;
  total_revenue: number;
  booking_count: number;
};

const revenue = await queryAllTenants<RevenueRow>((schema) => `
  SELECT
    '${schema}'        AS schema_name,
    SUM(total_price)   AS total_revenue,
    COUNT(*)           AS booking_count
  FROM ${schema}.bookings
  WHERE status = 'confirmed'
    AND booked_at >= now() - interval '30 days'
`);

// revenue = [
//   { schema_name: 'tenant_arcticfox',   total_revenue: 14200, booking_count: 48 },
//   { schema_name: 'tenant_laplandrides', total_revenue: 9800,  booking_count: 31 },
// ]
```

**Example 2 — Find a customer by email across all tenants (support lookup):**

```typescript
type CustomerRow = {
  schema_name: string;
  id: string;
  name: string;
  email: string;
};

const email = 'emma.smith@example.com';

const matches = await queryAllTenants<CustomerRow>((schema) => `
  SELECT
    '${schema}' AS schema_name,
    id,
    name,
    email
  FROM ${schema}.customers
  WHERE email = '${email.replace(/'/g, "''")}'
`);
```

> **SQL injection note:** The `email` value above is escaped with `replace(/'/g, "''")` for illustration. In production, pass values via parameterised SQL or a helper that sanitises inputs before interpolation. Never interpolate raw user input into the schema name itself — schema names always come from `public.tenants`, never from user input.

**Example 3 — Platform-wide occupancy report:**

```typescript
type OccupancyRow = {
  schema_name: string;
  product_title: string;
  departure_date: string;
  booked_guests: number;
  capacity: number;
};

const occupancy = await queryAllTenants<OccupancyRow>((schema) => `
  SELECT
    '${schema}'       AS schema_name,
    p.title           AS product_title,
    d.date            AS departure_date,
    COALESCE(SUM(b.guests), 0) AS booked_guests,
    COALESCE(d.capacity_override, p.capacity_max, 0) AS capacity
  FROM ${schema}.departures d
  JOIN ${schema}.products p ON p.id = d.product_id
  LEFT JOIN ${schema}.bookings b
    ON b.departure_id = d.id AND b.status = 'confirmed'
  WHERE d.date BETWEEN current_date AND current_date + 7
  GROUP BY p.title, d.date, d.capacity_override, p.capacity_max
`);
```

#### When to use this vs. the marketplace table

| Situation | Use |
| --------- | --- |
| Customer browsing / search | `public.marketplace_listings` — always |
| Provider querying their own data | `search_path = tenant_slug` — always |
| Admin dashboard (revenue, signups, platform health) | `queryAllTenants()` |
| Support lookup (find customer across tenants) | `queryAllTenants()` |
| Real-time booking path | Never — set `search_path` to one tenant |

Cross-schema queries are a maintenance tool and an admin tool. They should never appear in the request path of a provider or customer action.

---

## 6. Feature Development Phases

### Phase 0 — Foundation (Week 1–2)

**Goal:** Real auth, real DB, dev environment working end-to-end.

- [ ] Install: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `commitlint`, `husky`
- [ ] Supabase projects created (local, staging, prod)
- [ ] Migrations for all core tables with RLS
- [ ] Supabase Auth: sign in / sign up pages at `/auth/login`, `/auth/signup`
- [ ] Middleware protecting `/provider/*`
- [ ] Replace in-memory stores with Supabase queries (start with products)
- [ ] CI pipeline (lint + type-check + build)
- [ ] Vercel staging project wired to `staging` branch

### Phase 1 — Products CRUD (Week 3–4)

**Goal:** Provider can create, edit, publish, archive products.

- [ ] Products list page reads from DB
- [ ] Create product form saves to DB
- [ ] Edit product (new route: `/provider/products/[id]/edit`)
- [ ] Pricing tiers saved to `pricing_tiers` table
- [ ] Product status toggle (draft → published)
- [ ] Resource rules linked to product

### Phase 2 — Resources & Availability (Week 5–6)

**Goal:** Inventory management + departure scheduling.

- [ ] Resources page reads/writes `resources` + `resource_variants`
- [ ] Departure creation (date, time, capacity)
- [ ] Availability calendar reads `departures`
- [ ] Close/cancel a departure slot

### Phase 3 — Bookings (Week 7–8)

**Goal:** Real booking management.

- [ ] Bookings list from DB (replace mock)
- [ ] Manual booking creation form
- [ ] Booking status updates (confirm/cancel)
- [ ] Customers table populated from bookings
- [ ] Email notification on booking via Resend (existing API key)

### Phase 4 — Analytics (Week 9)

**Goal:** Real metrics from booking data.

- [ ] Revenue by period (SQL aggregates)
- [ ] Bookings by product
- [ ] Occupancy rate per departure
- [ ] Simple charts (use `recharts`)

### Phase 5 — AI Features (Week 10–12)

See section 7 below.

---

## 7. AI Features

### 7a. AI Product Creation (`/provider/products/new-ai`)

This route already exists as a shell. Wire it to Claude.

**Flow:**

1. Provider describes their experience in plain text (existing textarea)
2. POST to `/api/provider/ai/create-product`
3. Server calls `claude-sonnet-4-6` with a structured prompt
4. Returns a full `ProductDraft` JSON object
5. Populates the form fields, user reviews and saves

**API route:**

```typescript
// /api/provider/ai/create-product
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 2048,
  system: `You are a product setup assistant for activity operators.
  Extract structured product data from the operator's description.
  Return ONLY valid JSON matching the ProductDraft schema.`,
  messages: [{ role: "user", content: userDescription }],
});
```

**Prompt caching:** Cache the system prompt using `cache_control: { type: "ephemeral" }` on the system message — saves ~80% token cost on repeated calls.

### 7b. AI Description Writer

On the product form, a "Generate description" button:

- Takes: title, category, location, duration, included items
- Returns: polished markdown description + short description
- Streaming response via `stream: true` to show typing effect

### 7c. AI Pricing Suggester

On the pricing form:

- Takes: product type, location, duration, competitor context (optional)
- Suggests: pricing tiers with rationale
- Provider accepts/modifies suggestions

### 7d. Smart Availability Suggestions (Phase 5+)

- Analyzes booking patterns from DB
- Suggests optimal departure times for new products
- e.g. "Your snowmobile tours on Saturdays at 10:00 fill 87% — consider adding a 14:00 slot"

### AI Stack

| Concern           | Choice                                 |
| ----------------- | -------------------------------------- |
| SDK               | `@anthropic-ai/sdk`                    |
| Model             | `claude-sonnet-4-6`                    |
| Structured output | `tool_use` (avoids JSON parse errors)  |
| Streaming         | `stream: true` for description writing |
| Cost optimization | Prompt caching on all system prompts   |

---

## 8. Additional Packages to Install

```bash
# Auth + DB
npm install @supabase/supabase-js @supabase/ssr

# Validation
npm install zod

# AI
npm install @anthropic-ai/sdk

# Charts (analytics)
npm install recharts

# Forms (optional, or continue with controlled React)
npm install react-hook-form @hookform/resolvers

# Date handling
npm install date-fns

# Dev tooling
npm install -D husky commitlint @commitlint/config-conventional
```

---

## 9. File Structure After Phase 1

```
app/
  auth/
    login/page.tsx
    signup/page.tsx
  provider/
    (existing pages, now DB-backed)
  api/
    contact/route.ts              ← existing
    provider/
      ai/
        create-product/route.ts
        generate-description/route.ts
      products/
        route.ts                  ← GET list, POST create
        [id]/route.ts             ← GET, PATCH, DELETE
      bookings/route.ts
      departures/route.ts
lib/
  supabase/
    client.ts                     ← browser client
    server.ts                     ← server component client
    middleware.ts                 ← session refresh
  types/
    database.types.ts             ← generated from Supabase
    provider.types.ts             ← app-level types
  (existing stores → deprecated after each phase)
middleware.ts                     ← auth guard
supabase/
  migrations/
    001_initial_schema.sql
    002_rls_policies.sql
```

---

## 10. Recommended Start Order

1. **Today:** Create Supabase staging project, run `supabase init`, write migration 001
2. **Tomorrow:** Auth pages + middleware + session working locally
3. **This week:** Products CRUD end-to-end (create → save to DB → list from DB)
4. **Set up CI:** Lint/type-check on every PR before touching more features
5. **Set up Vercel staging:** So every PR to `staging` gets a live URL
6. **Then:** Work through phases 1–5 one feature at a time, one PR per feature

---

> **Biggest risk:** scope creep — resist adding real-time notifications, webhooks, or complex analytics until bookings and products work reliably. The mock stores already give you the UI; the only work is replacing the data layer calls. Each phase is an independent PR.
