# Loan Rate Monitoring Plan

Weekly scraper + manual audit flow for the 13 financing providers shown in the Precio Solar funnel.

## Problem

`FALLBACK_LOAN_PRODUCTS` in `src/lib/data.ts` is hand-maintained and already partially stale. If the rates shown to users drift away from reality, the "best match" recommendation misleads leads and installers challenge our numbers. Today there is no automated check.

## Scope

Cover the 13 providers currently in `FALLBACK_LOAN_PRODUCTS`:

ICO Verde, CaixaBank, BBVA, Kutxabank, Pontio, Bankinter, Santander, Sabadell, Sofinco, Cetelem, Fintonic, Cofidis, Younited Credit.

## Data reality (summary from research)

| Confidence | Providers | Method |
|---|---|---|
| **Static HTML** (TAE range in page source) | Cetelem, Younited, Bankinter, Cofidis, BBVA, ICO Verde | Cheerio fetch + regex |
| **Form/JS-rendered** (quote needed) | Santander, Sabadell, Kutxabank, CaixaBank, Sofinco | Playwright with a test quote (€8k, 10 yr) |
| **No public rate** (B2B / algorithmic) | Pontio, Fintonic | Scrape third-party comparator (Kelisto) or manual-only |

Spanish banks publish *ranges*, not personalised rates, so weekly granularity is plenty.

## Architecture

**Runner:** GitHub Actions, scheduled `cron: "0 6 * * 1"` (Monday 08:00 Madrid). Workflow lives at `.github/workflows/loan-rates.yml` in `goabeto/precio-solar`.

**Job steps:**
1. Checkout, setup Node 20, `npm ci`
2. Run `scripts/scrape-loan-rates.ts`:
   - Per-provider module under `scripts/loan-scrapers/{provider}.ts` exporting `async function fetch(): Promise<{ taeMin, taeMax, tinMin, tinMax, checkedAt, sourceUrl, status }>`
   - Static providers use `undici` + `cheerio`
   - Quote-form providers use `playwright-core` with a shared headless browser
   - Per-provider timeout 30s; on failure return `status: "error"` with previous values retained
3. Write snapshot to Supabase table `loan_rate_snapshots` (see schema below)
4. If any provider delta > 2 percentage points vs. last snapshot → fail the job step so alert fires
5. If success: open a PR with `src/lib/data.ts` `FALLBACK_LOAN_PRODUCTS` updated using a small codegen step; title `chore(rates): weekly refresh YYYY-MM-DD`
6. On any failure / delta spike: send Resend email to `leads@goabeto.com` with per-provider diff

**Why GitHub Actions** (vs. Vercel cron / Supabase Edge Function): free tier is ample (~5 min/week), version-controlled alongside code, native PR creation, no extra runtime to maintain. Playwright runs fine on the ubuntu-latest runner.

## Storage

New Supabase table, low volume (~700 rows/year):

```sql
CREATE TABLE loan_rate_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id text NOT NULL,
  tae_min numeric,
  tae_max numeric,
  tin_min numeric,
  tin_max numeric,
  source_url text,
  status text NOT NULL CHECK (status IN ('ok', 'stale', 'error')),
  error_detail text,
  checked_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON loan_rate_snapshots (provider_id, checked_at DESC);
```

The app keeps reading from the Supabase `loan_products` table (live table already). The scraper's job is to *compare* scraped values against `loan_products` and raise a PR when they drift.

## Fallback & alerts

- **Per-provider failure**: keep previous week's snapshot as authoritative; mark this week's row `status: "stale"` + `error_detail`; do not fail the run.
- **3+ providers fail in one run**: fail the run and email `leads@goabeto.com`.
- **Delta > 2pp**: always email + include source URL + diff table.
- **PR always requires review**: no auto-merge — Nuno eyeballs the diff before `FALLBACK_LOAN_PRODUCTS` changes ship.

## Manual audit flow

New admin route `/admin/loan-rates` (gated by `ADMIN_TOKEN` cookie header, same pattern as other admin pages in the Abeto ecosystem). One-page dashboard:

- Table: provider · app rate (TAE min–max) · last scraped rate · delta · last_checked · status badge · source link
- "Refresh this provider" button → POSTs to `/api/admin/loan-rates/refresh?provider=X` → runs the same scraper module on-demand
- "Approve latest" button → creates the same PR the cron would have
- Highlighting: delta > 1pp amber, > 2pp red

Adds ~1 day of work but massively reduces trust risk when an installer asks "where did you get 6.5%?"

## Dependencies

- `cheerio` (~1MB), `undici` (built-in in Node 20), `playwright-core` (~80MB) — only in CI, not in production bundle
- No new runtime deps for the Next.js app except `/admin/loan-rates` page (pure client)

## Rollout

1. **Week 0 — foundation**: create `loan_rate_snapshots` table; write 4 static scrapers (Cetelem, Younited, Bankinter, ICO Verde); wire GitHub Action to log-only (no PR, no email)
2. **Week 1 — wider coverage**: add 3 more static (Cofidis, BBVA) + first 2 Playwright scrapers (Santander, CaixaBank); enable email alerts
3. **Week 2 — full coverage**: remaining Playwright scrapers + Fintonic via Kelisto; enable auto-PR
4. **Week 3 — admin UI**: build `/admin/loan-rates` dashboard
5. **Ongoing — manual audit every 6 weeks**: Nuno spot-checks 3 random providers directly on their websites to catch blind spots

## Out of scope (explicit)

- Real-time rate calls from the funnel itself (latency + rate-limit risk)
- Personalised quote integrations with individual bank APIs (no public APIs exist for most)
- Historical rate charting in the user-facing UI (Phase 3 — add once 6+ months of snapshots accumulated)

## Open questions for Nuno

1. Admin auth: reuse an existing `ADMIN_TOKEN` pattern, or add Supabase Auth?
2. Who owns review of the weekly PR — Nuno, or rotate with Rocio?
3. Acceptable rate-staleness SLO: 1 week? 2 weeks? This sets how loud "stale" alerts should be.
