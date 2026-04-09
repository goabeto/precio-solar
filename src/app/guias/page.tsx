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
      <section className="relative py-16 sm:py-24 text-center px-4 bg-gradient-to-br from-primary/5 via-background to-amber-50/30">
        <h1 className="text-3xl sm:text-5xl font-heading font-bold text-foreground max-w-3xl mx-auto leading-tight">
          {t("guides.heroTitle")}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("guides.heroSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm text-muted-foreground shadow-sm">
            &#128218; {t("guides.badgeRegions")}
          </span>
          <span className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm text-muted-foreground shadow-sm">
            &#128176; {t("guides.badgeFinancing")}
          </span>
          <span className="inline-flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1 text-sm text-muted-foreground shadow-sm">
            &#9989; {t("guides.badgeUpdated")}
          </span>
        </div>
      </section>

      {/* ── Featured Content ────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-2">
            {t("guides.featured")}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {t("guides.featuredSubtitle")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">&#9200;</div>
              <h3 className="font-heading font-bold text-lg mb-1">{t("guides.saveTime")}</h3>
              <p className="text-primary text-sm font-medium mb-2">{t("guides.saveTimeStat")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("guides.saveTimeDesc")}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">&#128737;</div>
              <h3 className="font-heading font-bold text-lg mb-1">{t("guides.reduceRisks")}</h3>
              <p className="text-primary text-sm font-medium mb-2">{t("guides.reduceRisksStat")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("guides.reduceRisksDesc")}
              </p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-sm">
              <div className="text-4xl mb-3">&#128176;</div>
              <h3 className="font-heading font-bold text-lg mb-1">{t("guides.saveMoney")}</h3>
              <p className="text-primary text-sm font-medium mb-2">{t("guides.saveMoneyStat")}</p>
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
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground text-center mb-8">
            {t("guides.howItWorks")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {([
              { step: "1", title: t("guides.step1Title"), desc: t("guides.step1Desc") },
              { step: "2", title: t("guides.step2Title"), desc: t("guides.step2Desc") },
              { step: "3", title: t("guides.step3Title"), desc: t("guides.step3Desc") },
              { step: "4", title: t("guides.step4Title"), desc: t("guides.step4Desc") },
            ]).map((item) => (
              <div key={item.step} className="text-center bg-card rounded-xl border border-border p-5">
                <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-sm text-foreground mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subvenciones section ─────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-2">
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
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-amber-50/30 rounded-2xl p-8 sm:p-12 border border-primary/10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
            {t("guides.readyToStart")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t("guides.readyToStartDesc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors"
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
