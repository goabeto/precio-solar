import type { Metadata } from "next";
import Link from "next/link";
import RegionGrid from "@/components/RegionGrid";

export const metadata: Metadata = {
  title: "Guias Solares — Todo lo que necesitas saber antes de instalar",
  description:
    "Guias practicas de energia solar: cuanto cuestan las placas, que subvenciones hay, como financiar, y como elegir instalador. Con datos reales del mercado espanol 2026.",
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

const PRICING_DATA = [
  { size: "3 kWp", panels: "7", price: "4.200 - 5.400", ideal: "1-2 personas, piso" },
  { size: "5 kWp", panels: "11", price: "6.600 - 8.900", ideal: "2-3 personas, adosado" },
  { size: "7 kWp", panels: "16", price: "7.800 - 8.200", ideal: "3-4 personas, unifamiliar" },
  { size: "10 kWp", panels: "22", price: "10.500 - 13.500", ideal: "4+ personas, gran consumo" },
];

const FAQ_DATA = [
  { q: "Cuanto cuesta instalar placas solares en 2026?", a: "El precio medio en Espana para una instalacion residencial esta entre 4.200 EUR y 13.500 EUR segun el tamano (3-10 kWp). Con subvenciones puede reducirse entre un 30% y 50%. Usa nuestra calculadora para obtener un precio personalizado." },
  { q: "Cuantos paneles necesito para mi casa?", a: "Depende de tu consumo electrico. Para una factura de 80 EUR/mes en Madrid necesitarias unos 9 paneles (3.66 kWp). En el sur de Espana, menos paneles producen la misma energia gracias a mayor irradiacion solar." },
  { q: "Merece la pena poner bateria?", a: "Con bateria aprovechas hasta el 65% de la energia generada (vs 35% sin bateria), pero anade 3.000-6.000 EUR al coste. Recomendamos empezar sin bateria y anadir despues si tu patron de consumo lo justifica." },
  { q: "Que subvenciones hay disponibles?", a: "Existen ayudas a nivel nacional (Next Generation EU, IVA reducido al 10%), autonomico (programas IDAE) y municipal (bonificaciones IBI hasta el 50% durante 3-5 anos, ICIO). Cada municipio tiene sus propias bonificaciones." },
  { q: "Cuanto tarda la amortizacion?", a: "Entre 5 y 8 anos dependiendo de la zona, consumo y subvenciones aplicadas. En el sur de Espana con buena irradiacion y subvenciones, puede bajar a 4-5 anos." },
  { q: "Como elijo un buen instalador?", a: "Busca instaladores con certificaciones REBT, opiniones verificadas (Google 4.5+), experiencia demostrable y que ofrezcan garantia de instalacion. Compara al menos 2-3 presupuestos antes de decidir." },
];

export default async function GuidesHubPage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-surface-container-low to-background py-12 sm:py-16 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
            Guias actualizadas a 2026
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-foreground max-w-3xl mx-auto leading-tight">
            Todo lo que necesitas saber antes de instalar placas solares
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Guias practicas con datos reales del mercado espanol. Precios, subvenciones, financiacion y como elegir instalador &mdash; sin jerga tecnica.
          </p>
        </div>
      </section>

      {/* ── Quick tools ─────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Link href="/" className="bg-white rounded-2xl shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all p-6 group text-center block">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">&#9728;&#65039;</div>
              <h3 className="font-heading font-extrabold text-foreground mb-1">Calculadora Solar</h3>
              <p className="text-sm text-muted-foreground">Precio estimado, subvenciones y ahorro mensual personalizado para tu ubicacion.</p>
              <span className="inline-block mt-3 text-xs font-bold bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full">Popular</span>
            </Link>
            <Link href="/comparar-financiacion" className="bg-white rounded-2xl shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all p-6 group text-center block">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">&#128176;</div>
              <h3 className="font-heading font-extrabold text-foreground mb-1">Comparador de Financiacion</h3>
              <p className="text-sm text-muted-foreground">13+ proveedores: bancos, fintech e ICO Verde. Compara TAE, cuota y condiciones.</p>
            </Link>
            <Link href="/revisar-propuesta" className="bg-white rounded-2xl shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all p-6 group text-center block">
              <div className="w-14 h-14 rounded-xl bg-tertiary/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">&#128203;</div>
              <h3 className="font-heading font-extrabold text-foreground mb-1">Revisar Presupuesto</h3>
              <p className="text-sm text-muted-foreground">Tienes un presupuesto? Analizamos si el precio es justo comparado con el mercado.</p>
              <span className="inline-block mt-3 text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">Unico en Espana</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing table ────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-surface-container-low">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground text-center mb-2">
            Precios orientativos en 2026
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
            Sin bateria, con instalacion incluida. Antes de subvenciones.
          </p>
          <div className="bg-white rounded-2xl shadow-ambient overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 font-heading font-extrabold text-foreground">Tamano</th>
                    <th className="text-left px-5 py-3 font-heading font-extrabold text-foreground">Paneles</th>
                    <th className="text-left px-5 py-3 font-heading font-extrabold text-foreground">Rango de precio</th>
                    <th className="text-left px-5 py-3 font-heading font-extrabold text-foreground hidden sm:table-cell">Ideal para</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING_DATA.map((row) => (
                    <tr key={row.size} className="border-b border-border last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-foreground">{row.size}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{row.panels}</td>
                      <td className="px-5 py-3.5 font-semibold text-primary">{row.price} &euro;</td>
                      <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{row.ideal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-surface-container-low/50 text-xs text-muted-foreground">
              Fuente: datos de mercado Precio Solar + SotySolar. Precios incluyen instalacion. IVA incluido.
              <Link href="/" className="text-primary font-semibold ml-2 hover:underline">Calcula tu precio exacto &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key numbers ──────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-ambient p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">0.24 &euro;</p>
              <p className="text-xs text-muted-foreground mt-1">Precio medio kWh en Espana</p>
            </div>
            <div className="bg-white rounded-2xl shadow-ambient p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">1.400+</p>
              <p className="text-xs text-muted-foreground mt-1">Horas de sol/ano (media)</p>
            </div>
            <div className="bg-white rounded-2xl shadow-ambient p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">5-8</p>
              <p className="text-xs text-muted-foreground mt-1">Anos de amortizacion</p>
            </div>
            <div className="bg-white rounded-2xl shadow-ambient p-5 text-center">
              <p className="text-2xl font-extrabold text-primary">25+</p>
              <p className="text-xs text-muted-foreground mt-1">Anos de vida util</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-surface-container-low">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground text-center mb-2">
            Preguntas frecuentes
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Las dudas mas comunes antes de dar el paso al autoconsumo solar
          </p>
          <div className="space-y-4">
            {FAQ_DATA.map((faq, i) => (
              <details key={i} className="bg-white rounded-2xl shadow-ambient group">
                <summary className="px-6 py-4 cursor-pointer font-heading font-extrabold text-sm text-foreground flex items-center justify-between list-none">
                  {faq.q}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 ml-3"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subvenciones por CCAA ────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground">
                Subvenciones por comunidad autonoma
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Bonificaciones IBI, ICIO y programas autonomicos vigentes
              </p>
            </div>
            <a href="https://tuenergiaverde.es/subvenciones" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline hidden sm:block">
              Ver detalle completo &rarr;
            </a>
          </div>
          <RegionGrid regions={CCAA_REGIONS} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-surface-container-low">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mb-3">
            Listo para dar el paso?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Calcula tu precio en menos de 2 minutos. Sin compromiso, sin llamadas comerciales.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors shadow-ambient text-lg"
            >
              Calcular mi precio solar
            </Link>
            <Link
              href="/revisar-propuesta"
              className="inline-block border border-border text-foreground px-8 py-3.5 rounded-xl font-heading font-bold hover:border-primary/40 hover:text-primary transition-colors"
            >
              Ya tengo un presupuesto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
