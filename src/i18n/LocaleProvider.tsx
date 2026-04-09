"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type Locale,
  type Dictionary,
  getDictionary,
  translate,
  COOKIE_NAME,
} from "./index";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dictionary: Dictionary;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  initialLocale: Locale;
  children: ReactNode;
}

export default function LocaleProvider({
  initialLocale,
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    // Persist to cookie (1 year)
    document.cookie = `${COOKIE_NAME}=${l};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // Update <html lang> attribute immediately
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(dictionary, key, params),
    [dictionary]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, dictionary }),
    [locale, setLocale, t, dictionary]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
