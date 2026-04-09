import type { Metadata } from "next";
import { getServerLocale } from "@/i18n/getServerLocale";
import { getDictionary, translate } from "@/i18n";
import FeatureCard from "@/components/FeatureCard";
import RegionGrid from "@/components/RegionGrid";

export const metadata: Metadata = {
  title: "Guias — Tu camino solar sin complicaciones",
  description:
    "Descubre como la energia solar te ahorra tiempo, dinero y esfuerzo. Guias de subvenciones por comunidad autonoma, comparativas y consejos practicos.",
  alternates: { canonical: "/guias" },
};

const CCAA_REGIONS = [
  { slug: "andalucia", name: "Andalucia", popular: true },
  { slug: "aragon", name: "Aragon" },
  { slug: "asturias", name: "Asturias" },
  { slug: "baleares", name: "Islas Baleares" },
  { slug: "canarias", name: "Canarias" },
  { slug: "cantabria", name: "Cantabria" },
  { slug: "castilla-la-mancha", name: "Castilla-La Mancha" },
  { slug: "castilla-y-leon", name: "Castilla y Leon" },
  { slug: "cataluna", name: "Cataluna", popular: true },
  { slug: "comunidad-valenciana", name: "Comunidad Valenciana" },
  { slug: "extremadura", name: "Extremadura" },
  { slug: "galicia", name: "Galicia" },
  { slug: "madrid", name: "Madrid", popular: true },
  { slug: "murcia", name: "Region de Murcia" },
  { slug: "navarra", name: "Navarra" },
  { slug: "pais-vasco", name: "Pais Vasco" },
  { slug: "la-rioja", name: "La Rioja" },
];

export default async function GuidesHubPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-surface-container-low to-background py-12 sm:py-16 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
            17 comunidades
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-foreground max-w-3xl mx-auto leading-tight">
            {t("guides.heroTitle")}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("guides.heroSubtitle")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm text-muted-foreground shadow-ambient">
              &#128218; {t("guides.badgeRegions")}
            </span>
            <span className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm text-muted-foreground shadow-ambient">
              &#128176; {t("guides.badgeFinancing")}
            </span>
            <span className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1 text-sm text-muted-foreground shadow-ambient">
              &#9989; {t("guides.badgeUpdated")}
            </span>
          </div>
        </div>
      </section>

      {/* ── Featured Content ────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground text-center mb-2">
            {t("guides.featured")}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {t("guides.featuredSubtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <FeatureCard
              icon="&#9728;&#65039;"
              title={t("guides.costGuideTitle")}
              description={t("guides.costGuideDesc")}
              href="/"
              badge={t("guides.popularBadge")}
            />
            <FeatureCard
              icon="&#128176;"
              title={t("guides.financingGuideTitle")}
              description={t("guides.financingGuideDesc")}
              href="/comparar-financiacion"
              badge={t("guides.newBadge")}
            />
            <FeatureCard
              icon="&#128203;"
              title={t("guides.subsidyGuideTitle")}
              description={t("guides.subsidyGuideDesc")}
            />
          </div>
        </div>
      </section>

      {/* ── Value proposition ───────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-6 text-center shadow-ambient">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <h3 className="font-heading font-extrabold text-lg mb-1">{t("guides.saveTime")}</h3>
              <p className="text-primary text-sm font-semibold mb-2">{t("guides.saveTimeStat")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("guides.saveTimeDesc")}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-ambient">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
              </div>
              <h3 className="font-heading font-extrabold text-lg mb-1">{t("guides.reduceRisks")}</h3>
              <p className="text-secondary text-sm font-semibold mb-2">{t("guides.reduceRisksStat")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("guides.reduceRisksDesc")}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-ambient">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <h3 className="font-heading font-extrabold text-lg mb-1">{t("guides.saveMoney")}</h3>
              <p className="text-tertiary text-sm font-semibold mb-2">{t("guides.saveMoneyStat")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("guides.saveMoneyDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground text-center mb-8">
            {t("guides.howItWorks")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {([
              { step: "1", title: t("guides.step1Title"), desc: t("guides.step1Desc") },
              { step: "2", title: t("guides.step2Title"), desc: t("guides.step2Desc") },
              { step: "3", title: t("guides.step3Title"), desc: t("guides.step3Desc") },
              { step: "4", title: t("guides.step4Title"), desc: t("guides.step4Desc") },
            ]).map((item) => (
              <div key={item.step} className="text-center bg-white rounded-2xl shadow-ambient p-5">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-extrabold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-heading font-extrabold text-sm text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subvenciones section ─────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground mb-2">
            {t("guides.subsidiesByRegion")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("guides.subsidiesByRegionDesc")}
          </p>
          <RegionGrid regions={CCAA_REGIONS} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-surface-container-low rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mb-3">
            {t("guides.readyToStart")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t("guides.readyToStartDesc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors shadow-ambient"
            >
              {t("guides.calculateMyPrice")}
            </a>
            <a
              href="/revisar-propuesta"
              className="inline-block border border-border text-foreground px-8 py-3 rounded-xl font-heading font-bold hover:border-primary/40 hover:text-primary transition-colors"
            >
              {t("guides.secondaryCta")}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("guides.aiHint")}
          </p>
        </div>
      </section>
    </>
  );
}
