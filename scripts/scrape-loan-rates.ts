#!/usr/bin/env -S npx tsx
/**
 * Weekly loan-rate scraper runner (Phase 0 — log-only).
 *
 * Usage:
 *   npx tsx scripts/scrape-loan-rates.ts              # log to stdout, no DB write
 *   npx tsx scripts/scrape-loan-rates.ts --persist    # also insert into loan_rate_snapshots
 *
 * Invoked weekly by .github/workflows/loan-rates.yml (Mon 08:00 Madrid).
 * See docs/loan-rate-monitoring-plan.md for rollout phases and alerting.
 */
import { createClient } from "@supabase/supabase-js";
import { SCRAPERS } from "./loan-scrapers";
import type { Snapshot } from "./loan-scrapers/_types";

const PER_PROVIDER_TIMEOUT_MS = 30_000;

async function runOne(scraper: (typeof SCRAPERS)[number]): Promise<Snapshot> {
  const checkedAt = new Date().toISOString();
  try {
    const result = await Promise.race([
      scraper.fetch(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("runner timeout")), PER_PROVIDER_TIMEOUT_MS)
      ),
    ]);
    const allNull = result.taeMin == null && result.taeMax == null && result.tinMin == null && result.tinMax == null;
    return {
      providerId: scraper.providerId,
      sourceUrl: scraper.sourceUrl,
      status: allNull ? "stale" : "ok",
      taeMin: result.taeMin,
      taeMax: result.taeMax,
      tinMin: result.tinMin,
      tinMax: result.tinMax,
      errorDetail: allNull ? "scraper returned no values" : undefined,
      checkedAt,
    };
  } catch (err) {
    return {
      providerId: scraper.providerId,
      sourceUrl: scraper.sourceUrl,
      status: "error",
      taeMin: null,
      taeMax: null,
      tinMin: null,
      tinMax: null,
      errorDetail: err instanceof Error ? err.message : String(err),
      checkedAt,
    };
  }
}

function logSnapshot(s: Snapshot) {
  const fmt = (n: number | null) => (n == null ? "—" : n.toFixed(2) + "%");
  console.log(
    `[${s.status.padEnd(5)}] ${s.providerId.padEnd(12)} TAE ${fmt(s.taeMin)}–${fmt(s.taeMax)} · TIN ${fmt(s.tinMin)}–${fmt(s.tinMax)}` +
      (s.errorDetail ? `  (${s.errorDetail})` : "")
  );
}

async function persist(snapshots: Snapshot[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, key);
  const rows = snapshots.map((s) => ({
    provider_id: s.providerId,
    tae_min: s.taeMin,
    tae_max: s.taeMax,
    tin_min: s.tinMin,
    tin_max: s.tinMax,
    source_url: s.sourceUrl,
    status: s.status,
    error_detail: s.errorDetail ?? null,
    checked_at: s.checkedAt,
  }));
  const { error } = await supabase.from("loan_rate_snapshots").insert(rows);
  if (error) throw new Error(`supabase insert: ${error.message}`);
  console.log(`persisted ${rows.length} snapshot(s)`);
}

async function main() {
  const persistFlag = process.argv.includes("--persist");
  console.log(`loan-rate scraper · providers=${SCRAPERS.length} · persist=${persistFlag}`);

  const snapshots = await Promise.all(SCRAPERS.map(runOne));
  snapshots.forEach(logSnapshot);

  if (persistFlag) {
    await persist(snapshots);
  }

  const failures = snapshots.filter((s) => s.status === "error");
  if (failures.length >= Math.max(3, Math.ceil(SCRAPERS.length / 2))) {
    // Phase 0: fail the job only if a majority (or 3+) providers error out.
    // Phase 1 will tighten this and add email alerting.
    console.error(`too many failures: ${failures.length}/${SCRAPERS.length}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
