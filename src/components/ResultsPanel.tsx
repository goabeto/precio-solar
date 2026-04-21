"use client";

import type { CalculationResult } from "./SolarCalculator";
import SubsidyCard from "./SubsidyCard";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro, formatNumber } from "@/i18n/formatters";

interface ResultsPanelProps {
  result: CalculationResult;
  onNext: () => void;
  onSkipFinancing?: () => void;
  onReset: () => void;
}

export default function ResultsPanel({ result, onNext, onSkipFinancing, onReset }: ResultsPanelProps) {
  const { t, locale } = useTranslation();
  const { system, pricing, savings, financing, location } = result;

  const loans = financing.allProducts || [];
  const bestLoan = loans[0] || null;
  const hasSubsidies = pricing.subsidies && pricing.subsidies.length > 0;
  const estimateNotices: string[] = [];
  if (!system.pvgisSource) estimateNotices.push(t("results.noticePvgis"));
  if (location.geocodingPrecision === "prefix-fallback") estimateNotices.push(t("results.noticeGeocode"));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          {t("results.title", { city: location.city || location.region })}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("results.systemSummary", {
            kwp: system.kwp,
            panelCount: system.panelCount,
            production: formatNumber(system.annualProductionKwh, locale),
          })}
        </p>
        {estimateNotices.length > 0 && (
          <div className="mt-3 text-left mx-auto max-w-lg bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-900 font-medium">{t("results.noticeHeading")}</p>
            <ul className="text-xs text-amber-900/80 mt-1 list-disc list-inside space-y-0.5">
              {estimateNotices.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Price Breakdown Card */}
      <div className="bg-card rounded-2xl shadow-ambient p-6">
        <h3 className="font-heading font-bold text-lg mb-4">{t("results.estimatedPrice")}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t("results.installationCost")}</span>
            <span className="font-bold text-lg">{formatEuro(pricing.estimatedCost, locale)}</span>
          </div>
          {pricing.subsidyAmount > 0 && (
            <div className="flex justify-between items-center text-success-foreground">
              <span>{t("results.subsidyApplied")}</span>
              <span className="font-bold text-lg">-{formatEuro(pricing.subsidyAmount, locale)}</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <span className="font-bold text-foreground">{t("results.netCost")}</span>
            <span className="font-heading font-bold text-2xl text-primary">
              {formatEuro(pricing.netCost, locale)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("results.priceRange", {
              min: formatEuro(pricing.priceMin, locale),
              max: formatEuro(pricing.priceMax, locale),
              euroPerKwp: pricing.euroPerKwp,
            })}
          </p>
        </div>
      </div>

      {/* Subsidies Section */}
      <div className="bg-card rounded-2xl shadow-ambient p-6">
        <h3 className="font-heading font-bold text-lg mb-1">
          {t("results.subsidiesIn", { region: location.region || location.city })}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("results.subsidiesDesc")}
        </p>
        {hasSubsidies ? (
          <div className="space-y-3">
            {pricing.subsidies.map((s) => (
              <SubsidyCard key={s.id} subsidy={s} />
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              {t("results.subsidyNote", { amount: formatEuro(pricing.subsidyAmount, locale) })}
            </p>
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground">
              {t("results.noSubsidies")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("results.noSubsidiesHint")}
            </p>
          </div>
        )}
      </div>

      {/* Savings Comparison */}
      <div className="bg-card rounded-2xl shadow-ambient p-6">
        <h3 className="font-heading font-bold text-lg mb-4">{t("results.monthlySaving")}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-xl bg-destructive/30">
            <p className="text-sm text-muted-foreground mb-1">{t("results.youPayNow")}</p>
            <p className="text-2xl font-heading font-bold text-destructive-foreground">
              {savings.currentMonthlyBill} &euro;<span className="text-sm font-normal">{t("results.perMonth")}</span>
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-success/50">
            <p className="text-sm text-muted-foreground mb-1">{t("results.withSolar")}</p>
            <p className="text-2xl font-heading font-bold text-success-foreground">
              {Math.max(0, savings.currentMonthlyBill - savings.monthlySaving)} &euro;
              <span className="text-sm font-normal">{t("results.perMonth")}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-muted-foreground">
            {t("results.youSave")}{" "}
            <span className="font-bold text-success-foreground">
              {formatEuro(savings.annualSaving, locale)}{t("results.perYear")}
            </span>{" "}
            &middot; {t("results.paybackIn")}{" "}
            <span className="font-bold">{t("results.years", { years: savings.paybackYears })}</span>
          </p>
        </div>
      </div>

      {/* Financing Summary */}
      <div className="bg-card rounded-2xl shadow-ambient p-6">
        <h3 className="font-heading font-bold text-lg mb-1">{t("results.paymentOptions")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("results.paymentOptionsDesc")}
        </p>

        {/* 3-column summary: Cash / Best Loan / Subscription */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Cash */}
          <div className="border border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("results.cash")}</p>
            <p className="text-xl font-heading font-bold">{formatEuro(pricing.netCost, locale)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("results.cashDesc")}</p>
          </div>

          {/* Best Loan */}
          <div className="border-2 border-primary rounded-xl p-4 text-center bg-primary/5">
            <p className="text-xs text-muted-foreground mb-1">{t("results.financing")}</p>
            <p className="text-xl font-heading font-bold text-primary">
              {bestLoan ? `${bestLoan.monthly} \u20AC` : "-"}<span className="text-sm font-normal">{t("results.perMonth")}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bestLoan
                ? `${bestLoan.provider} · ${bestLoan.taeMin ?? "-"}% TAE`
                : t("results.noFinancing")}
            </p>
          </div>

          {/* Subscription */}
          <div className="border border-border rounded-xl p-4 text-center bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">{t("results.subscription")}</p>
            <p className="text-xl font-heading font-bold">
              {financing.subscription.monthly} &euro;
              <span className="text-sm font-normal">{t("results.perMonth")}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t("results.subscriptionDesc")}</p>
          </div>
        </div>

        {/* Financing count + CTA */}
        {loans.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            {loans.length === 1
              ? t("results.financingCount.one")
              : t("results.financingCount.other", { count: loans.length })}
            {" "}
            {t("results.compareAllHint")}
          </p>
        )}
      </div>

      {/* CTA — visible without scrolling */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onNext}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors shadow-ambient"
        >
          {t("results.compareFinancing")}
        </button>
        <div className="flex gap-3">
          {onSkipFinancing && (
            <button
              onClick={onSkipFinancing}
              className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Pago al contado &mdash; ir a instaladores
            </button>
          )}
          <button
            onClick={onReset}
            className="px-6 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("results.recalculate")}
          </button>
        </div>
      </div>
    </div>
  );
}
