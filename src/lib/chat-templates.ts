import type { CalculationResult } from "@/components/SolarCalculator";

export function generateInitialMessage(
  result: CalculationResult,
  installerName: string
): string {
  const { system, pricing, savings, location } = result;

  const lines = [
    `Hola ${installerName},`,
    "",
    `Estoy interesado/a en instalar placas solares en ${location.city || location.region} (${location.postalCode}).`,
    "",
    "Datos de mi proyecto:",
    `- Sistema recomendado: ${system.kwp} kWp (${system.panelCount} paneles)`,
    `- Produccion anual estimada: ${system.annualProductionKwh.toLocaleString("es-ES")} kWh`,
    `- Precio de referencia: ${pricing.estimatedCost.toLocaleString("es-ES")} EUR`,
    system.includeBattery ? "- Incluye bateria de almacenamiento" : "",
    pricing.subsidyAmount > 0
      ? `- Subvenciones disponibles: ${pricing.subsidyAmount.toLocaleString("es-ES")} EUR`
      : "",
    `- Mi factura mensual actual: ${savings.currentMonthlyBill} EUR/mes`,
    "",
    "Me gustaria saber:",
    "1. Precio final para mi instalacion",
    "2. Plazos de instalacion",
    "3. Ayuda con tramites de subvenciones",
    "4. Garantias ofrecidas",
    "5. Marcas de equipos utilizados",
    "",
    "Gracias por su tiempo.",
  ];

  return lines.filter((l) => l !== "").join("\n");
}

export function generateSystemMessage(type: "case_created" | "installer_notified"): string {
  switch (type) {
    case "case_created":
      return "Conversacion iniciada. Tu mensaje ha sido enviado al instalador.";
    case "installer_notified":
      return "El instalador ha sido notificado de tu solicitud.";
    default:
      return "";
  }
}
