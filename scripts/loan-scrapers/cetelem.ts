import * as cheerio from "cheerio";
import type { LoanScraper, ScrapedRate } from "./_types";

// Cetelem publishes TAE/TIN ranges in plain text on the product page.
// Representative value format from research (2026-04): "TIN desde 7,99% hasta 12,90% ... TAE desde 8,29% hasta 13,69%".
// This scraper is intentionally conservative — we extract the first numeric
// TAE range we find and the first TIN range. If Cetelem restructures the page,
// both parsers return nulls and the runner marks the snapshot as `stale`.

const SOURCE_URL = "https://www.cetelem.es/prestamos/prestamo-reforma";
const TIMEOUT_MS = 20_000;

function parseRange(haystack: string, label: "TAE" | "TIN"): { min: number | null; max: number | null } {
  // Match "LABEL desde X,XX% hasta Y,YY%" (comma or dot decimal).
  const re = new RegExp(
    `${label}[^%]*?desde\\s*(\\d+[.,]?\\d*)\\s*%[^%]*?hasta\\s*(\\d+[.,]?\\d*)\\s*%`,
    "i"
  );
  const m = haystack.match(re);
  if (!m) return { min: null, max: null };
  const toNum = (s: string) => parseFloat(s.replace(",", "."));
  return { min: toNum(m[1]), max: toNum(m[2]) };
}

async function fetchCetelem(): Promise<ScrapedRate> {
  const res = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; PrecioSolarLoanSnapshot/0.1; +https://preciosolar.com)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "es-ES,es;q=0.9",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Cetelem: HTTP ${res.status}`);
  const html = await res.text();

  // Pull all visible text so the regex doesn't depend on DOM structure.
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();

  const tae = parseRange(text, "TAE");
  const tin = parseRange(text, "TIN");

  return {
    taeMin: tae.min,
    taeMax: tae.max,
    tinMin: tin.min,
    tinMax: tin.max,
  };
}

export const cetelem: LoanScraper = {
  providerId: "cetelem",
  providerName: "Cetelem",
  sourceUrl: SOURCE_URL,
  fetch: fetchCetelem,
};
