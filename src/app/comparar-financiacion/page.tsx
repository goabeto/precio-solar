"use client";

import { useState, useCallback } from "react";
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
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
          {t("financingPage.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("financingPage.subtitle")}
        </p>
      </div>

      {/* Search form */}
      <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("financingPage.loanAmount")}
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={1000}
                max={100000}
                step={500}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-lg focus:ring-2 focus:ring-ring outline-none transition pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">&euro;</span>
            </div>
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("financingPage.preferredTerm")}
            </label>
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-lg focus:ring-2 focus:ring-ring outline-none transition"
            >
              {TERM_OPTIONS.map((opt) => (
                <option key={opt.months} value={opt.months}>
                  {t("financingPage.yearsOption", { years: opt.label })}
                </option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("financingPage.searching")}
                </span>
              ) : (
                t("financingPage.search")
              )}
            </button>
          </div>
        </div>
      </div>

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
      <div className="mt-12 text-center bg-muted/30 rounded-2xl p-8">
        <p className="text-lg font-heading font-bold text-foreground mb-2">
          {t("financingPage.ctaTitle")}
        </p>
        <p className="text-muted-foreground mb-4">
          {t("financingPage.ctaDesc")}
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors"
        >
          {t("financingPage.ctaButton")}
        </a>
      </div>
    </div>
  );
}
