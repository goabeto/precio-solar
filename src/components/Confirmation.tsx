"use client";

import type { CalculationResult } from "./SolarCalculator";

interface ConfirmationProps {
  result: CalculationResult;
  onReset: () => void;
}

export default function Confirmation({ result, onReset }: ConfirmationProps) {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-success-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-heading font-bold mb-2">
        Solicitud enviada
      </h2>
      <p className="text-muted-foreground mb-8">
        Hemos enviado tu solicitud con todos los detalles de tu proyecto solar.
        Los instaladores seleccionados te contactaran en las proximas 24-48 horas.
      </p>

      <div className="bg-card rounded-2xl border border-border p-6 text-left mb-6">
        <h3 className="font-heading font-bold mb-3">
          Los instaladores recibiran:
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">&#10003;</span>
            Tu ubicacion: {result.location.city || result.location.region}
          </li>
          <li className="flex gap-2">
            <span className="text-primary">&#10003;</span>
            Sistema recomendado: {result.system.kwp} kWp ({result.system.panelCount} paneles)
          </li>
          <li className="flex gap-2">
            <span className="text-primary">&#10003;</span>
            Precio de referencia: {result.pricing.netCost.toLocaleString("es-ES")} &euro;
          </li>
          <li className="flex gap-2">
            <span className="text-primary">&#10003;</span>
            Preguntas sobre plazos, garantias y financiacion
          </li>
        </ul>
      </div>

      <div className="bg-muted rounded-xl p-4 mb-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Que esperar:</p>
        <p>
          Cada instalador te confirmara si puede igualar o mejorar el precio de
          referencia, sus plazos, y si gestiona las subvenciones por ti.
        </p>
      </div>

      <button
        onClick={onReset}
        className="px-8 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        Hacer otro calculo
      </button>
    </div>
  );
}
