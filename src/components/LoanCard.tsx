"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro } from "@/i18n/formatters";
import type { LoanProductInfo } from "./SolarCalculator";

interface LoanCardProps {
  loan: LoanProductInfo;
  netCost: number;
  isBest?: boolean;
  showCta?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (loanId: string) => void;
}

export default function LoanCard({ loan, netCost, isBest = false, showCta = true, selectable = false, selected = false, onToggle }: LoanCardProps) {
  const { t, locale } = useTranslation();
  const termYears = loan.termMaxMonths ? Math.round(loan.termMaxMonths / 12) : null;
  const totalPaid = loan.monthly * (loan.termMaxMonths || 120);
  const totalInterest = totalPaid - netCost;

  return (
    <div
      className={`border rounded-xl p-4 relative transition-all ${
        selected
          ? "border-2 border-primary bg-primary/5 ring-1 ring-primary/20"
          : isBest
            ? "border-2 border-primary bg-primary/5"
            : "border-border"
      } ${selectable ? "cursor-pointer hover:border-primary/50" : ""}`}
      onClick={selectable && onToggle ? () => onToggle(loan.id) : undefined}
    >
      {/* Selection indicator */}
      {selectable && (
        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}
      {isBest && !selected && (
        <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full">
          {t("results.bestOption")}
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-foreground">{loan.provider}</p>
          <p className="text-xs text-muted-foreground">
            {t("productType." + loan.productType)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-heading font-bold text-primary">
            {loan.monthly} &euro;<span className="text-sm font-normal">{t("results.perMonth")}</span>
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-sm mb-3">
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">TAE</p>
          <p className="font-bold">{loan.taeMin != null ? `${loan.taeMin}%` : "-"}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">TIN</p>
          <p className="font-bold">{loan.tinMin != null ? `${loan.tinMin}%` : "-"}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">{t("results.term")}</p>
          <p className="font-bold">{termYears ? t("results.yearsUnit", { years: termYears }) : "-"}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">{t("results.totalCost")}</p>
          <p className="font-bold text-xs">{formatEuro(Math.round(totalPaid), locale)}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {loan.digital && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{t("results.online")}</span>
        )}
        {loan.subsidyCompatible && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{t("results.subsidyCompatible")}</span>
        )}
        {loan.approvalSpeed && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            {t("approval." + loan.approvalSpeed)}
          </span>
        )}
        {loan.openingFeePct > 0 && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {t("results.openingFee", { pct: loan.openingFeePct })}
          </span>
        )}
      </div>

      {/* CTA */}
      {showCta && loan.productUrl && (
        <a
          href={loan.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-center text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-lg transition-colors"
        >
          {t("financing.apply")} &rarr;
        </a>
      )}
    </div>
  );
}
