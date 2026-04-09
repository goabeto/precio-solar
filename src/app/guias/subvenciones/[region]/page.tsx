import type { Metadata } from "next";
import { getSubsidyPrograms } from "@/lib/data";
import { getServerLocale } from "@/i18n/getServerLocale";
import { getDictionary, translate } from "@/i18n";
import { formatDate } from "@/i18n/formatters";

interface RegionSubsidyPageProps {
  params: Promise<{ region: string }>;
}

const REGION_MAP: Record<string, string> = {
  andalucia: "Andalucia",
  aragon: "Aragon",
  asturias: "Asturias",
  baleares: "Islas Baleares",
  canarias: "Canarias",
  cantabria: "Cantabria",
  "castilla-la-mancha": "Castilla-La Mancha",
  "castilla-y-leon": "Castilla y Leon",
  cataluna: "Cataluna",
  "comunidad-valenciana": "Comunidad Valenciana",
  extremadura: "Extremadura",
  galicia: "Galicia",
  madrid: "Madrid",
  murcia: "Region de Murcia",
  navarra: "Navarra",
  "pais-vasco": "Pais Vasco",
  "la-rioja": "La Rioja",
};

function regionName(slug: string): string {
  return REGION_MAP[slug] || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: RegionSubsidyPageProps): Promise<Metadata> {
  const { region } = await params;
  const name = regionName(region);
  return {
    title: `Subvenciones placas solares en ${name}`,
    description: `Ayudas y subvenciones para instalaciones solares en ${name}. Bonificaciones IBI, ICIO y programas autonomicos actualizados.`,
    alternates: { canonical: `/guias/subvenciones/${region}` },
  };
}

export default async function RegionSubsidyPage({ params }: RegionSubsidyPageProps) {
  const { region: regionSlug } = await params;
  const name = regionName(regionSlug);

  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  const subsidies = await getSubsidyPrograms(name);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <nav className="text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-foreground transition-colors">{t("regionSub.breadcrumbHome")}</a>
        <span className="mx-2 text-border">/</span>
        <a href="/guias" className="hover:text-foreground transition-colors">{t("regionSub.breadcrumbGuides")}</a>
        <span className="mx-2 text-border">/</span>
        <a href="/guias/subvenciones" className="hover:text-foreground transition-colors">{t("regionSub.breadcrumbSubsidies")}</a>
        <span className="mx-2 text-border">/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
        {t("regionSub.title", { region: name })}
      </h1>
      <p className="text-muted-foreground mb-8">
        {t("regionSub.desc", { region: name })}
      </p>

      {subsidies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">&#128269;</div>
          <p className="text-muted-foreground mb-2">
            {t("regionSub.noPrograms", { region: name })}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t("regionSub.noProgramsHint")}
          </p>
          <a
            href="/guias/subvenciones"
            className="text-primary hover:underline text-sm font-medium"
          >
            {t("regionSub.viewAllRegions")}
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {subsidies.map((s) => (
            <div key={s.id} className="border border-border rounded-lg p-4 sm:p-5 bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{s.name}</p>
                  {s.region ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{t("regionSub.regional")}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">{t("regionSub.national")}</p>
                  )}
                  {s.eligibility && (
                    <p className="text-sm text-muted-foreground mt-2">{s.eligibility}</p>
                  )}
                </div>
                {s.amount && (
                  <p className="font-heading font-bold text-primary shrink-0">{s.amount}</p>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  s.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {s.status === "active" ? t("status.active") : s.status}
                </span>
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("status.officialSource")} &rarr;
                  </a>
                )}
                {s.last_verified && (
                  <span className="text-xs text-muted-foreground">
                    {t("status.verified", { date: formatDate(s.last_verified, locale) })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <section className="mt-10 bg-primary/5 rounded-xl p-6 text-center">
        <p className="font-heading font-bold text-lg mb-2">
          {t("regionSub.ctaTitle", { region: name })}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          {t("regionSub.ctaDesc")}
        </p>
        <a
          href="/"
          className="inline-block bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors"
        >
          {t("regionSub.ctaButton")}
        </a>
      </section>
    </div>
  );
}
