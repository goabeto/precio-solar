"use client";

import { useTranslation } from "@/i18n/useTranslation";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  const next = locale === "es" ? "en" : "es";

  return (
    <button
      onClick={() => setLocale(next as "es" | "en")}
      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground/30"
      aria-label={t("lang.switchTo")}
      title={t("lang.switchTo")}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
