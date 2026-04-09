"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro as fmtEuro } from "@/i18n/formatters";

interface ReviewResult {
  location: { city: string; region: string };
  priceAnalysis: {
    quotedPrice: number;
    quotedEuroPerKwp: number;
    marketAvg: number;
    marketMin: number;
    marketMax: number;
    marketEuroPerKwp: number;
    score: "excellent" | "good" | "fair" | "high";
  };
  subsidyAnalysis: {
    available: {
      name: string;
      amount: string | null;
      estimatedValue: number;
      url: string | null;
      status: string;
    }[];
    bestAmount: number;
    subsidyIncluded: string;
    potentialSavings: number;
  };
  financingAnalysis: {
    offeredTae: number;
    offeredMonthly: number;
    offeredTermMonths: number;
    bestAvailableTae: number | null;
    bestAvailableProvider: string | null;
    score: "excellent" | "good" | "fair" | "high" | null;
  } | null;
  equipmentAnalysis: {
    panelBrand: string | null;
    panelRecognized: boolean | null;
    inverterBrand: string | null;
    inverterRecognized: boolean | null;
  };
  overallRating: "excellent" | "good" | "fair" | "review_recommended";
}

function getScoreLabel(score: string, t: (key: string) => string): { text: string; color: string; bg: string } {
  const styles: Record<string, { color: string; bg: string }> = {
    excellent: { color: "text-green-800", bg: "bg-green-100" },
    good: { color: "text-blue-800", bg: "bg-blue-100" },
    fair: { color: "text-amber-800", bg: "bg-amber-100" },
    high: { color: "text-red-800", bg: "bg-red-100" },
    review_recommended: { color: "text-red-800", bg: "bg-red-100" },
  };
  const s = styles[score] || styles.fair;
  return { text: t("score." + score), ...s };
}

function ScoreBadge({ score, t }: { score: string; t: (key: string) => string }) {
  const s = getScoreLabel(score, t);
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.color}`}>
      {s.text}
    </span>
  );
}

export default function RevisarPropuestaPage() {
  const { t, locale } = useTranslation();
  const [postalCode, setPostalCode] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [systemSize, setSystemSize] = useState("");
  const [panelCount, setPanelCount] = useState("");
  const [panelBrand, setPanelBrand] = useState("");
  const [inverterBrand, setInverterBrand] = useState("");
  const [includeBattery, setIncludeBattery] = useState(false);
  const [batteryKwh, setBatteryKwh] = useState("");
  const [subsidyIncluded, setSubsidyIncluded] = useState("unknown");
  const [financingTae, setFinancingTae] = useState("");
  const [financingMonthly, setFinancingMonthly] = useState("");
  const [financingTermMonths, setFinancingTermMonths] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);

  const handleSubmit = async () => {
    if (!postalCode || !quotedPrice || !systemSize) {
      setError(t("review.errorRequired"));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/review-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode,
          quotedPrice: Number(quotedPrice),
          systemSizeKwp: Number(systemSize),
          panelCount: panelCount ? Number(panelCount) : undefined,
          panelBrand: panelBrand || undefined,
          inverterBrand: inverterBrand || undefined,
          includeBattery,
          batteryKwh: batteryKwh ? Number(batteryKwh) : undefined,
          subsidyIncluded,
          financingTae: financingTae ? Number(financingTae) : undefined,
          financingMonthly: financingMonthly ? Number(financingMonthly) : undefined,
          financingTermMonths: financingTermMonths ? Number(financingTermMonths) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("review.errorGeneric"));
        return;
      }
      setResult(data);
    } catch {
      setError(t("review.errorConnection"));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            {t("reviewResult.title")}
          </h1>
          <p className="text-muted-foreground">
            {result.location.city}, {result.location.region}
          </p>
        </div>

        {/* Overall Rating */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">{t("reviewResult.overallRating")}</p>
          <div className="mb-3">
            <ScoreBadge score={result.overallRating} t={t} />
          </div>
          {result.overallRating === "review_recommended" && (
            <p className="text-sm text-muted-foreground">
              {t("reviewResult.reviewRecommended")}
            </p>
          )}
        </div>

        {/* Price Analysis */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold">{t("reviewResult.price")}</h3>
            <ScoreBadge score={result.priceAnalysis.score} t={t} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("reviewResult.yourQuote")}</span>
              <span className="font-bold">{fmtEuro(result.priceAnalysis.quotedPrice, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("reviewResult.pricePerKwp")}</span>
              <span className="font-bold">{result.priceAnalysis.quotedEuroPerKwp} &euro;/kWp</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-muted-foreground">{t("reviewResult.marketAvg")}</span>
              <span>{fmtEuro(result.priceAnalysis.marketAvg, locale)} ({result.priceAnalysis.marketEuroPerKwp} &euro;/kWp)</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("reviewResult.marketRange")}</span>
              <span>{fmtEuro(result.priceAnalysis.marketMin, locale)} - {fmtEuro(result.priceAnalysis.marketMax, locale)}</span>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-4">
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-green-200 rounded-full"
                style={{
                  left: "0%",
                  width: `${Math.min(100, (result.priceAnalysis.marketAvg / result.priceAnalysis.marketMax) * 100)}%`,
                }}
              />
              <div
                className="absolute h-full w-1 bg-foreground rounded-full"
                style={{
                  left: `${Math.min(100, (result.priceAnalysis.quotedPrice / (result.priceAnalysis.marketMax * 1.3)) * 100)}%`,
                }}
                title={t("reviewResult.yourPrice")}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{fmtEuro(result.priceAnalysis.marketMin, locale)}</span>
              <span>{t("reviewResult.yourPrice")}</span>
              <span>{fmtEuro(result.priceAnalysis.marketMax, locale)}</span>
            </div>
          </div>
        </div>

        {/* Subsidy Analysis */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-4">
          <h3 className="font-heading font-bold mb-3">{t("reviewResult.subsidies")}</h3>
          {result.subsidyAnalysis.available.length > 0 ? (
            <>
              <div className="space-y-2 mb-3">
                {result.subsidyAnalysis.available.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex-1 min-w-0 truncate">{s.name}</span>
                    <span className="font-bold shrink-0 ml-2">
                      {s.estimatedValue > 0 ? fmtEuro(s.estimatedValue, locale) : s.amount || "-"}
                    </span>
                  </div>
                ))}
              </div>
              {result.subsidyAnalysis.potentialSavings > 0 && (
                <div className="bg-green-50 rounded-lg p-3 text-sm">
                  <p className="text-green-800 font-bold">
                    {t("reviewResult.potentialSavings", { amount: fmtEuro(result.subsidyAnalysis.potentialSavings, locale) })}
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    {t("reviewResult.askInstaller")}
                  </p>
                </div>
              )}
              {result.subsidyAnalysis.subsidyIncluded === "yes" && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t("reviewResult.subsidyIncludedNote")}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("reviewResult.noSubsidies")}
            </p>
          )}
        </div>

        {/* Financing Analysis */}
        {result.financingAnalysis && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold">{t("reviewResult.financing")}</h3>
              {result.financingAnalysis.score && (
                <ScoreBadge score={result.financingAnalysis.score} t={t} />
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("reviewResult.offeredTae")}</span>
                <span className="font-bold">{result.financingAnalysis.offeredTae}%</span>
              </div>
              {result.financingAnalysis.bestAvailableTae && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("reviewResult.bestAvailableTae")}</span>
                  <span>
                    {result.financingAnalysis.bestAvailableTae}%
                    {result.financingAnalysis.bestAvailableProvider && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({result.financingAnalysis.bestAvailableProvider})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Equipment Analysis */}
        {(result.equipmentAnalysis.panelBrand || result.equipmentAnalysis.inverterBrand) && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-4">
            <h3 className="font-heading font-bold mb-3">{t("reviewResult.equipment")}</h3>
            <div className="space-y-2 text-sm">
              {result.equipmentAnalysis.panelBrand && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("reviewResult.panels", { brand: result.equipmentAnalysis.panelBrand })}</span>
                  {result.equipmentAnalysis.panelRecognized !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.equipmentAnalysis.panelRecognized
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {result.equipmentAnalysis.panelRecognized ? t("reviewResult.recognizedBrand") : t("reviewResult.unknownBrand")}
                    </span>
                  )}
                </div>
              )}
              {result.equipmentAnalysis.inverterBrand && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t("reviewResult.inverter", { brand: result.equipmentAnalysis.inverterBrand })}</span>
                  {result.equipmentAnalysis.inverterRecognized !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.equipmentAnalysis.inverterRecognized
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {result.equipmentAnalysis.inverterRecognized ? t("reviewResult.recognizedBrand") : t("reviewResult.unknownBrand")}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="mt-8 bg-surface-container-low rounded-2xl p-6">
          <div className="text-center mb-4">
            <p className="font-heading font-extrabold text-foreground mb-1">Quieres que te ayudemos?</p>
            <p className="text-sm text-muted-foreground">Via WhatsApp, en pocos minutos podemos conectarte con un instalador recomendado y un proveedor de financiacion. Comprobamos precios y condiciones reales por ti, y coordinamos cualquier contacto directo segun tu disponibilidad.</p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-xs text-muted-foreground">&#128274; Sin llamadas comerciales</span>
            <span className="text-xs text-muted-foreground">&middot;</span>
            <span className="text-xs text-muted-foreground">&#9989; Tu decides cuando y como</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 space-y-3">
          <a
            href="/"
            className="block w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold text-center hover:bg-primary/90 transition-colors shadow-ambient"
          >
            {t("reviewResult.calculateBestOption")}
          </a>
          <button
            onClick={() => setResult(null)}
            className="block w-full py-3.5 rounded-xl border border-border text-muted-foreground text-center hover:text-foreground transition-colors"
          >
            {t("reviewResult.analyzeAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    {/* Hero with background image — left text, right form */}
    <section className="relative w-full overflow-hidden bg-[#1a1610]">
      <div className="absolute inset-0 z-0">
        <Image src="/hero-proposal.jpg" alt="Solar panel close-up on terracotta roof" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1610]/92 via-[#1a1610]/75 to-[#1a1610]/50" />
      </div>
      <div className="relative z-10 w-full pt-16 sm:pt-20 pb-20 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
            Analisis independiente &middot; Datos reales de mercado
          </div>
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left — Context */}
            <div className="lg:col-span-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
                {t("review.title")}
              </h1>
              <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6 leading-relaxed">
                {t("review.subtitle")}
              </p>
              <p className="text-white/60 text-sm max-w-xl mb-8 leading-relaxed">
                Introduce los datos de tu presupuesto y te diremos si el precio es competitivo, si hay subvenciones que no te han incluido, y como se comparan las condiciones de financiacion con el mercado.
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <a href="/" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                  Calculadora Solar
                </a>
                <a href="/comparar-financiacion" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                  Comparar Financiacion
                </a>
                <a href="/guias" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                  Guias
                </a>
              </div>
              <div className="flex items-center gap-8 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">15+</p>
                  <p className="text-xs sm:text-sm text-white/60">Marcas verificadas</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">17</p>
                  <p className="text-xs sm:text-sm text-white/60">Comunidades</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold text-white">Gratis</p>
                  <p className="text-xs sm:text-sm text-white/60">Sin compromiso</p>
                </div>
              </div>
            </div>
            {/* Right — Form in glassmorphic card */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-xl p-1 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 pointer-events-none rounded-2xl" />
                <div className="relative z-10 bg-white rounded-xl p-4 sm:p-5 space-y-4">
                  <h3 className="text-base font-heading font-extrabold text-foreground text-center">Analiza tu propuesta</h3>
        {/* Required fields */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {t("review.postalCode")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
            placeholder={t("calc.postalCodePlaceholder")}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {t("review.quotedPrice")}
            </label>
            <input
              type="number"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(e.target.value)}
              placeholder={t("review.quotedPricePlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {t("review.systemSize")}
            </label>
            <input
              type="number"
              step="0.1"
              value={systemSize}
              onChange={(e) => setSystemSize(e.target.value)}
              placeholder={t("review.systemSizePlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {t("review.panelCount")}
          </label>
          <input
            type="number"
            value={panelCount}
            onChange={(e) => setPanelCount(e.target.value)}
            placeholder={t("review.panelCountPlaceholder")}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
          />
        </div>

        {/* Equipment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {t("review.panelBrand")}
            </label>
            <input
              type="text"
              value={panelBrand}
              onChange={(e) => setPanelBrand(e.target.value)}
              placeholder={t("review.panelBrandPlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {t("review.inverterBrand")}
            </label>
            <input
              type="text"
              value={inverterBrand}
              onChange={(e) => setInverterBrand(e.target.value)}
              placeholder={t("review.inverterBrandPlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
            />
          </div>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-3">
          <div
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
              includeBattery ? "bg-primary" : "bg-border"
            }`}
            onClick={() => setIncludeBattery(!includeBattery)}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                includeBattery ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-foreground">{t("review.includeBattery")}</span>
          {includeBattery && (
            <input
              type="number"
              value={batteryKwh}
              onChange={(e) => setBatteryKwh(e.target.value)}
              placeholder="kWh"
              className="w-20 px-3 py-1.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          )}
        </div>

        {/* Subsidy included */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {t("review.subsidyIncludedLabel")}
          </label>
          <div className="flex gap-3">
            {[
              { value: "yes", label: t("review.subsidyYes") },
              { value: "no", label: t("review.subsidyNo") },
              { value: "unknown", label: t("review.subsidyUnknown") },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSubsidyIncluded(opt.value)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  subsidyIncluded === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Financing */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            {t("review.financingLabel")}
          </label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              step="0.1"
              value={financingTae}
              onChange={(e) => setFinancingTae(e.target.value)}
              placeholder={t("review.financingTaePlaceholder")}
              className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="number"
              value={financingMonthly}
              onChange={(e) => setFinancingMonthly(e.target.value)}
              placeholder={t("review.financingMonthlyPlaceholder")}
              className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
            <input
              type="number"
              value={financingTermMonths}
              onChange={(e) => setFinancingTermMonths(e.target.value)}
              placeholder={t("review.financingTermPlaceholder")}
              className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive text-destructive-foreground text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("review.analyzing")}
            </span>
          ) : (
            t("review.analyze")
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          {t("review.disclaimer")}
        </p>
                </div>{/* end white card */}
              </div>{/* end glassmorphic wrapper */}
            </div>{/* end lg:col-span-2 */}
          </div>{/* end grid */}
        </div>{/* end max-w-6xl */}
      </div>{/* end relative z-10 */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>{/* end hero */}

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
