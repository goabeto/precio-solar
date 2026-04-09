"use client";

import { useState } from "react";
import type { CalculationResult, LoanProductInfo } from "./SolarCalculator";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro } from "@/i18n/formatters";

interface FinancingRequestProps {
  selectedLoans: LoanProductInfo[];
  /** Full calculation result (available in main flow) */
  result?: CalculationResult;
  /** Standalone mode: just amount + term, no full result */
  loanAmount?: number;
  loanTermMonths?: number;
  onSuccess: () => void;
  onBack: () => void;
}

export default function FinancingRequest({
  selectedLoans,
  result,
  loanAmount,
  loanTermMonths,
  onSuccess,
  onBack,
}: FinancingRequestProps) {
  const { t, locale } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = result?.pricing.netCost ?? loanAmount ?? 0;
  const termMonths = loanTermMonths ?? 120;

  const validatePhone = (value: string): boolean => {
    if (!value) return true;
    const cleaned = value.replace(/[\s\-().]/g, "");
    return /^(?:\+34)?[67]\d{8}$/.test(cleaned);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (phone && !validatePhone(phone)) {
      setPhoneError(t("case.phoneError"));
      return;
    }
    setPhoneError(null);
    setLoading(true);
    setError(null);

    try {
      const cleanedPhone = phone ? phone.replace(/[\s\-().]/g, "") : undefined;
      const res = await fetch("/api/financing-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanedPhone,
          email: email || undefined,
          notes: notes || undefined,
          loanAmount: amount,
          loanTermMonths: termMonths,
          selectedProducts: selectedLoans.map((l) => ({
            id: l.id,
            provider: l.provider,
            name: l.name,
            taeMin: l.taeMin,
            monthly: l.monthly,
            productUrl: l.productUrl,
          })),
          // Include system info if available (from main flow)
          ...(result && {
            postalCode: result.location.postalCode,
            city: result.location.city,
            region: result.location.region,
            systemKwp: result.system.kwp,
            panelCount: result.system.panelCount,
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("financingRequest.errorGeneric"));
        return;
      }

      onSuccess();
    } catch {
      setError(t("financingRequest.errorConnection"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          {t("financingRequest.title")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("financingRequest.subtitle")}
        </p>
      </div>

      {/* Selected products summary */}
      <div className="bg-muted/30 rounded-xl p-4 space-y-3">
        <p className="font-bold text-foreground text-sm">{t("financingRequest.selectedProducts")}</p>
        {selectedLoans.map((loan) => (
          <div key={loan.id} className="flex items-center justify-between bg-card rounded-lg border border-border p-3">
            <div>
              <p className="font-bold text-foreground text-sm">{loan.provider}</p>
              <p className="text-xs text-muted-foreground">
                TAE {loan.taeMin}% &middot; {loan.termMaxMonths ? Math.round(loan.termMaxMonths / 12) : "–"}a
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-primary">{loan.monthly} &euro;/mes</p>
              <p className="text-xs text-muted-foreground">{formatEuro(Math.round(loan.monthly * (loan.termMaxMonths || 120)), locale)} total</p>
            </div>
          </div>
        ))}
        {result && (
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            {t("financingRequest.projectInfo", {
              kwp: result.system.kwp,
              panels: result.system.panelCount,
              cost: formatEuro(result.pricing.netCost, locale),
              city: result.location.city,
            })}
          </div>
        )}
      </div>

      {/* Contact form */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("financingRequest.nameLabel")} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("financingRequest.namePlaceholder")}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("financingRequest.phoneLabel")}
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (phoneError) setPhoneError(null);
            }}
            placeholder={t("case.phonePlaceholder")}
            className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition ${
              phoneError ? "border-destructive" : "border-input"
            }`}
          />
          {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
          <p className="text-xs text-muted-foreground mt-1.5">{t("financingRequest.phoneHint")}</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("financingRequest.emailLabel")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("financingRequest.emailPlaceholder")}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("financingRequest.notesLabel")}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("financingRequest.notesPlaceholder")}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition resize-y"
          />
        </div>
      </div>

      {/* Privacy + info note */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">{t("financingRequest.infoTitle")}</p>
        <p>{t("financingRequest.infoText")}</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive text-destructive-foreground text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("financingRequest.sending")}
            </span>
          ) : (
            t("financingRequest.submit")
          )}
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
