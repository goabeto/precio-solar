"use client";

import { useContext } from "react";
import { LocaleContext, type LocaleContextValue } from "./LocaleProvider";

/**
 * Hook to access locale, translation function, and language setter.
 * Must be used within a <LocaleProvider>.
 */
export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LocaleProvider");
  }
  return ctx;
}
