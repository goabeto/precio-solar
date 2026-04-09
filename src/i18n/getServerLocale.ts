import { cookies } from "next/headers";
import { type Locale, DEFAULT_LOCALE, LOCALES, COOKIE_NAME } from "./index";

/**
 * Read the locale from the `sj_lang` cookie in a server component.
 * Falls back to "es" if not set or invalid.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (raw && LOCALES.includes(raw as Locale)) {
    return raw as Locale;
  }
  return DEFAULT_LOCALE;
}
