import type { Locale } from "./index";

const LOCALE_MAP: Record<Locale, string> = {
  es: "es-ES",
  en: "en-GB", // EUR currency + European date format for Spain context
};

/** Format a number as Euros: "5.940 €" (es) or "5,940 €" (en) */
export function formatEuro(n: number, locale: Locale = "es"): string {
  return n.toLocaleString(LOCALE_MAP[locale]) + " \u20AC";
}

/** Format a number with locale-appropriate separators */
export function formatNumber(n: number, locale: Locale = "es"): string {
  return n.toLocaleString(LOCALE_MAP[locale]);
}

/** Format a date for display */
export function formatDate(
  date: string | Date,
  locale: Locale = "es",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(
    LOCALE_MAP[locale],
    options ?? { month: "long", year: "numeric" }
  );
}

/** Format a time for display (HH:MM) */
export function formatTime(
  date: string | Date,
  locale: Locale = "es"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(LOCALE_MAP[locale], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
