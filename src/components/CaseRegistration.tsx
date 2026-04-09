"use client";

import { useState } from "react";
import type { CalculationResult } from "./SolarCalculator";
import type { InstallerDetail } from "./InstallerResults";
import { generateInitialMessage } from "@/lib/chat-templates";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro as fmtEuro } from "@/i18n/formatters";

interface CaseRegistrationProps {
  result: CalculationResult;
  selectedInstallers: InstallerDetail[];
  onSuccess: (caseId: string) => void;
  onBack: () => void;
}

export default function CaseRegistration({
  result,
  selectedInstallers,
  onSuccess,
  onBack,
}: CaseRegistrationProps) {
  const { t, locale } = useTranslation();
  const [messages, setMessages] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const inst of selectedInstallers) {
      initial[inst.id] = generateInitialMessage(result, inst.name);
    }
    return initial;
  });
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);

  const validatePhone = (value: string): boolean => {
    if (!value) return true; // not mandatory
    const cleaned = value.replace(/[\s\-().]/g, "");
    return /^(?:\+34)?[67]\d{8}$/.test(cleaned);
  };

  const handleSubmit = async () => {
    // Validate phone if provided
    if (phone && !validatePhone(phone)) {
      setPhoneError(t("case.phoneError"));
      return;
    }
    setPhoneError(null);
    setLoading(true);
    setError(null);

    try {
      const cleanedPhone = phone ? phone.replace(/[\s\-().]/g, "") : undefined;
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          result,
          selectedInstallers: selectedInstallers.map((i) => ({
            id: i.id,
            name: i.name,
          })),
          messages,
          phone: cleanedPhone,
          email: email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("case.errorGeneric"));
        return;
      }

      onSuccess(data.caseId);
    } catch {
      setError(t("case.errorConnection"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold">
          {t("case.title")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("case.subtitle")}
        </p>
      </div>

      {/* Project summary */}
      <div className="bg-muted/30 rounded-xl p-4 text-sm">
        <p className="font-bold text-foreground mb-1">{t("case.projectSummary")}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
          <span>{result.system.kwp} kWp</span>
          <span>{result.system.panelCount} paneles</span>
          <span>{fmtEuro(result.pricing.netCost, locale)}</span>
          <span>{result.location.city}</span>
        </div>
      </div>

      {/* Messages per installer */}
      <div className="space-y-4">
        {selectedInstallers.map((installer) => (
          <div key={installer.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-heading font-bold text-foreground">{installer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {installer.city}, {installer.region}
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingMessage(
                    editingMessage === installer.id ? null : installer.id
                  )
                }
                className="text-xs text-primary hover:underline"
              >
                {editingMessage === installer.id ? t("case.done") : t("case.editMessage")}
              </button>
            </div>

            {editingMessage === installer.id ? (
              <textarea
                value={messages[installer.id] || ""}
                onChange={(e) =>
                  setMessages((prev) => ({
                    ...prev,
                    [installer.id]: e.target.value,
                  }))
                }
                rows={10}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-y"
              />
            ) : (
              <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground whitespace-pre-line max-h-32 overflow-y-auto">
                {messages[installer.id]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Phone (recommended) + Email (optional) */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("case.phoneLabel")}
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
          {phoneError && (
            <p className="text-xs text-destructive mt-1">{phoneError}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            {t("case.phoneHint")}
          </p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t("case.emailLabelOptional")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("case.emailPlaceholder")}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none transition"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {t("case.emailHint")}
          </p>
        </div>
      </div>

      {/* Privacy note */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">{t("case.privacyTitle")}</p>
        <p>
          {t("case.privacyText")}
        </p>
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
          disabled={loading}
          className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("case.sending")}
            </span>
          ) : (
            selectedInstallers.length === 1 ? t("case.startConversations.one") : t("case.startConversations.other", { count: selectedInstallers.length })
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
