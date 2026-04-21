"use client";

import { useState } from "react";
import type { CalculationResult } from "./SolarCalculator";

interface LeadFormProps {
  result: CalculationResult;
  selectedInstallerIds: string[];
  onSuccess: () => void;
  onBack: () => void;
}

export default function LeadForm({
  result,
  selectedInstallerIds,
  onSuccess,
  onBack,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [financing, setFinancing] = useState("undecided");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Spanish mobile: 6xx or 7xx (9 digits), optionally with +34 prefix
  const normalizeSpanishPhone = (raw: string): string | null => {
    const cleaned = raw.replace(/[\s\-().]/g, "");
    if (/^\+34[67]\d{8}$/.test(cleaned)) return cleaned;
    if (/^34[67]\d{8}$/.test(cleaned)) return "+" + cleaned;
    if (/^[67]\d{8}$/.test(cleaned)) return "+34" + cleaned;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError("Nombre y email son obligatorios");
      return;
    }
    const normalizedPhone = normalizeSpanishPhone(phone);
    if (!normalizedPhone) {
      setError("Introduce un numero de movil espanol valido (empieza por 6 o 7)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: normalizedPhone,
          postal_code: result.location.postalCode,
          city: result.location.city,
          region: result.location.region,
          monthly_bill: result.savings.currentMonthlyBill,
          annual_consumption_kwh: result.savings.annualConsumptionKwh,
          system_size_kwp: result.system.kwp,
          panel_count: result.system.panelCount,
          estimated_cost: result.pricing.estimatedCost,
          subsidy_amount: result.pricing.subsidyAmount,
          net_cost: result.pricing.netCost,
          monthly_saving: result.savings.monthlySaving,
          installers_contacted: selectedInstallerIds,
          financing_preference: financing,
          step_reached: 3,
          status: "inquiry_sent",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al enviar. Intentalo de nuevo.");
        return;
      }

      onSuccess();
    } catch {
      setError("Error de conexion. Intentalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-heading font-bold">
          Ultimos datos para tu solicitud
        </h2>
        <p className="text-muted-foreground mt-1">
          Te conectaremos con {selectedInstallerIds.length || "los mejores"} instaladores
          en {result.location.city || result.location.region}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-success/30 rounded-xl p-4 mb-6 text-sm">
        <p className="font-medium text-success-foreground mb-2">
          Resumen de tu solicitud:
        </p>
        <ul className="space-y-1 text-success-foreground/80">
          <li>Sistema: {result.system.kwp} kWp ({result.system.panelCount} paneles)</li>
          <li>Precio referencia: {result.pricing.netCost.toLocaleString("es-ES")} &euro; (con subvenciones)</li>
          <li>Ahorro estimado: {result.savings.monthlySaving} &euro;/mes</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefono movil *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+34</span>
            <input
              type="tel"
              inputMode="tel"
              maxLength={12}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s\-]/g, ""))}
              required
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
              placeholder="600 000 000"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Para que el instalador pueda contactarte. No compartimos tu numero con nadie.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Preferencia de pago
          </label>
          <select
            value={financing}
            onChange={(e) => setFinancing(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="undecided">Todavia no lo se</option>
            <option value="cash">Al contado</option>
            <option value="loan">Financiado (prestamo)</option>
            <option value="subscription">Suscripcion mensual</option>
          </select>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive text-destructive-foreground text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Enviar solicitud"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Volver
        </button>
      </form>
    </div>
  );
}
