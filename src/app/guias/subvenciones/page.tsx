import type { Metadata } from "next";
import { getSubsidyPrograms } from "@/lib/data";
import { getServerLocale } from "@/i18n/getServerLocale";
import { getDictionary, translate } from "@/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subvenciones para placas solares en Espana",
  description:
    "Guia completa de subvenciones y ayudas para instalaciones solares por Comunidad Autonoma. Bonificaciones IBI, ICIO y programas autonomicos.",
  alternates: { canonical: "/guias/subvenciones" },
};

const CCAA_REGIONS = [
  { slug: "andalucia", name: "Andalucia" },
  { slug: "aragon", name: "Aragon" },
  { slug: "asturias", name: "Asturias" },
  { slug: "baleares", name: "Islas Baleares" },
  { slug: "canarias", name: "Canarias" },
  { slug: "cantabria", name: "Cantabria" },
  { slug: "castilla-la-mancha", name: "Castilla-La Mancha" },
  { slug: "castilla-y-leon", name: "Castilla y Leon" },
  { slug: "cataluna", name: "Cataluna" },
  { slug: "comunidad-valenciana", name: "Comunidad Valenciana" },
  { slug: "extremadura", name: "Extremadura" },
  { slug: "galicia", name: "Galicia" },
  { slug: "madrid", name: "Madrid" },
  { slug: "murcia", name: "Region de Murcia" },
  { slug: "navarra", name: "Navarra" },
  { slug: "pais-vasco", name: "Pais Vasco" },
  { slug: "la-rioja", name: "La Rioja" },
];

export default async function SubsidiesHubPage() {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  const allSubsidies = await getSubsidyPrograms();

  const national = allSubsidies.filter((s) => !s.region);
  const byRegion: Record<string, typeof allSubsidies> = {};
  for (const s of allSubsidies) {
    if (s.region) {
      if (!byRegion[s.region]) byRegion[s.region] = [];
      byRegion[s.region].push(s);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <nav className="text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-foreground transition-colors">{t("regionSub.breadcrumbHome")}</a>
        <span className="mx-2 text-border">/</span>
        <a href="/guias" className="hover:text-foreground transition-colors">{t("regionSub.breadcrumbGuides")}</a>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{t("regionSub.breadcrumbSubsidies")}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
        {t("subsidies.pageTitle")}
      </h1>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        {t("subsidies.pageDesc")}
      </p>

      {/* National programs */}
      {national.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-4">
            {t("subsidies.nationalPrograms")}
          </h2>
          <div className="space-y-3">
            {national.map((s) => (
              <div key={s.id} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{s.name}</p>
                    {s.eligibility && (
                      <p className="text-sm text-muted-foreground mt-1">{s.eligibility}</p>
                    )}
                  </div>
                  {s.amount && (
                    <p className="font-semibold text-primary text-sm shrink-0">{s.amount}</p>
                  )}
                </div>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-primary hover:underline"
                  >
                    {t("subsidies.moreInfo")} &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Info box when no DB */}
      {allSubsidies.length === 0 && (
        <div className="bg-muted/30 rounded-xl p-6 mb-10 text-center">
          <p className="text-muted-foreground">
            {t("subsidies.loadingNote")}
          </p>
        </div>
      )}

      {/* CCAA grid */}
      <section>
        <h2 className="text-lg font-heading font-semibold text-foreground mb-4">
          {t("subsidies.byRegion")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CCAA_REGIONS.map((r) => {
            const count = byRegion[r.name]?.length || 0;
            return (
              <a
                key={r.slug}
                href={`/guias/subvenciones/${r.slug}`}
                className="group flex flex-col px-4 py-3.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {r.name}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {count > 0
                    ? `${count} ${count === 1 ? t("subsidies.programCount.one") : t("subsidies.programCount.other", { count })}`
                    : t("subsidies.viewSubsidies")}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          {t("subsidies.ctaText")}
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors"
        >
          {t("subsidies.ctaButton")}
        </a>
      </section>
    </div>
  );
}
