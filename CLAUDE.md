# CLAUDE.md

Guidance for Claude Code in this repo. Use `/caveman` mode — drop filler, keep substance.

## Commands

```bash
npm run dev      # localhost:3000
npm run build    # prod build
npm run lint     # ESLint
npx prettier --write <file>  # format changed files (always run after edits)
```

No test suite. No `npm test`.

## Env Vars

`RESEND_API_KEY` — contact form email. Without it, `/api/contact` → 500.

## Workflow

### 1. Check project state first

Before any feature work, use Linear MCP:

- Team: **Seeks and Explore**
- Project: **Demo**
- List issues to know what's built, in-progress, and pending.

### 2. Log issues to Linear

For any bug, ignored edge case, or new feature found during work — create Linear issue in same team/project.

Format (use `/humanizer` to make it sound human, `/caveman` to keep it tight):

```
Title: [Feature/Bug] Short description
User story: As a [role], I want [action] so that [outcome].
Steps to reproduce: (bugs only)
  1. ...
Acceptance criteria:
  - [ ] ...
```

### 3. Build → branch → PR

After building feature:

```bash
git checkout -b feat/<feature-name>/<linear-issue-number>
# make commits with conventional commits format:
# feat: ..., fix: ..., chore: ..., refactor: ...
gh pr create --base exploring --title "..." --body "..."
```

PRs always target `exploring` branch, never `main`.

**NEVER mark a Linear issue as Done.** Always create a PR instead. User verifies PRs manually, then gives a list of verified PRs — only then update Linear issue status to Done.
Mark it as in progress while you work on it

### 4. Prettier on every changed file

```bash
npx prettier --write <changed-file>
```

Run on every file edited before committing.

## Backend

### Supabase

- Project name: `emam-dev` / Project ref: `vmmntdvmfmooklchpqvq`
- Schema: `seeks_and_explore_demo`
- Use Supabase MCP for queries and migrations.

### DB changes

1. Create migration file: `migrations/<timestamp>_<description>.sql`
2. Apply via Supabase MCP (`apply_migration`) or run SQL directly with `execute_sql`.
3. Always scope queries to schema `seeks_and_explore_demo`.
4. Initial schema baseline: `migrations/20260127000000_initial_sql`

## Architecture

**Next.js 16 (App Router)** + **Tailwind CSS v4** + **TypeScript**. Two surfaces:

### Public (`app/page.tsx`)

- EN/FI toggle — translations inline in `app/page.tsx`, no i18n lib
- Contact form → `/api/contact/route.ts` → Resend from `hello@seeksexplore.com`
- Privacy at `/privacy`
- SEO disabled: `robots.txt` blocks crawlers, noindex set

### Provider MVP (`app/provider/*`)

Dashboard for experience operators. Data in-memory only (no DB yet — migration to Supabase in progress).

**State stores (`lib/`):**

- `productStore.tsx` — `ProductDraftProvider` + `useProductDraft`: single product draft via `useReducer`, pricing tiers, resource rules
- `resourceStore.tsx` — `ResourceInventoryProvider` + `useResourceInventory`: resource categories + variants (mock Finnish safari data)
- `bookingsStore.ts` — singleton, deterministic mock bookings 28 days via seeded PRNG, no React context
- `analyticsStore.ts`, `customersStore.ts`, `settingsStore.ts` — similar mock singletons

**Routes:**

- `/provider` — dashboard
- `/provider/products` — list; `/provider/products/new` — manual; `/provider/products/new-ai` — AI-assisted
- `/provider/bookings`, `/provider/availability`, `/provider/resources`, `/provider/customers`, `/provider/analytics`, `/provider/settings`

Layout `app/provider/layout.tsx` wraps all provider pages with both providers. Sidebar: `app/components/provider/ProviderNav.tsx`.

### Brand Colors (`app/globals.css` → `var(--color-*)`)

- `--color-forest: #1b3a2e` (primary, dark green)
- `--color-cream: #efe9d4`
- `--color-sage: #6f856e`
- `--color-sky: #96b0bb`
- `--color-accent: #ef904f`
- `--color-brown: #794d32`

### Key Types

`lib/types.ts` has `ProductDraft` + `ResourceAllocation`. `lib/productStore.tsx` has its own `ProductDraft` with extra fields — not in sync. Use store's type for provider code.
