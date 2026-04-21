"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export interface SubsidyInfo {
  id: string;
  name: string;
  amount: string | null;
  estimatedValue: number;
  eligibility: string | null;
  region: string | null;
  url: string | null;
  status: string;
  lastVerified: string | null;
}

export interface LoanProductInfo {
  id: string;
  name: string;
  productType: string;
  provider: string;
  providerWebsite: string | null;
  taeMin: number | null;
  taeMax: number | null;
  tinMin: number | null;
  tinMax: number | null;
  termMinMonths: number | null;
  termMaxMonths: number | null;
  amountMin: number | null;
  amountMax: number | null;
  openingFeePct: number;
  approvalSpeed: string | null;
  digital: boolean;
  subsidyCompatible: boolean;
  productUrl: string | null;
  monthly: number;
}

export interface CalculationResult {
  location: {
    postalCode: string;
    city: string;
    region: string;
    province: string;
    lat: number;
    lon: number;
    geocodingPrecision?: "exact" | "prefix-fallback";
  };
  system: {
    kwp: number;
    panelCount: number;
    annualProductionKwh: number;
    annualKwhPer1kWp: number;
    includeBattery: boolean;
    pvgisSource: boolean;
  };
  pricing: {
    estimatedCost: number;
    priceMin: number;
    priceMax: number;
    subsidyAmount: number;
    netCost: number;
    euroPerKwp: number;
    subsidies: SubsidyInfo[];
  };
  savings: {
    currentMonthlyBill: number;
    annualSaving: number;
    monthlySaving: number;
    paybackYears: number;
    annualConsumptionKwh: number;
  };
  financing: {
    cash: { netCost: number };
    loan: {
      monthly: number;
      termMonths: number;
      tae: number;
      productName: string;
      providerName: string;
    } | null;
    subscription: { monthly: number };
    allProducts: LoanProductInfo[];
  };
}

interface SolarCalculatorProps {
  onResult: (result: CalculationResult) => void;
  compact?: boolean;
}

export default function SolarCalculator({ onResult, compact }: SolarCalculatorProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [monthlyBill, setMonthlyBill] = useState(80);
  const [includeBattery, setIncludeBattery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Spanish postal codes are 5 digits, first two = province (01-52).
  const isValidSpanishPostalCode = (code: string): boolean => {
    if (!/^\d{5}$/.test(code)) return false;
    const prefix = parseInt(code.slice(0, 2), 10);
    return prefix >= 1 && prefix <= 52;
  };

  // Spanish mobile: 6xx or 7xx (9 digits), optionally with +34 prefix
  const normalizePhone = (raw: string): string | null => {
    const cleaned = raw.replace(/[\s\-().]/g, "");
    // +34 6/7xxxxxxxx
    if (/^\+34[67]\d{8}$/.test(cleaned)) return cleaned;
    // 34 6/7xxxxxxxx (without +)
    if (/^34[67]\d{8}$/.test(cleaned)) return "+" + cleaned;
    // 6/7xxxxxxxx (9 digits)
    if (/^[67]\d{8}$/.test(cleaned)) return "+34" + cleaned;
    return null;
  };

  const calculate = useCallback(async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError(t("calc.errorPhone"));
      return;
    }
    if (!postalCode) {
      setError(t("calc.errorPostalCode"));
      return;
    }
    if (!isValidSpanishPostalCode(postalCode)) {
      setError(t("calc.errorPostalCodeFormat"));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizePhone(phone), postalCode, monthlyBill, includeBattery }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("calc.errorGeneric"));
        return;
      }

      onResult(data);
    } catch {
      setError(t("calc.errorConnection"));
    } finally {
      setLoading(false);
    }
  }, [phone, postalCode, monthlyBill, includeBattery, onResult]);

  return (
    <div className={compact ? "" : "bg-card rounded-2xl shadow-ambient p-6 sm:p-8 max-w-lg mx-auto"}>
      {!compact && (
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
          {t("calc.title")}
        </h2>
      )}
      {compact && (
        <h3 className="text-base font-heading font-extrabold text-foreground mb-4 text-center">
          {t("calc.title")}
        </h3>
      )}

      {/* WhatsApp / Phone */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {t("calc.phone")}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+34</span>
          <input
            type="tel"
            inputMode="tel"
            maxLength={12}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s\-]/g, ""))}
            placeholder={t("calc.phonePlaceholder")}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground text-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          {t("calc.phoneDisclaimer")}
        </p>
      </div>

      {/* Postal Code */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {t("calc.postalCode")}
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
          placeholder={t("calc.postalCodePlaceholder")}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition"
        />
      </div>

      {/* Monthly Bill Slider */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {t("calc.monthlyBill")}
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={30}
            max={300}
            step={5}
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            className="flex-1"
          />
          <div className="bg-primary/10 text-primary font-bold text-lg px-3 py-1 rounded-lg min-w-[80px] text-center">
            {monthlyBill} &euro;
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>30 &euro;</span>
          <span>300 &euro;</span>
        </div>
      </div>

      {/* Battery Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${
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
          <span className="text-sm text-foreground">
            {t("calc.includeBattery")}
          </span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive text-destructive-foreground text-sm">
          {error}
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={calculate}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t("calc.calculating")}
          </span>
        ) : (
          t("calc.calculate")
        )}
      </button>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        {t("calc.disclaimer")}
      </p>
    </div>
  );
}
