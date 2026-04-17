import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Save to Supabase solar_journey_cases
    const supabase = getServerSupabase();
    let caseId: string | null = null;

    if (supabase) {
      const sessionToken = `pc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const { data, error } = await supabase
        .from("solar_journey_cases" as never)
        .insert({
          session_token: sessionToken,
          postal_code: body.postalCode,
          city: body.city,
          region: body.region,
          address: body.address,
          is_owner: body.isOwner,
          is_private: body.isPrivate,
          allow_visit: body.allowVisit,
          timeline: body.timeline,
          has_existing_proposal: body.hasExistingProposal,
          comments: body.comments || null,
          system_size_kwp: body.systemSizeKwp,
          panel_count: body.panelCount,
          estimated_cost: body.estimatedCost,
          subsidy_amount: body.subsidyAmount,
          net_cost: body.netCost,
          monthly_bill: body.monthlyBill,
          monthly_saving: body.monthlySaving,
          include_battery: body.includeBattery,
          selected_installers: body.selectedInstallers,
          consent_whatsapp: body.consentWhatsApp,
          consent_share_data: body.consentShareData,
          consent_terms: body.consentTerms,
        } as never)
        .select("id")
        .single();

      if (error) {
        console.error("createCase error:", error.message);
      } else if (data) {
        caseId = (data as { id: string }).id;
      }
    }

    // Send email notification to team (fire-and-forget)
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.LEAD_NOTIFICATION_EMAIL || "nuno@goabeto.com";

    if (resendKey) {
      const resend = new Resend(resendKey);
      resend.emails
        .send({
          from: "Precio Solar <leads@goabeto.com>",
          to: notifyEmail,
          subject: `Nueva solicitud: ${body.city} · ${body.systemSizeKwp} kWp`,
          html: `
<h2>Nueva solicitud de instalador</h2>
<p><strong>Caso ID:</strong> ${caseId || "(no DB)"}</p>
<hr>
<h3>Ubicacion y sistema</h3>
<ul>
<li><strong>Direccion:</strong> ${body.address}</li>
<li><strong>Ciudad:</strong> ${body.city}, ${body.region}</li>
<li><strong>Codigo postal:</strong> ${body.postalCode}</li>
<li><strong>Sistema:</strong> ${body.systemSizeKwp} kWp, ${body.panelCount} paneles</li>
<li><strong>Factura mensual:</strong> ${body.monthlyBill} EUR</li>
<li><strong>Coste neto:</strong> ${body.netCost} EUR (tras ${body.subsidyAmount} EUR subvencion)</li>
<li><strong>Bateria:</strong> ${body.includeBattery ? "Si" : "No"}</li>
</ul>
<h3>Cualificacion</h3>
<ul>
<li><strong>Propietario:</strong> ${body.isOwner}</li>
<li><strong>Tipo:</strong> ${body.isPrivate}</li>
<li><strong>Permite visita:</strong> ${body.allowVisit}</li>
<li><strong>Timeline:</strong> ${body.timeline}</li>
<li><strong>Tiene presupuesto previo:</strong> ${body.hasExistingProposal}</li>
</ul>
<h3>Instaladores seleccionados</h3>
<ul>
${(body.selectedInstallers || []).map((i: { name: string; city: string }) => `<li>${i.name} (${i.city})</li>`).join("")}
</ul>
<h3>Comentarios</h3>
<p>${body.comments || "(ninguno)"}</p>
<h3>Consentimientos</h3>
<ul>
<li>WhatsApp: ${body.consentWhatsApp ? "SI" : "NO"}</li>
<li>Compartir datos: ${body.consentShareData ? "SI" : "NO"}</li>
<li>Terminos: ${body.consentTerms ? "SI" : "NO"}</li>
</ul>
          `,
        })
        .catch((e) => console.error("Resend error:", e));
    }

    return NextResponse.json({ caseId, success: true });
  } catch (err) {
    console.error("Qualify error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
