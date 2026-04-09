"use client";

import { useState, useMemo } from "react";
import type { LoanProductInfo } from "./SolarCalculator";
import LoanCard from "./LoanCard";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro } from "@/i18n/formatters";

type SortOption = "recommended" | "tae" | "monthly" | "totalCost";
type ViewMode = "cards" | "table";

interface FinancingComparisonProps {
  loans: LoanProductInfo[];
  netCost: number;
  subscriptionMonthly?: number;
  /** Hide cash & subscription sections when used standalone */
  showCashAndSubscription?: boolean;
  /** Enable loan selection for contact flow */
  selectable?: boolean;
  /** Currently selected loan IDs */
  selectedIds?: Set<string>;
  /** Callback when a loan is toggled */
  onToggle?: (loanId: string) => void;
  /** Max number of selectable loans */
  maxSelections?: number;
}

/** Composite score: lower is better (0-100 scale, inverted for display) */
function computeScore(loan: LoanProductInfo): number {
  const taeScore = Math.min((loan.taeMin ?? 10) / 15, 1); // 0-1, lower TAE = lower score
  const digitalScore = loan.digital ? 0 : 1;
  const speedMap: Record<string, number> = { instant: 0, "24h": 0.2, "48h": 0.4, "5_days": 0.7, "10_days": 1 };
  const speedScore = speedMap[loan.approvalSpeed || "10_days"] ?? 0.8;
  const subsidyScore = loan.subsidyCompatible ? 0 : 1;
  const feeScore = Math.min((loan.openingFeePct || 0) / 3, 1);

  return taeScore * 0.4 + digitalScore * 0.2 + speedScore * 0.2 + subsidyScore * 0.1 + feeScore * 0.1;
}

export default function FinancingComparison({
  loans,
  netCost,
  subscriptionMonthly,
  showCashAndSubscription = false,
  selectable = false,
  selectedIds,
  onToggle,
  maxSelections = 3,
}: FinancingComparisonProps) {
  const { t, locale } = useTranslation();
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [showEducation, setShowEducation] = useState(false);

  const sortedLoans = useMemo(() => {
    const scored = loans.map((l) => ({ ...l, _score: computeScore(l) }));
    switch (sortBy) {
      case "recommended":
        return scored.sort((a, b) => a._score - b._score);
      case "tae":
        return scored.sort((a, b) => (a.taeMin ?? 99) - (b.taeMin ?? 99));
      case "monthly":
        return scored.sort((a, b) => a.monthly - b.monthly);
      case "totalCost":
        return scored.sort(
          (a, b) =>
            a.monthly * (a.termMaxMonths || 120) - b.monthly * (b.termMaxMonths || 120)
        );
      default:
        return scored;
    }
  }, [loans, sortBy]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{t("financing.sortBy")}:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-sm border border-input rounded-lg px-3 py-1.5 bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
          >
            <option value="recommended">{t("financing.sortRecommended")}</option>
            <option value="tae">{t("financing.sortTae")}</option>
            <option value="monthly">{t("financing.sortMonthly")}</option>
            <option value="totalCost">{t("financing.sortTotalCost")}</option>
          </select>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              viewMode === "cards" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t("financing.viewCards")}
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t("financing.viewTable")}
          </button>
        </div>
      </div>

      {/* Cash & subscription summary (when shown) */}
      {showCashAndSubscription && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="border border-border rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-foreground">{t("results.cash")}</p>
                <p className="text-xs text-muted-foreground">{t("results.cashDesc")}</p>
              </div>
              <p className="text-xl font-heading font-bold">{formatEuro(netCost, locale)}</p>
            </div>
          </div>
          {subscriptionMonthly != null && (
            <div className="border border-border rounded-xl p-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">{t("results.subscription")}</p>
                  <p className="text-xs text-muted-foreground">{t("results.subscriptionDesc")}</p>
                </div>
                <p className="text-xl font-heading font-bold">
                  {subscriptionMonthly} &euro;
                  <span className="text-sm font-normal">{t("results.perMonth")}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection hint */}
      {selectable && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-sm text-foreground">
            {t("financing.selectHint", { max: maxSelections })}
          </p>
          <p className="text-sm font-bold text-primary">
            {selectedIds?.size || 0} / {maxSelections}
          </p>
        </div>
      )}

      {/* Card view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedLoans.map((loan, i) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              netCost={netCost}
              isBest={i === 0 && !selectable}
              showCta={!selectable}
              selectable={selectable}
              selected={selectedIds?.has(loan.id) || false}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {selectable && <th className="p-3 w-10"></th>}
                <th className="text-left p-3 font-medium text-muted-foreground">{t("financing.provider")}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">TAE</th>
                <th className="text-right p-3 font-medium text-muted-foreground">TIN</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{t("financing.monthlyPayment")}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{t("results.term")}</th>
                <th className="text-right p-3 font-medium text-muted-foreground">{t("results.totalCost")}</th>
                <th className="text-center p-3 font-medium text-muted-foreground">{t("financing.digital")}</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedLoans.map((loan, i) => {
                const termYears = loan.termMaxMonths ? Math.round(loan.termMaxMonths / 12) : null;
                const totalPaid = loan.monthly * (loan.termMaxMonths || 120);
                return (
                  <tr
                    key={loan.id}
                    className={`border-b border-border last:border-0 ${
                      selectable && selectedIds?.has(loan.id)
                        ? "bg-primary/5"
                        : i === 0 && !selectable
                          ? "bg-primary/5"
                          : "hover:bg-muted/30"
                    } ${selectable ? "cursor-pointer" : ""}`}
                    onClick={selectable && onToggle ? () => onToggle(loan.id) : undefined}
                  >
                    {selectable && (
                      <td className="p-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedIds?.has(loan.id) ? "border-primary bg-primary" : "border-muted-foreground/40"
                        }`}>
                          {selectedIds?.has(loan.id) && (
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="p-3">
                      <p className="font-bold text-foreground">{loan.provider}</p>
                      <p className="text-xs text-muted-foreground">{t("productType." + loan.productType)}</p>
                    </td>
                    <td className="p-3 text-right font-bold">{loan.taeMin != null ? `${loan.taeMin}%` : "-"}</td>
                    <td className="p-3 text-right">{loan.tinMin != null ? `${loan.tinMin}%` : "-"}</td>
                    <td className="p-3 text-right font-bold text-primary">{loan.monthly} &euro;</td>
                    <td className="p-3 text-right">{termYears ? `${termYears}a` : "-"}</td>
                    <td className="p-3 text-right">{formatEuro(Math.round(totalPaid), locale)}</td>
                    <td className="p-3 text-center">{loan.digital ? "✓" : "-"}</td>
                    <td className="p-3">
                      {selectable ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggle?.(loan.id); }}
                          className={`text-xs font-medium whitespace-nowrap px-3 py-1 rounded-full transition-colors ${
                            selectedIds?.has(loan.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {selectedIds?.has(loan.id) ? t("financing.selected") : t("financing.select")}
                        </button>
                      ) : loan.productUrl ? (
                        <a
                          href={loan.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline whitespace-nowrap"
                        >
                          {t("financing.apply")} &rarr;
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Educational section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <span className="font-medium text-foreground">{t("financing.understandFinancing")}</span>
          <span className="text-muted-foreground text-xl transition-transform" style={{ transform: showEducation ? "rotate(180deg)" : "none" }}>
            &#9660;
          </span>
        </button>
        {showEducation && (
          <div className="px-4 pb-4 space-y-4 text-sm text-muted-foreground border-t border-border pt-4">
            <div>
              <p className="font-medium text-foreground mb-1">{t("financing.taeVsTinTitle")}</p>
              <p>{t("financing.taeVsTinDesc")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{t("financing.openingFeeTitle")}</p>
              <p>{t("financing.openingFeeDesc")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{t("financing.subsidyFinancingTitle")}</p>
              <p>{t("financing.subsidyFinancingDesc")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">{t("financing.ppaTitle")}</p>
              <p>{t("financing.ppaDesc")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
