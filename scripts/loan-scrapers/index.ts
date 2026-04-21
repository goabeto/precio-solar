import { cetelem } from "./cetelem";
import type { LoanScraper } from "./_types";

// Phase 0: one reference scraper (Cetelem — clearest static HTML).
// Phase 1+ will add Younited, Bankinter, ICO Verde, etc. — see docs/loan-rate-monitoring-plan.md.
export const SCRAPERS: LoanScraper[] = [cetelem];
