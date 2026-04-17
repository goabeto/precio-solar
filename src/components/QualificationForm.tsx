"use client";

import { useState } from "react";
import type { CalculationResult } from "./SolarCalculator";
import type { InstallerDetail } from "./InstallerResults";

interface QualificationFormProps {
  result: CalculationResult;
  selectedInstallers: InstallerDetail[];
  onBack: () => void;
  onReset: () => void;
}

export default function QualificationForm({
  result,
  selectedInstallers,
  onBack,
  onReset,
}: QualificationFormProps) {
  const [address, setAddress] = useState("");
  const [isOwner, setIsOwner] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<string>("");
  const [allowVisit, setAllowVisit] = useState<string>("");
  const [timeline, setTimeline] = useState("");
  const [hasExistingProposal, setHasExistingProposal] = useState<string>("");
  const [existingProposalFile, setExistingProposalFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [consentWhatsApp, setConsentWhatsApp] = useState(false);
  const [consentShareData, setConsentShareData] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const installerNames = selectedInstallers.map((i) => i.name).join(", ");
  const canSubmit = address && isOwner && isPrivate && timeline && consentWhatsApp && consentShareData && consentTerms;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Save to Supabase
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postalCode: result.location.postalCode,
          city: result.location.city,
          region: result.location.region,
          address,
          isOwner,
          isPrivate,
          allowVisit,
          timeline,
          hasExistingProposal,
          comments,
          systemSizeKwp: result.system.kwp,
          panelCount: result.system.panelCount,
          estimatedCost: result.pricing.estimatedCost,
          subsidyAmount: result.pricing.subsidyAmount,
          netCost: result.pricing.netCost,
          monthlyBill: result.savings.currentMonthlyBill,
          monthlySaving: result.savings.monthlySaving,
          includeBattery: result.system.includeBattery,
          selectedInstallers: selectedInstallers.map((i) => ({ id: i.id, name: i.name, city: i.city })),
          consentWhatsApp,
          consentShareData,
          consentTerms,
        }),
      });
      const data = await res.json();
      const caseId = data.caseId || "ref-unknown";

      // Open WhatsApp with pre-filled message
      const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "34600000000";
      const msg = `Hola! Soy un cliente de Precio Solar (ref ${caseId.slice(0, 8)}).\n\n` +
        `Mi instalacion: ${result.system.kwp} kWp · ${result.location.city}\n` +
        `Precio estimado: ${result.pricing.netCost} EUR (con subvenciones)\n` +
        `Instalador seleccionado: ${installerNames}\n\n` +
        `Quiero que contacteis al instalador en mi nombre. Gracias!`;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

      // Open in new tab
      window.open(waUrl, "_blank");
      setSubmitted(true);
    } catch (e) {
      console.error("Submit error:", e);
      alert("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="text-5xl mb-4">&#9989;</div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mb-3">
          Solicitud enviada
        </h2>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Hemos recibido tu solicitud. Contactaremos a {installerNames} en tu nombre y te enviaremos su respuesta via WhatsApp.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Sin llamadas comerciales. Sin visitas sin tu aprobacion.
        </p>
        <button onClick={onReset} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors shadow-ambient">
          Nueva busqueda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground">
          Ultimos detalles antes de contactar
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Ningun instalador puede darte una propuesta final y personalizada sin estas respuestas. La buena noticia: solo tarda 1 minuto y no hay respuestas incorrectas.
        </p>
      </div>

      {/* Selected installer reminder */}
      <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
          {selectedInstallers.length}
        </div>
        <p className="text-sm text-foreground">
          Contactaremos a <strong>{installerNames}</strong> en tu nombre, protegiendo tus datos.
        </p>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-2xl shadow-ambient p-6 space-y-5">
        {/* Q1: Location */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            1. Direccion de la propiedad
          </label>
          <p className="text-xs text-muted-foreground mb-2">Necesitamos la ubicacion exacta para que un experto analice tu tejado y determine la viabilidad y exposicion solar.</p>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, numero, ciudad, codigo postal"
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition"
          />
        </div>

        {/* Q2: Owner */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            2. Eres el propietario de la vivienda?
          </label>
          <div className="flex gap-3 mt-1">
            {["Si", "No"].map((opt) => (
              <button key={opt} onClick={() => setIsOwner(opt)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${isOwner === opt ? "bg-primary text-primary-foreground" : "bg-surface-container-low text-foreground hover:bg-surface-container-high"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q3: Private or community */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            3. Es una propiedad individual o necesitas aprobacion de la comunidad?
          </label>
          <div className="flex gap-3 mt-1">
            {["Individual", "Comunidad"].map((opt) => (
              <button key={opt} onClick={() => setIsPrivate(opt)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${isPrivate === opt ? "bg-primary text-primary-foreground" : "bg-surface-container-low text-foreground hover:bg-surface-container-high"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q4: Visit */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            4. Puede un tecnico visitar tu vivienda?
          </label>
          <p className="text-xs text-muted-foreground mb-2">Los instaladores suelen asegurar una visita en 24-72h tras el primer contacto. Los clientes se sienten mas tranquilos cuando un experto responde sus dudas en persona. Lo recomendamos.</p>
          <div className="flex gap-3 mt-1">
            {["Si, adelante", "Prefiero esperar", "Solo online"].map((opt) => (
              <button key={opt} onClick={() => setAllowVisit(opt)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${allowVisit === opt ? "bg-primary text-primary-foreground" : "bg-surface-container-low text-foreground hover:bg-surface-container-high"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q5: Timeline */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            5. Cuando te gustaria tener los paneles instalados?
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Lo antes posible", "1 mes", "3 meses", "Solo estoy explorando"].map((opt) => (
              <button key={opt} onClick={() => setTimeline(opt)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeline === opt ? "bg-primary text-primary-foreground" : "bg-surface-container-low text-foreground hover:bg-surface-container-high"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q6: Existing proposal */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            6. Tienes algun presupuesto de otro instalador?
          </label>
          <p className="text-xs text-muted-foreground mb-2">Esta informacion es genial para posicionarte mejor ante un nuevo proveedor. Lo recomendamos.</p>
          <div className="flex gap-3 mt-1">
            {["Si", "No"].map((opt) => (
              <button key={opt} onClick={() => setHasExistingProposal(opt)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${hasExistingProposal === opt ? "bg-primary text-primary-foreground" : "bg-surface-container-low text-foreground hover:bg-surface-container-high"}`}>
                {opt}
              </button>
            ))}
          </div>
          {hasExistingProposal === "Si" && (
            <div className="mt-3 border-2 border-dashed border-border rounded-xl p-3 text-center">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg text-xs font-medium text-foreground cursor-pointer hover:bg-surface-container-high transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Subir presupuesto
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setExistingProposalFile(e.target.files[0]); }} />
              </label>
              {existingProposalFile && <p className="text-xs text-primary mt-1">{existingProposalFile.name}</p>}
            </div>
          )}
        </div>

        {/* Q7: Comments */}
        <div>
          <label className="block text-sm font-heading font-extrabold text-foreground mb-1">
            7. Alguna pregunta o comentario?
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Cualquier duda o detalle adicional..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition resize-none"
          />
        </div>
      </div>

      {/* Consent section */}
      <div className="bg-white rounded-2xl shadow-ambient p-6 space-y-4">
        <h3 className="font-heading font-extrabold text-foreground text-sm">Permisos y consentimiento</h3>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consentWhatsApp} onChange={(e) => setConsentWhatsApp(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-foreground">
            <strong>Acepto recibir comunicaciones via WhatsApp</strong> con la respuesta del instalador y actualizaciones sobre mi solicitud.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consentShareData} onChange={(e) => setConsentShareData(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-foreground">
            <strong>Autorizo compartir mis datos con {installerNames || "el instalador seleccionado"}</strong>. Ningun instalador realizara visitas ni llamadas sin mi aprobacion previa.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={consentTerms} onChange={(e) => setConsentTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-foreground">
            Acepto los <a href="/aviso-legal" target="_blank" className="text-primary underline">terminos y condiciones</a> y la <a href="/politica-privacidad" target="_blank" className="text-primary underline">politica de privacidad</a>.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl text-lg font-heading font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-ambient"
        >
          {submitting ? "Enviando..." : "Enviar solicitud via WhatsApp"}
        </button>
        <button onClick={onBack} className="px-6 py-3.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
          Volver
        </button>
      </div>
    </div>
  );
}
