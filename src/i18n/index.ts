export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";
export const LOCALES: Locale[] = ["es", "en"];
export const COOKIE_NAME = "sj_lang";

export type Dictionary = Record<string, string>;

export function getDictionary(locale: Locale): Dictionary {
  // Dynamic import would be overkill for 2 locales — just map directly
  if (locale === "en") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./dictionaries/en").default;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./dictionaries/es").default;
}

/**
 * Translate a key with optional {{param}} interpolation.
 * Falls back to the key itself if not found.
 */
export function translate(
  dictionary: Dictionary,
  key: string,
  params?: Record<string, string | number>
): string {
  let text = dictionary[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return text;
}
