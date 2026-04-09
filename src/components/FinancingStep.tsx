"use client";

import { useState, useCallback } from "react";
import type { CalculationResult, LoanProductInfo } from "./SolarCalculator";
import FinancingComparison from "./FinancingComparison";
import { useTranslation } from "@/i18n/useTranslation";

interface FinancingStepProps {
  result: CalculationResult;
  onNext: (selectedLoans: LoanProductInfo[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

const MAX_SELECTIONS = 3;

export default function FinancingStep({ result, onNext, onSkip, onBack }: FinancingStepProps) {
  const { t } = useTranslation();
  const loans = result.financing.allProducts || [];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const handleContinue = () => {
    const selected = loans.filter((l) => selectedIds.has(l.id));
    onNext(selected);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          {t("financing.title")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("financing.subtitle", { count: loans.length })}
        </p>
      </div>

      {/* Financing comparison with selection */}
      <FinancingComparison
        loans={loans}
        netCost={result.pricing.netCost}
        subscriptionMonthly={result.financing.subscription.monthly}
        showCashAndSubscription
        selectable
        selectedIds={selectedIds}
        onToggle={handleToggle}
        maxSelections={MAX_SELECTIONS}
      />

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleContinue}
          disabled={selectedIds.size === 0}
          className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {selectedIds.size > 0
            ? t("financing.requestInfo", { count: selectedIds.size })
            : t("financing.selectToContine")}
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          {t("financing.skipToInstallers")}
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("installers.back")}
        </button>
      </div>
    </div>
  );
}
