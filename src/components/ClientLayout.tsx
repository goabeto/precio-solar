"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import type { Locale } from "@/i18n/index";
import LocaleProvider from "@/i18n/LocaleProvider";
import { useTranslation } from "@/i18n/useTranslation";
import LanguageToggle from "./LanguageToggle";
import AIChatWidget from "./AIChatWidget";
import CookieNotice from "./CookieNotice";

const SITE_NAME = "Precio Solar";

function Nav() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-40 w-full glass shadow-ambient">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 text-xl font-heading font-extrabold text-foreground tracking-tight hover:text-primary transition-colors"
        >
          <Image src="/logo.png" alt="Precio Solar" width={40} height={40} className="w-10 h-10" />
          {SITE_NAME}
        </a>
        <div className="flex items-center gap-3 sm:gap-5 text-sm text-muted-foreground">
          <a
            href="/blog"
            className="hover:text-foreground transition-colors hidden sm:block"
          >
            Blog
          </a>
          <a
            href="/guias"
            className="hover:text-foreground transition-colors hidden sm:block"
          >
            {t("nav.guides")}
          </a>
          <a
            href="/comparar-financiacion"
            className="hover:text-foreground transition-colors hidden sm:block"
          >
            {t("nav.compareFinancing")}
          </a>
          <a
            href="/revisar-propuesta"
            className="hover:text-foreground transition-colors hidden sm:block"
          >
            {t("nav.reviewProposal")}
          </a>
          <LanguageToggle />
          <a
            href="/"
            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-ambient"
          >
            {t("nav.calculatePrice")}
          </a>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-surface mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground">
          <div>
            <p className="font-heading text-base font-bold text-foreground mb-3">
              {SITE_NAME}
            </p>
            <p className="max-w-xs leading-relaxed">{t("footer.description")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-3">{t("footer.tools")}</p>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-foreground transition-colors">
                  {t("footer.solarCalculator")}
                </a>
              </li>
              <li>
                <a
                  href="/comparar-financiacion"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.compareFinancing")}
                </a>
              </li>
              <li>
                <a
                  href="/revisar-propuesta"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.reviewProposal")}
                </a>
              </li>
              <li>
                <a
                  href="/guias"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.guides")}
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-3">{t("footer.legal")}</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="/politica-privacidad"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="/aviso-legal"
                  className="hover:text-foreground transition-colors"
                >
                  {t("footer.legalNotice")}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>
        {/* Trust line */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            &#128274; Sin llamadas comerciales &middot; No compartimos tus datos &middot; Puedes solicitar tu eliminacion en cualquier momento
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
          <span>
            &copy; {new Date().getFullYear()} {SITE_NAME}.{" "}
            {t("footer.copyright")}
          </span>
          <a
            href="https://tuenergiaverde.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            tuenergiaverde.es &mdash; Directorio de instaladores
          </a>
        </div>
      </div>
    </footer>
  );
}

interface ClientLayoutProps {
  initialLocale: Locale;
  children: ReactNode;
}

export default function ClientLayout({
  initialLocale,
  children,
}: ClientLayoutProps) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <Nav />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {process.env.NEXT_PUBLIC_ELEVENLABS_ENABLED === "true" && <AIChatWidget />}
      <CookieNotice />
    </LocaleProvider>
  );
}
