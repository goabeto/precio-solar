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
        Ultima actualizacion: 17 de abril de 2026
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
          <strong>Numero de movil (WhatsApp):</strong> requerido en la calculadora para verificar que eres una persona real y establecer un canal de comunicacion. No realizamos llamadas comerciales.
        </li>
        <li>
          <strong>Direccion y ubicacion:</strong> codigo postal y, cuando solicitas contacto con un instalador, la direccion exacta de la propiedad donde deseas instalar los paneles.
        </li>
        <li>
          <strong>Datos del proyecto:</strong> consumo electrico, tamano del sistema solar calculado, preferencias de financiacion, timeline, respuestas a las preguntas de cualificacion.
        </li>
        <li>
          <strong>Archivos subidos:</strong> presupuestos de otros instaladores que decidas compartir (en la herramienta de revision de propuestas) se almacenan de forma segura.
        </li>
        <li>
          <strong>Datos de navegacion:</strong> datos anonimizados de uso del sitio web a traves de herramientas de analitica.
        </li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Utilizamos tus datos para:</p>
      <ul>
        <li>Proporcionarte estimaciones de precio para instalaciones solares.</li>
        <li>Contactarte via WhatsApp para darte seguimiento de tu solicitud.</li>
        <li>Actuar como intermediarios entre tu y el instalador seleccionado, preservando tu privacidad.</li>
        <li>Mejorar nuestro servicio y la precision de nuestras estimaciones mediante agregacion anonimizada de datos de mercado.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento de tus datos se basa en tu consentimiento explicito al
        aceptar las casillas de consentimiento en el formulario, asi como en nuestro
        interes legitimo de mejorar el servicio. Puedes retirar tu consentimiento en cualquier momento.
      </p>

      <h2>5. Comunicacion via WhatsApp</h2>
      <p>
        Cuando aceptas recibir comunicaciones via WhatsApp, usamos tu numero unicamente para:
      </p>
      <ul>
        <li>Verificar que eres una persona real (no bot).</li>
        <li>Compartirte respuestas y actualizaciones del instalador.</li>
        <li>Coordinar cualquier visita o contacto directo, solo con tu aprobacion previa.</li>
      </ul>
      <p>
        <strong>No realizamos llamadas comerciales.</strong> No compartimos tu numero con terceros salvo el instalador que hayas seleccionado explicitamente.
      </p>

      <h2>6. Destinatarios</h2>
      <p>
        Tus datos de contacto y proyecto seran compartidos unicamente con los
        instaladores que selecciones al final del flujo, y solo tras tu consentimiento explicito mediante las casillas del formulario. No vendemos ni cedemos tus datos a terceros con fines comerciales.
      </p>

      <h2>7. Conservacion</h2>
      <p>
        Conservamos tus datos durante el tiempo necesario para la prestacion del
        servicio y, en todo caso, durante los plazos legalmente establecidos. Puedes solicitar la eliminacion de tus datos en cualquier momento.
      </p>

      <h2>8. Derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificacion, supresion,
        oposicion, limitacion y portabilidad enviando un email a{" "}
        <a href="mailto:privacidad@goabeto.com">privacidad@goabeto.com</a> o via WhatsApp al numero indicado en el footer.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Este sitio utiliza cookies estrictamente necesarias para su
        funcionamiento y cookies de analitica anonimizadas para mejorar la
        experiencia del usuario. No utilizamos cookies publicitarias ni de
        seguimiento de terceros. Puedes gestionar tu consentimiento desde el banner que aparece al visitar el sitio por primera vez.
      </p>
    </article>
  );
}
