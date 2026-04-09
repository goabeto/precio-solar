import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { email, name, phone, ...rest } = body;
    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const id = await saveLead({ email, name, phone, ...rest });

    if (!id) {
      return NextResponse.json(
        { error: "Error al guardar. Inténtelo de nuevo." },
        { status: 500 }
      );
    }

    // Send notification email via Resend (async, non-blocking)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Solar Journey <leads@tuenergiaverde.es>",
          to: ["leads@goabeto.com"],
          subject: `Nuevo lead solar: ${name || email} - ${rest.city || ""} (${rest.system_size_kwp || "?"}kWp)`,
          text: [
            `Nuevo lead desde Solar Journey`,
            `Nombre: ${name || "N/A"}`,
            `Email: ${email}`,
            `Teléfono: ${phone || "N/A"}`,
            `Ciudad: ${rest.city || "N/A"}`,
            `Región: ${rest.region || "N/A"}`,
            `Sistema: ${rest.system_size_kwp || "?"}kWp (${rest.panel_count || "?"} paneles)`,
            `Coste estimado: ${rest.estimated_cost || "?"}€`,
            `Subvención: ${rest.subsidy_amount || 0}€`,
            `Coste neto: ${rest.net_cost || "?"}€`,
            `Preferencia: ${rest.financing_preference || "undecided"}`,
            `Paso alcanzado: ${rest.step_reached || 1}`,
          ].join("\n"),
        });
      }
    } catch {
      // Non-blocking — don't let email failure break the form
    }

    return NextResponse.json({ id });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
