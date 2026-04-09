"use client";

import { useState, useCallback } from "react";
import SolarCalculator from "@/components/SolarCalculator";
import ResultsPanel from "@/components/ResultsPanel";
import FinancingStep from "@/components/FinancingStep";
import FinancingRequest from "@/components/FinancingRequest";
import InstallerResults from "@/components/InstallerResults";
import type { InstallerDetail } from "@/components/InstallerResults";
import CaseRegistration from "@/components/CaseRegistration";
import ChatDashboard from "@/components/ChatDashboard";
import FeatureCard from "@/components/FeatureCard";
import type { CalculationResult, LoanProductInfo } from "@/components/SolarCalculator";
import { useTranslation } from "@/i18n/useTranslation";

type Step = "calculator" | "results" | "financing" | "financing-request" | "installers" | "register" | "chat";

const STEP_KEYS: Record<Step, string> = {
  calculator: "steps.calculate",
  results: "steps.yourPrice",
  financing: "steps.financing",
  "financing-request": "steps.financingRequest",
  installers: "steps.installers",
  register: "steps.request",
  chat: "steps.conversations",
};

const STEPS: Step[] = ["calculator", "results", "financing", "financing-request", "installers", "register", "chat"];

export default function HomePage() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("calculator");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedLoans, setSelectedLoans] = useState<LoanProductInfo[]>([]);
  const [selectedInstallerObjects, setSelectedInstallerObjects] = useState<InstallerDetail[]>([]);
  const [caseId, setCaseId] = useState<string | null>(null);

  const handleResult = useCallback((data: CalculationResult) => {
    setResult(data);
    setStep("results");
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setSelectedLoans([]);
    setSelectedInstallerObjects([]);
    setCaseId(null);
    setStep("calculator");
  }, []);

  const currentIdx = STEPS.indexOf(step);

  return (
    <>
      {/* ── Hero (calculator step only) ─────────────────────────────── */}
      {step === "calculator" && (
        <section className="relative py-16 sm:py-24 text-center px-4 bg-gradient-to-br from-secondary-container/20 via-background to-primary-container/10">
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-foreground max-w-2xl mx-auto leading-tight">
            {t("hero.title")}{" "}
            <span className="text-primary underline decoration-primary/30 underline-offset-4">
              {t("hero.titleHighlight")}
            </span>{" "}
            {t("hero.titleEnd")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            {t("hero.subtitle")}
          </p>

          {/* Inline value badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm text-muted-foreground shadow-sm">
              &#10003; {t("home.badgeFree")}
            </span>
            <span className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm text-muted-foreground shadow-sm">
              &#9201; {t("home.badge2Min")}
            </span>
            <span className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm text-muted-foreground shadow-sm">
              &#128274; {t("home.badgeNoCommitment")}
            </span>
          </div>
        </section>
      )}

      {/* ── Progress bar (flow steps) ───────────────────────────────── */}
      {step !== "calculator" && (() => {
        // Visual steps collapse financing + financing-request into one
        const VISUAL_STEPS: { key: string; label: string; covers: Step[] }[] = [
          { key: "results", label: "steps.yourPrice", covers: ["results"] },
          { key: "financing", label: "steps.financing", covers: ["financing", "financing-request"] },
          { key: "installers", label: "steps.installers", covers: ["installers"] },
          { key: "register", label: "steps.request", covers: ["register"] },
          { key: "chat", label: "steps.conversations", covers: ["chat"] },
        ];
        return (
          <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
            <div className="flex items-center justify-between">
              {VISUAL_STEPS.map((vs, i) => {
                const isCurrent = vs.covers.includes(step);
                const coveredIdxs = vs.covers.map((s) => STEPS.indexOf(s));
                const isActive = Math.min(...coveredIdxs) <= currentIdx;
                const isComplete = Math.max(...coveredIdxs) < currentIdx;
                return (
                  <div key={vs.key} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`ml-2 text-xs hidden sm:block ${
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {t(vs.label)}
                    </span>
                    {i < VISUAL_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-3 ${isComplete ? "bg-primary" : "bg-border"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Main content (step-based) ───────────────────────────────── */}
      <section className="py-8 sm:py-12 px-4">
        {step === "calculator" && <SolarCalculator onResult={handleResult} />}

        {step === "results" && result && (
          <ResultsPanel result={result} onNext={() => setStep("financing")} onReset={reset} />
        )}

        {step === "financing" && result && (
          <FinancingStep
            result={result}
            onNext={(loans) => {
              setSelectedLoans(loans);
              setStep("financing-request");
            }}
            onSkip={() => setStep("installers")}
            onBack={() => setStep("results")}
          />
        )}

        {step === "financing-request" && result && (
          <FinancingRequest
            selectedLoans={selectedLoans}
            result={result}
            onSuccess={() => setStep("installers")}
            onBack={() => setStep("financing")}
          />
        )}

        {step === "installers" && result && (
          <InstallerResults
            result={result}
            onSelectInstallers={(_ids, installers) => {
              setSelectedInstallerObjects(installers);
              setStep("register");
            }}
            onBack={() => setStep("financing")}
          />
        )}

        {step === "register" && result && (
          <CaseRegistration
            result={result}
            selectedInstallers={selectedInstallerObjects}
            onSuccess={(id) => {
              setCaseId(id);
              setStep("chat");
            }}
            onBack={() => setStep("installers")}
          />
        )}

        {step === "chat" && result && caseId && (
          <ChatDashboard result={result} caseId={caseId} onReset={reset} />
        )}
      </section>

      {/* ── Below-the-fold sections (calculator step only) ──────────── */}
      {step === "calculator" && (
        <>
          {/* Social proof / trust stats */}
          <section className="py-12 px-4 border-t border-border">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                <div className="bg-card rounded-xl shadow-ambient p-4">
                  <div className="text-2xl mb-1">&#128200;</div>
                  <p className="text-xl font-heading font-bold text-foreground">13+</p>
                  <p className="text-xs text-muted-foreground">{t("home.statProviders")}</p>
                </div>
                <div className="bg-card rounded-xl shadow-ambient p-4">
                  <div className="text-2xl mb-1">&#127968;</div>
                  <p className="text-xl font-heading font-bold text-foreground">17</p>
                  <p className="text-xs text-muted-foreground">{t("home.statRegions")}</p>
                </div>
                <div className="bg-card rounded-xl shadow-ambient p-4">
                  <div className="text-2xl mb-1">&#9989;</div>
                  <p className="text-xl font-heading font-bold text-foreground">{t("home.statVerifiedCount")}</p>
                  <p className="text-xs text-muted-foreground">{t("home.statInstallers")}</p>
                </div>
                <div className="bg-card rounded-xl shadow-ambient p-4">
                  <div className="text-2xl mb-1">&#129302;</div>
                  <p className="text-xl font-heading font-bold text-foreground">24/7</p>
                  <p className="text-xs text-muted-foreground">{t("home.statAiAssistant")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-8">
                {t("home.howItWorks")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {(["1", "2", "3", "4"] as const).map((n) => (
                  <div key={n} className="text-center bg-card rounded-xl shadow-ambient p-5">
                    <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                      {n}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-foreground mb-1">
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

          {/* Tools */}
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-2">
                {t("home.tools")}
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {t("home.toolsSubtitle")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FeatureCard
                  icon="&#9728;&#65039;"
                  title={t("home.toolCalcTitle")}
                  description={t("home.toolCalcDesc")}
                  href="/"
                />
                <FeatureCard
                  icon="&#128176;"
                  title={t("home.toolFinancingTitle")}
                  description={t("home.toolFinancingDesc")}
                  href="/comparar-financiacion"
                />
                <FeatureCard
                  icon="&#128203;"
                  title={t("home.toolReviewTitle")}
                  description={t("home.toolReviewDesc")}
                  href="/revisar-propuesta"
                />
              </div>
            </div>
          </section>

          {/* Why Precio Solar */}
          <section className="py-12 px-4 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-8">
                {t("home.whyUs")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl mb-2">&#127919;</div>
                  <h3 className="font-heading font-bold mb-1">{t("home.independent")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.independentDesc")}</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">&#128269;</div>
                  <h3 className="font-heading font-bold mb-1">{t("home.transparent")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.transparentDesc")}</p>
                </div>
                <div>
                  <div className="text-3xl mb-2">&#9889;</div>
                  <h3 className="font-heading font-bold mb-1">{t("home.fast")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.fastDesc")}</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
