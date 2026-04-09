"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro, formatDate } from "@/i18n/formatters";
import type { SubsidyInfo } from "./SolarCalculator";

interface SubsidyCardProps {
  subsidy: SubsidyInfo;
}

export default function SubsidyCard({ subsidy }: SubsidyCardProps) {
  const { t, locale } = useTranslation();
  const isActive = subsidy.status === "active" || subsidy.status === "confirmed";

  return (
    <div className={`border rounded-xl p-4 ${isActive ? "border-success bg-success/10" : "border-border bg-muted/30"}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground truncate">{subsidy.name}</p>
          {subsidy.region && (
            <p className="text-xs text-muted-foreground">{subsidy.region}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {subsidy.estimatedValue > 0 ? (
            <p className="font-heading font-bold text-success-foreground">
              -{formatEuro(subsidy.estimatedValue, locale)}
            </p>
          ) : subsidy.amount ? (
            <p className="text-sm font-bold text-muted-foreground">{subsidy.amount}</p>
          ) : null}
        </div>
      </div>
      {subsidy.eligibility && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{subsidy.eligibility}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isActive ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
        }`}>
          {isActive ? t("status.active") : subsidy.status === "pending" ? t("status.pending") : subsidy.status}
        </span>
        {subsidy.url && (
          <a
            href={subsidy.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            {t("status.officialSource")} &rarr;
          </a>
        )}
      </div>
      {subsidy.lastVerified && (
        <p className="text-xs text-muted-foreground mt-1">
          {t("status.verified", { date: formatDate(subsidy.lastVerified, locale) })}
        </p>
      )}
    </div>
  );
}
