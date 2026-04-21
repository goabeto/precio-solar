-- Loan rate snapshots — weekly scraper output.
-- See docs/loan-rate-monitoring-plan.md for the full Phase 0..3 rollout.
-- Run this in the Supabase Dashboard SQL Editor for project craacmypyqvxqqdssivc.

CREATE TABLE IF NOT EXISTS loan_rate_snapshots (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id  text        NOT NULL,
  tae_min      numeric,
  tae_max      numeric,
  tin_min      numeric,
  tin_max      numeric,
  source_url   text,
  status       text        NOT NULL CHECK (status IN ('ok', 'stale', 'error')),
  error_detail text,
  checked_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS loan_rate_snapshots_provider_checked_at_idx
  ON loan_rate_snapshots (provider_id, checked_at DESC);

ALTER TABLE loan_rate_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON loan_rate_snapshots FOR ALL
  USING (true) WITH CHECK (true);
