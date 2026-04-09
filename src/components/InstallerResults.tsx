"use client";

import { useState, useEffect } from "react";
import type { CalculationResult } from "./SolarCalculator";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro as fmtEuro } from "@/i18n/formatters";

interface InstallerCert {
  id: string;
  name: string;
  body: string;
  verified: boolean;
}

interface InstallerBrand {
  id: string;
  name: string;
  category: string;
  verified: boolean;
}

interface InstallerPricing {
  id: string;
  configType: string;
  priceMin: number | null;
  priceMax: number | null;
  systemSize: string | null;
  verified: boolean;
}

interface InstallerService {
  id: string;
  name: string;
  category: string;
}

export interface InstallerDetail {
  id: string;
  name: string;
  slug: string;
  city: string;
  region: string;
  description: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  verticals_served: string[] | null;
  phone: string | null;
  website: string | null;
  year_established: number | null;
  employee_count: string | null;
  certifications: InstallerCert[];
  equipment_brands: InstallerBrand[];
  pricing: InstallerPricing[];
  services: InstallerService[];
}

interface InstallerResultsProps {
  result: CalculationResult;
  onSelectInstallers: (ids: string[], installers: InstallerDetail[]) => void;
  onBack: () => void;
}

function InstallerCard({
  installer,
  isSelected,
  onToggle,
}: {
  installer: InstallerDetail;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t, locale } = useTranslation();

  const brandsByCategory = installer.equipment_brands.reduce<Record<string, string[]>>(
    (acc, b) => {
      const cat = b.category || "other";
      if (!acc[cat]) acc[cat] = [];
      if (!acc[cat].includes(b.name)) acc[cat].push(b.name);
      return acc;
    },
    {}
  );

  const priceRange = installer.pricing.length > 0
    ? installer.pricing.reduce(
        (acc, p) => ({
          min: p.priceMin && (!acc.min || p.priceMin < acc.min) ? p.priceMin : acc.min,
          max: p.priceMax && (!acc.max || p.priceMax > acc.max) ? p.priceMax : acc.max,
        }),
        { min: null as number | null, max: null as number | null }
      )
    : null;

  return (
    <div
      className={`bg-card rounded-xl border-2 transition-all ${
        isSelected ? "border-primary shadow-md" : "border-border hover:border-primary/40"
      }`}
    >
      {/* Collapsed header — always visible */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-foreground">{installer.name}</h3>
            <p className="text-sm text-muted-foreground">
              {installer.city}, {installer.region}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-1.5">
              {installer.google_rating && (
                <span className="text-amber-500 text-sm">
                  {"★".repeat(Math.floor(installer.google_rating))}
                  {"☆".repeat(5 - Math.floor(installer.google_rating))}
                  <span className="text-muted-foreground ml-1">
                    {installer.google_rating.toFixed(1)}
                  </span>
                </span>
              )}
              {installer.google_review_count != null && installer.google_review_count > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({installer.google_review_count} {t("installers.reviews")})
                </span>
              )}
            </div>

            {/* Certifications badges */}
            {installer.certifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {installer.certifications.map((c) => (
                  <span
                    key={c.id}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c.verified
                        ? "bg-green-100 text-green-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {/* Price range */}
            {priceRange && (priceRange.min || priceRange.max) && (
              <p className="text-sm mt-2 text-foreground">
                {priceRange.min && priceRange.max
                  ? `${fmtEuro(priceRange.min, locale)} - ${fmtEuro(priceRange.max, locale)}`
                  : priceRange.min
                  ? t("installers.from", { price: fmtEuro(priceRange.min, locale) })
                  : t("installers.upTo", { price: fmtEuro(priceRange.max!, locale) })}
              </p>
            )}
          </div>

          {/* Selection checkbox */}
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
              isSelected
                ? "border-primary bg-primary text-white"
                : "border-border"
            }`}
          >
            {isSelected && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-xs text-primary hover:underline mt-2"
        >
          {expanded ? t("installers.viewLess") : t("installers.viewDetails")}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {/* Description */}
          {installer.description && (
            <p className="text-sm text-muted-foreground">{installer.description}</p>
          )}

          {/* Company info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {installer.year_established && (
              <span className="text-muted-foreground">
                {t("installers.foundedIn", { year: installer.year_established })}
              </span>
            )}
            {installer.employee_count && (
              <span className="text-muted-foreground">
                {t("installers.employees", { count: installer.employee_count })}
              </span>
            )}
          </div>

          {/* Equipment brands by category */}
          {Object.keys(brandsByCategory).length > 0 && (
            <div>
              <p className="text-xs font-bold text-foreground mb-1.5">{t("installers.brands")}</p>
              <div className="space-y-1">
                {Object.entries(brandsByCategory).map(([cat, brands]) => (
                  <div key={cat} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground min-w-[80px]">
                      {t("brandCat." + cat)}:
                    </span>
                    <span className="text-foreground">
                      {brands.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {installer.services.length > 0 && (
            <div>
              <p className="text-xs font-bold text-foreground mb-1.5">{t("installers.services")}</p>
              <div className="flex flex-wrap gap-1.5">
                {installer.services.map((s) => (
                  <span key={s.id} className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                    {t("service." + s.name)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing details */}
          {installer.pricing.length > 0 && (
            <div>
              <p className="text-xs font-bold text-foreground mb-1.5">{t("installers.publishedPrices")}</p>
              <div className="space-y-1">
                {installer.pricing.map((p) => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {p.configType}{p.systemSize ? ` (${p.systemSize})` : ""}
                    </span>
                    <span className="text-foreground">
                      {p.priceMin && p.priceMax
                        ? `${fmtEuro(p.priceMin, locale)} - ${fmtEuro(p.priceMax, locale)}`
                        : p.priceMin
                        ? fmtEuro(p.priceMin, locale)
                        : p.priceMax
                        ? fmtEuro(p.priceMax, locale)
                        : "-"}
                      {p.verified && " ✓"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            {installer.website && (
              <a
                href={installer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-primary hover:underline"
              >
                {t("installers.visitWebsite")} &rarr;
              </a>
            )}
            <a
              href={`https://tuenergiaverde.es/${installer.city?.toLowerCase().replace(/\s+/g, "-")}/${installer.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-tertiary hover:underline"
            >
              Ver perfil en tuenergiaverde.es &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstallerResults({
  result,
  onSelectInstallers,
  onBack,
}: InstallerResultsProps) {
  const [installers, setInstallers] = useState<InstallerDetail[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dbUnavailable, setDbUnavailable] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => {
    async function fetchInstallers() {
      try {
        const params = new URLSearchParams({
          region: result.location.region,
          city: result.location.city,
        });
        const res = await fetch(`/api/installers?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.error === "database_unavailable") {
            setDbUnavailable(true);
          }
          setInstallers(data.installers || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchInstallers();
  }, [result.location.region, result.location.city]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">
          {t("installers.searching", { city: result.location.city || result.location.region })}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold">
          {t("installers.title", { city: result.location.city || result.location.region })}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("installers.subtitle")}
        </p>
      </div>

      {dbUnavailable ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-foreground font-bold mb-2">
            {t("installers.dbUnavailableTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("installers.dbUnavailableDesc", { region: result.location.region })}
          </p>
        </div>
      ) : installers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {t("installers.noResultsTitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("installers.noResultsDesc", { region: result.location.region })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {installers.map((installer) => (
            <InstallerCard
              key={installer.id}
              installer={installer}
              isSelected={selected.has(installer.id)}
              onToggle={() => toggleSelect(installer.id)}
            />
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {t("installers.selectedCount", { count: selected.size })}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() =>
            onSelectInstallers(
              Array.from(selected),
              installers.filter((i) => selected.has(i.id))
            )
          }
          disabled={selected.size === 0 && installers.length > 0}
          className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {installers.length === 0
            ? t("installers.requestContact")
            : t("installers.sendRequest", { count: selected.size })}
        </button>
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("installers.back")}
        </button>
      </div>
    </div>
  );
}
