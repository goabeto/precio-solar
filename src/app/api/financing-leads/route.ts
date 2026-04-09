import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, notes, loanAmount, loanTermMonths, selectedProducts, postalCode, city, region, systemKwp, panelCount } = body;

    if (!name) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    if (!selectedProducts || selectedProducts.length === 0) {
      return NextResponse.json({ error: "Selecciona al menos un producto" }, { status: 400 });
    }

    // Try to save to DB (may fail if table doesn't exist yet)
    const leadId = await saveLead({
      name,
      phone: phone || null,
      email: email || null,
      lead_type: "financing",
      loan_amount: loanAmount,
      loan_term_months: loanTermMonths,
      selected_products: JSON.stringify(selectedProducts),
      notes: notes || null,
      postal_code: postalCode || null,
      city: city || null,
      region: region || null,
      system_size_kwp: systemKwp || null,
      panel_count: panelCount || null,
    });

    // Send notification email via Resend (critical path)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const productLines = selectedProducts.map(
          (p: { provider: string; name: string; taeMin: number; monthly: number }) =>
            `  - ${p.provider} (${p.name}): TAE ${p.taeMin}%, ${p.monthly}€/mes`
        ).join("\n");

        await resend.emails.send({
          from: "Solar Journey <leads@tuenergiaverde.es>",
          to: ["leads@goabeto.com"],
          subject: `Solicitud financiacion: ${name} - ${loanAmount}€ (${selectedProducts.length} opciones)`,
          text: [
            `Nueva solicitud de financiacion solar`,
            ``,
            `Nombre: ${name}`,
            `Telefono: ${phone || "N/A"}`,
            `Email: ${email || "N/A"}`,
            ``,
            `Importe: ${loanAmount}€`,
            `Plazo: ${loanTermMonths ? Math.round(loanTermMonths / 12) : "?"} años`,
            ``,
            `Productos seleccionados:`,
            productLines,
            ``,
            ...(city ? [`Ciudad: ${city}`, `Region: ${region || "N/A"}`] : []),
            ...(systemKwp ? [`Sistema: ${systemKwp}kWp (${panelCount || "?"} paneles)`] : []),
            ...(notes ? [``, `Notas: ${notes}`] : []),
            ``,
            `Lead ID: ${leadId || "no-db"}`,
          ].join("\n"),
        });
      }
    } catch (emailErr) {
      console.error("Financing lead email error:", emailErr);
    }

    return NextResponse.json({ success: true, id: leadId || "queued" });
  } catch (err) {
    console.error("Financing lead error:", err);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
