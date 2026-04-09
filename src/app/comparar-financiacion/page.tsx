"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { LoanProductInfo } from "@/components/SolarCalculator";
import FinancingComparison from "@/components/FinancingComparison";
import FinancingRequest from "@/components/FinancingRequest";
import { useTranslation } from "@/i18n/useTranslation";

const TERM_OPTIONS = [
  { months: 36, label: "3" },
  { months: 60, label: "5" },
  { months: 84, label: "7" },
  { months: 120, label: "10" },
  { months: 180, label: "15" },
  { months: 240, label: "20" },
];

const MAX_SELECTIONS = 3;

type PageStep = "search" | "request" | "success";

export default function CompararFinanciacionPage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(8000);
  const [termMonths, setTermMonths] = useState(120);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<LoanProductInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageStep, setPageStep] = useState<PageStep>("search");

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());
    try {
      const res = await fetch(`/api/financing?amount=${amount}&termMonths=${termMonths}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("financingPage.errorGeneric"));
        return;
      }
      setProducts(data.products);
    } catch {
      setError(t("financingPage.errorConnection"));
    } finally {
      setLoading(false);
    }
  }, [amount, termMonths, t]);

  const handleToggle = useCallback((loanId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) {
        next.delete(loanId);
      } else if (next.size < MAX_SELECTIONS) {
        next.add(loanId);
      }
      return next;
    });
  }, []);

  const selectedLoans = products?.filter((p) => selectedIds.has(p.id)) || [];

  // Success view after submitting financing request
  if (pageStep === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="text-5xl mb-4">&#9989;</div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
          {t("financingRequest.successTitle")}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t("financingRequest.successDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors"
          >
            {t("financingRequest.goToCalculator")}
          </a>
          <button
            onClick={() => {
              setPageStep("search");
              setSelectedIds(new Set());
            }}
            className="inline-block border border-border text-foreground px-8 py-3 rounded-xl font-heading font-bold hover:border-primary/40 hover:text-primary transition-colors"
          >
            {t("financingRequest.compareMore")}
          </button>
        </div>
      </div>
    );
  }

  // Financing request form (after selecting products)
  if (pageStep === "request") {
    return (
      <div className="py-12 sm:py-16 px-4">
        <FinancingRequest
          selectedLoans={selectedLoans}
          loanAmount={amount}
          loanTermMonths={termMonths}
          onSuccess={() => setPageStep("success")}
          onBack={() => setPageStep("search")}
        />
      </div>
    );
  }

  return (
    <>
    {/* Hero with background image — same structure as homepage */}
    <section className="relative w-full overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 z-0">
        <Image src="/hero-financing.jpg" alt="Solar panels against blue sky" fill className="object-cover object-bottom" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/92 via-[#0a1628]/75 to-[#0a1628]/50" />
      </div>
      <div className="relative z-10 w-full pt-16 sm:pt-20 pb-20 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
            13+ proveedores &middot; ICO Verde &middot; Bancos &middot; Fintech
          </div>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left — Context */}
            <div className="lg:col-span-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
                {t("financingPage.title")}
              </h1>
              <p className="text-white/80 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
                {t("financingPage.subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <a href="/" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                  Calculadora Solar
                </a>
                <a href="/revisar-propuesta" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                  Revisar Propuesta
                </a>
                <a href="/guias" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                  Guias
                </a>
              </div>
              <div className="flex items-center gap-8 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">2.5%</p>
                  <p className="text-xs sm:text-sm text-white/60">TAE desde (ICO Verde)</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">20 a&ntilde;os</p>
                  <p className="text-xs sm:text-sm text-white/60">Plazo maximo</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">0&euro;</p>
                  <p className="text-xs sm:text-sm text-white/60">Comision apertura</p>
                </div>
              </div>
            </div>
            {/* Right — Search form in glassmorphic card */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-xl p-1 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 pointer-events-none rounded-2xl" />
                <div className="relative z-10 bg-white rounded-xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-base font-heading font-extrabold text-foreground text-center">{t("financingPage.search")}</h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t("financingPage.loanAmount")}</label>
                    <div className="relative">
                      <input type="number" inputMode="numeric" min={1000} max={100000} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition pr-8" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">&euro;</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">{t("financingPage.preferredTerm")}</label>
                    <select value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition">
                      {TERM_OPTIONS.map((opt) => (
                        <option key={opt.months} value={opt.months}>{t("financingPage.yearsOption", { years: opt.label })}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={search} disabled={loading} className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-base font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {loading ? t("financingPage.searching") : t("financingPage.search")}
                  </button>
                  <p className="text-xs text-muted-foreground text-center">Comparacion gratuita y sin compromiso</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>

    <div className="max-w-4xl mx-auto px-4 pt-8 pb-16">

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded-lg bg-destructive text-destructive-foreground text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {products && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {products.length === 0
              ? t("financingPage.noResults")
              : t("financingPage.resultsCount", { count: products.length })}
          </p>

          {products.length > 0 && (
            <>
              <FinancingComparison
                loans={products}
                netCost={amount}
                showCashAndSubscription={false}
                selectable
                selectedIds={selectedIds}
                onToggle={handleToggle}
                maxSelections={MAX_SELECTIONS}
              />

              {/* Request info CTA */}
              <div className="sticky bottom-4 z-10">
                <button
                  onClick={() => setPageStep("request")}
                  disabled={selectedIds.size === 0}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                >
                  {selectedIds.size > 0
                    ? t("financing.requestInfo", { count: selectedIds.size })
                    : t("financing.selectToContine")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Cross-link */}
      <div className="mt-12 text-center bg-surface-container-low rounded-2xl p-8">
        <p className="text-lg font-heading font-extrabold text-foreground mb-2">
          {t("financingPage.ctaTitle")}
        </p>
        <p className="text-muted-foreground mb-4">
          {t("financingPage.ctaDesc")}
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors shadow-ambient"
        >
          {t("financingPage.ctaButton")}
        </a>
      </div>
    </div>

    {/* ── Como funciona ──────────────────────────────────────── */}
    <section className="py-16 px-4 sm:px-6 bg-surface-container-low">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground text-center mb-3">
          {t("home.howItWorks")}
        </h2>
        <p className="text-muted-foreground text-center max-w-lg mx-auto mb-10">
          {t("home.howItWorksSubtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {(["1", "2", "3", "4"] as const).map((n) => (
            <div key={n} className="text-center bg-white rounded-2xl shadow-ambient p-6">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-4">
                {n}
              </div>
              <h3 className="font-heading font-extrabold text-sm text-foreground mb-1">
                {t(`home.step${n}Title`)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t(`home.step${n}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Por que Precio Solar ────────────────────────────────── */}
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground text-center mb-10">
          {t("home.whyUs")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>
            </div>
            <h3 className="font-heading font-extrabold mb-2">{t("home.independent")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.independentDesc")}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <h3 className="font-heading font-extrabold mb-2">{t("home.transparent")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.transparentDesc")}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient text-center">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
            </div>
            <h3 className="font-heading font-extrabold mb-2">{t("home.fast")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.fastDesc")}</p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
