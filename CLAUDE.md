# Precio Solar

Independent solar price comparison platform for Spain — preciosolar.es

## Architecture

Standalone Next.js 15 app that **reads from** the abeto-directories ecosystem:
- **Supabase DB** (shared with tuenergiaverde.es) — installer listings, reference pricing, subsidy programs, loan products
- **Subsidies API** (spain-subsidies-research) — real-time address-based subsidy resolution
- **PVGIS** (EU API) — solar irradiation data by location
- **Nominatim** (OpenStreetMap) — geocoding postal codes

## Solar-only

This app only handles the **solar vertical**. The directories monorepo covers 4 verticals (solar, aerotermia, baterias, cargadores EV) — we filter all queries to solar.

## Vendored shared code

`src/shared/` contains types, utilities, and components vendored from `goabeto/abeto-directories` (packages/shared). See `src/shared/VENDORED.md` for sync instructions.

Also vendored from `apps/spain`:
- `src/lib/dedup.ts` — listing deduplication by google_place_id
- `src/lib/subsidies-api.ts` — external subsidies resolver API client

## Key paths

- `src/lib/data.ts` — main data access layer (Supabase queries + dedup)
- `src/lib/pricing.ts` — solar system cost/savings calculations
- `src/lib/pvgis.ts` — PVGIS solar irradiation API
- `src/lib/geocode.ts` — postal code geocoding (Nominatim + fallback)
- `src/app/api/calculate/route.ts` — core calculator endpoint
- `src/components/` — 19 React components for the purchase wizard flow
- `src/i18n/` — bilingual system (ES/EN)

## Environment variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — shared Supabase instance
- `SUPABASE_SERVICE_ROLE_KEY` — server-side DB access

Optional:
- `SUBSIDIES_API_URL` + `SUBSIDIES_API_KEY` — real-time subsidy resolution
- `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` — AI chat widget (only used when `NEXT_PUBLIC_ELEVENLABS_ENABLED=true`; widget is hidden by default)
- `NEXT_PUBLIC_ELEVENLABS_ENABLED` — set to `true` to render the voice chat widget; off by default
- `RESEND_API_KEY` — lead notification emails
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — analytics

## Development

```bash
npm install
npm run dev     # http://localhost:3003
npm run build   # production build
npm run typecheck
```
