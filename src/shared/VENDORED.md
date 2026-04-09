# Vendored from @abeto-directories/shared

**Source:** https://github.com/goabeto/abeto-directories/tree/main/packages/shared
**Commit:** 9e2f67a (April 8, 2026)
**Vendored:** 2026-04-08

## What's included (solar-relevant only)
- `types/index.ts` — Domain types (Listing, Subsidy, Municipality, etc.) + Spanish constants
- `lib/` — Supabase client factory, SEO JSON-LD generators, slugify, sanitize
- `theme/types.ts` — ThemeConfig interface
- `components/` — SubsidyBanner, CertificationBadge

## Also copied from apps/spain (not shared package)
- `src/lib/dedup.ts` — Listing deduplication by google_place_id
- `src/lib/subsidies-api.ts` — External subsidies resolver API client

## How to sync
```bash
# Check what changed in shared since last vendor
gh api repos/goabeto/abeto-directories/commits?path=packages/shared&since=2026-04-08 --jq '.[].commit.message'

# Re-vendor: copy updated files from remote
gh api repos/goabeto/abeto-directories/contents/packages/shared/src/types/index.ts --jq '.content' | base64 -d > src/shared/types/index.ts
# ... repeat for other files
```

## Upgrade path
When a 3rd consumer repo needs shared types, publish `@abeto-directories/shared` to npm and replace this vendored directory with `npm install`.
