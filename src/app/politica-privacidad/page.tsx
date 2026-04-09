import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Privacidad",
  description:
    "Politica de privacidad y proteccion de datos personales de Precio Solar.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-neutral">
      <h1>Politica de Privacidad</h1>
      <p className="text-sm text-muted-foreground">
        Ultima actualizacion: marzo 2026
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales recogidos a
        traves de este sitio web es Abeto Technologies, Lda. (en adelante,
        &quot;el Responsable&quot;).
      </p>

      <h2>2. Datos que recopilamos</h2>
      <p>Recopilamos los siguientes datos personales:</p>
      <ul>
        <li>
          <strong>Datos de contacto:</strong> nombre, email y telefono (cuando
          los proporcionas voluntariamente al solicitar presupuestos).
        </li>
        <li>
          <strong>Datos del proyecto:</strong> codigo postal, consumo electrico,
          tamano del sistema solar calculado, preferencias de financiacion.
        </li>
        <li>
          <strong>Datos de navegacion:</strong> datos anonimizados de uso del
          sitio web a traves de herramientas de analitica.
        </li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Utilizamos tus datos para:</p>
      <ul>
        <li>
          Proporcionarte estimaciones de precio para instalaciones solares.
        </li>
        <li>
          Conectarte con instaladores verificados en tu zona que puedan
          ofrecerte presupuestos.
        </li>
        <li>Mostrarte opciones de financiacion relevantes para tu proyecto.</li>
        <li>Mejorar nuestro servicio y la precision de nuestras estimaciones.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento de tus datos se basa en tu consentimiento explicito al
        enviar el formulario de solicitud de presupuesto, asi como en nuestro
        interes legitimo de mejorar el servicio.
      </p>

      <h2>5. Destinatarios</h2>
      <p>
        Tus datos de contacto y proyecto seran compartidos unicamente con los
        instaladores que selecciones para solicitar presupuesto. No vendemos ni
        cedemos tus datos a terceros con fines comerciales.
      </p>

      <h2>6. Conservacion</h2>
      <p>
        Conservamos tus datos durante el tiempo necesario para la prestacion del
        servicio y, en todo caso, durante los plazos legalmente establecidos.
      </p>

      <h2>7. Derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificacion, supresion,
        oposicion, limitacion y portabilidad enviando un email a{" "}
        <a href="mailto:privacidad@goabeto.com">privacidad@goabeto.com</a>.
      </p>

      <h2>8. Cookies</h2>
      <p>
        Este sitio utiliza cookies estrictamente necesarias para su
        funcionamiento y cookies de analitica anonimizadas para mejorar la
        experiencia del usuario. No utilizamos cookies publicitarias ni de
        seguimiento de terceros.
      </p>
    </article>
  );
}
