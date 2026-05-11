# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured. There is no `npm test` command.

## Environment Variables

The contact form requires `RESEND_API_KEY` to send emails. Without it, the `/api/contact` route returns a 500 error.

## Architecture

This is a **Next.js 16 (App Router)** project with **Tailwind CSS v4** and **TypeScript**. It has two distinct surfaces:

### 1. Public Landing Page (`app/page.tsx`)
A single-page marketing site with:
- EN/FI language toggle (all translations live inline in `app/page.tsx` as a `translations` object — no i18n library)
- Contact form that POSTs to `/api/contact/route.ts`, which sends email via **Resend** from `hello@seeksexplore.com` to a hardcoded recipient
- Privacy policy at `/privacy`
- SEO intentionally disabled: `robots.txt` blocks all crawlers, noindex meta tags are set

### 2. Provider MVP (`app/provider/*`)
A prototype dashboard for experience/activity operators. All data is **in-memory only** — there is no database or API. State lives in React Context providers wrapped in `app/provider/layout.tsx`.

**State stores (all in `lib/`):**
- `productStore.tsx` — `ProductDraftProvider` + `useProductDraft` hook: manages a single product draft using `useReducer`. Supports pricing tiers and resource rules.
- `resourceStore.tsx` — `ResourceInventoryProvider` + `useResourceInventory` hook: manages resource categories (snowmobiles, e-bikes, guides) and variants with mock Finnish safari operator data.
- `bookingsStore.ts` — module-level singleton: generates deterministic mock bookings for the next 28 days using a seeded PRNG. No React context — called directly.
- `analyticsStore.ts`, `customersStore.ts`, `settingsStore.ts` — similar module-level mock data stores.

**Provider routes:**
- `/provider` — dashboard overview
- `/provider/products` — product list; `/provider/products/new` — manual product creation; `/provider/products/new-ai` — AI-assisted product creation
- `/provider/bookings`, `/provider/availability`, `/provider/resources`, `/provider/customers`, `/provider/analytics`, `/provider/settings`

The `app/provider/layout.tsx` wraps all provider pages with `ProductDraftProvider` and `ResourceInventoryProvider`. The sidebar nav is `app/components/provider/ProviderNav.tsx`.

### Brand Colors
Defined as CSS custom properties in `app/globals.css` and used via `var(--color-*)` throughout:
- `--color-forest: #1b3a2e` (primary brand, dark green)
- `--color-cream: #efe9d4`
- `--color-sage: #6f856e`
- `--color-sky: #96b0bb`
- `--color-accent: #ef904f`
- `--color-brown: #794d32`

### Key Types
`lib/types.ts` defines `ProductDraft` and `ResourceAllocation`. However, `lib/productStore.tsx` also defines a `ProductDraft` type with additional fields — these are not fully in sync. Prefer the store's type for provider-side code.
