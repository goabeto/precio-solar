import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description:
    "Aviso legal y condiciones de uso del sitio web Precio Solar.",
};

export default function LegalPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-neutral">
      <h1>Aviso Legal</h1>
      <p className="text-sm text-muted-foreground">
        Ultima actualizacion: marzo 2026
      </p>

      <h2>1. Titular del sitio web</h2>
      <p>
        Este sitio web es propiedad de Abeto Technologies, Lda., con domicilio
        social en Lisboa, Portugal.
      </p>

      <h2>2. Objeto</h2>
      <p>
        Este sitio web ofrece una herramienta de calculo orientativo para
        estimar el coste de instalaciones de paneles solares fotovoltaicos en
        Espana, asi como un servicio de conexion con instaladores profesionales.
      </p>

      <h2>3. Estimaciones y precios</h2>
      <p>
        Los precios y estimaciones mostrados en esta web son orientativos y se
        basan en datos de mercado y referencias publicas. No constituyen una
        oferta vinculante. Los precios finales dependeran de las
        caracteristicas concretas de cada instalacion y seran determinados por
        el instalador profesional.
      </p>

      <h2>4. Subvenciones</h2>
      <p>
        La informacion sobre subvenciones y ayudas publicas se actualiza
        periodicamente pero puede no reflejar los cambios mas recientes. Te
        recomendamos verificar la disponibilidad de las ayudas con tu comunidad
        autonoma o con el instalador seleccionado.
      </p>

      <h2>5. Instaladores</h2>
      <p>
        Los instaladores mostrados son empresas independientes. No somos
        responsables de los servicios prestados por los instaladores, sus
        precios finales ni la calidad de su trabajo. Te recomendamos verificar
        las certificaciones y referencias de cualquier instalador antes de
        contratar.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        Todos los contenidos de este sitio web (textos, disenos, logotipos,
        graficos, codigo fuente) son propiedad del titular o de terceros que
        han autorizado su uso y estan protegidos por la legislacion de
        propiedad intelectual.
      </p>

      <h2>7. Limitacion de responsabilidad</h2>
      <p>
        El titular no se hace responsable de los danos o perjuicios derivados
        del uso de la informacion proporcionada en este sitio web, incluyendo
        errores en las estimaciones de precio, datos de subvenciones
        desactualizados o interrupciones del servicio.
      </p>

      <h2>8. Legislacion aplicable</h2>
      <p>
        Este aviso legal se rige por la legislacion espanola. Para cualquier
        controversia derivada del uso de este sitio web, las partes se someten
        a los juzgados y tribunales competentes.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Para cualquier consulta legal, puedes contactarnos en{" "}
        <a href="mailto:legal@goabeto.com">legal@goabeto.com</a>.
      </p>
    </article>
  );
}
