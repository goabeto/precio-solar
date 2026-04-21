// Shared types for loan rate scrapers. See docs/loan-rate-monitoring-plan.md.

export type ScrapeStatus = "ok" | "stale" | "error";

export interface ScrapedRate {
  taeMin: number | null;
  taeMax: number | null;
  tinMin: number | null;
  tinMax: number | null;
}

export interface LoanScraper {
  /** Stable provider identifier — matches FALLBACK_LOAN_PRODUCTS.id or similar. */
  providerId: string;
  /** Human-readable display name, used in logs. */
  providerName: string;
  /** Public URL the scraper reads. Included in the snapshot row for audit. */
  sourceUrl: string;
  /** Per-run fetch. Throw on unrecoverable errors; return nulls for fields that are not visible. */
  fetch: () => Promise<ScrapedRate>;
}

export interface Snapshot extends ScrapedRate {
  providerId: string;
  sourceUrl: string;
  status: ScrapeStatus;
  errorDetail?: string;
  checkedAt: string; // ISO-8601
}
