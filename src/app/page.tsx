"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import SolarCalculator from "@/components/SolarCalculator";
import ResultsPanel from "@/components/ResultsPanel";
import FinancingStep from "@/components/FinancingStep";
import FinancingRequest from "@/components/FinancingRequest";
import InstallerResults from "@/components/InstallerResults";
import type { InstallerDetail } from "@/components/InstallerResults";
import CaseRegistration from "@/components/CaseRegistration";
import ChatDashboard from "@/components/ChatDashboard";
import type { CalculationResult, LoanProductInfo } from "@/components/SolarCalculator";
import { useTranslation } from "@/i18n/useTranslation";

type Step = "calculator" | "results" | "financing" | "financing-request" | "installers" | "register" | "chat";

const STEPS: Step[] = ["calculator", "results", "financing", "financing-request", "installers", "register", "chat"];

// ── City images (shared with tuenergiaverde.es) ─────────────────
const CITIES = [
  { name: "Madrid", img: "/cities/madrid.jpg", installers: 104 },
  { name: "Barcelona", img: "/cities/barcelona.jpg", installers: 46 },
  { name: "Zaragoza", img: "/cities/zaragoza.jpg", installers: 72 },
  { name: "Sevilla", img: "/cities/sevilla.jpg", installers: 34 },
  { name: "Valencia", img: "/cities/valencia.jpg", installers: 29 },
  { name: "Malaga", img: "/cities/malaga.jpg", installers: 38 },
  { name: "Murcia", img: "/cities/murcia.jpg", installers: 44 },
  { name: "Bilbao", img: "/cities/bilbao.jpg", installers: 12 },
  { name: "Granada", img: "/cities/granada.jpg", installers: 28 },
  { name: "Cordoba", img: "/cities/cordoba.jpg", installers: 38 },
  { name: "Palma de Mallorca", img: "/cities/palma-de-mallorca.jpg", installers: 33 },
  { name: "Alicante", img: "/cities/alicante.jpg", installers: 22 },
];

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
      {/* ══════════════════════════════════════════════════════════════
          HERO — Background image + embedded calculator (calculator step)
          ══════════════════════════════════════════════════════════════ */}
      {step === "calculator" && (
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#1a1610] via-[#2a2215] to-[#1a3520]">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-solar.jpg"
              alt="Home with solar panels in Spain"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1610]/92 via-[#1a1610]/75 to-[#1a1610]/50" />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full pt-16 sm:pt-20 pb-24 sm:pb-28 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse" />
                {t("home.badgeFree")} &middot; {t("home.badge2Min")} &middot; {t("home.badgeNoCommitment")}
              </div>

              <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                {/* Left — Text + Stats */}
                <div className="lg:col-span-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
                    {t("hero.title")}{" "}
                    <span className="text-[#f5a623]">{t("hero.titleHighlight")}</span>{" "}
                    {t("hero.titleEnd")}
                  </h1>
                  <p className="text-white/80 text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
                    {t("hero.subtitle")}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <a href="/comparar-financiacion" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                      {t("home.toolFinancingTitle")}
                    </a>
                    <a href="/revisar-propuesta" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                      {t("home.toolReviewTitle")}
                    </a>
                    <a href="/guias" className="text-white/70 hover:text-white font-medium transition-colors text-sm underline underline-offset-4 decoration-white/30 hover:decoration-white/60">
                      {t("nav.guides")}
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-xl sm:text-2xl font-extrabold text-white">500+</p>
                      <p className="text-xs sm:text-sm text-white/60">{t("home.statInstallers")}</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-extrabold text-white">17</p>
                      <p className="text-xs sm:text-sm text-white/60">{t("home.statRegions")}</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-extrabold text-white">13+</p>
                      <p className="text-xs sm:text-sm text-white/60">{t("home.statProviders")}</p>
                    </div>
                  </div>
                </div>

                {/* Right — Calculator card */}
                <div className="lg:col-span-2">
                  <div className="bg-white/10 backdrop-blur-xl p-1 rounded-2xl shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 pointer-events-none rounded-2xl" />
                    <div className="relative z-10 bg-white rounded-xl p-4 sm:p-5">
                      <SolarCalculator onResult={handleResult} compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PROGRESS BAR (flow steps, after calculator)
          ══════════════════════════════════════════════════════════════ */}
      {step !== "calculator" && (() => {
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

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT — Step-based flow
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-8 sm:py-12 px-4">
        {step === "calculator" && null /* Calculator is in the hero */}

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

      {/* ══════════════════════════════════════════════════════════════
          BELOW THE FOLD — Cities, Tools, How It Works (calculator step)
          ══════════════════════════════════════════════════════════════ */}
      {step === "calculator" && (
        <>
          {/* ── Tools — overlaps hero bottom ──────────────────────── */}
          <div className="relative z-20 -mt-12 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <a href="/" className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient-lg hover:shadow-ambient-lg transition-all hover:-translate-y-1 group text-center">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">&#9728;&#65039;</div>
                <h3 className="font-heading font-extrabold text-foreground mb-1">{t("home.toolCalcTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.toolCalcDesc")}</p>
              </a>
              <a href="/comparar-financiacion" className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient-lg hover:shadow-ambient-lg transition-all hover:-translate-y-1 group text-center">
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">&#128176;</div>
                <h3 className="font-heading font-extrabold text-foreground mb-1">{t("home.toolFinancingTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.toolFinancingDesc")}</p>
              </a>
              <a href="/revisar-propuesta" className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient-lg hover:shadow-ambient-lg transition-all hover:-translate-y-1 group text-center">
                <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">&#128203;</div>
                <h3 className="font-heading font-extrabold text-foreground mb-1">{t("home.toolReviewTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("home.toolReviewDesc")}</p>
              </a>
            </div>
          </div>

          {/* ── City Grid ────────────────────────────────────────── */}
          <section className="py-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
                    {t("home.citiesTitle") || "Principales ciudades"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("home.citiesSubtitle") || "Instaladores solares verificados cerca de ti"}
                  </p>
                </div>
                <a
                  href="https://tuenergiaverde.es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity hidden sm:block"
                >
                  Ver todas las ciudades &rarr;
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {CITIES.map((c) => (
                  <a
                    key={c.name}
                    href={`https://tuenergiaverde.es/${c.name.toLowerCase().replace(/\s+/g, "-")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] hover:-translate-y-0.5 hover:shadow-ambient-lg transition-all"
                  >
                    <div className="absolute inset-0">
                      <Image
                        src={c.img}
                        alt={`Instaladores solares en ${c.name}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-[2]" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-[3]">
                      <span className="text-white font-bold text-sm block">{c.name}</span>
                      <span className="text-white/70 text-xs">{c.installers} instaladores</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ── How it works ─────────────────────────────────────── */}
          <section className="py-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground text-center mb-3">
                {t("home.howItWorks")}
              </h2>
              <p className="text-muted-foreground text-center max-w-lg mx-auto mb-10">
                {t("home.howItWorksSubtitle") || "Cuatro pasos para encontrar tu mejor opcion solar"}
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

          {/* ── Why Precio Solar ──────────────────────────────────── */}
          <section className="py-16 px-4 sm:px-6 bg-surface-container-low">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground text-center mb-10">
                {t("home.whyUs")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-extrabold mb-2">{t("home.independent")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.independentDesc")}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-extrabold mb-2">{t("home.transparent")}</h3>
                  <p className="text-sm text-muted-foreground">{t("home.transparentDesc")}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-ambient text-center">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-extrabold mb-2">{t("home.fast")}</h3>
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
