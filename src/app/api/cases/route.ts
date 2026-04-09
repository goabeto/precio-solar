import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCase, getCaseBySession, createChat, createMessage } from "@/lib/data";
import { generateInitialMessage, generateSystemMessage } from "@/lib/chat-templates";
import { getDictionary, translate, type Locale, LOCALES, DEFAULT_LOCALE, COOKIE_NAME } from "@/i18n";

function getLocaleFromRequest(req: NextRequest): Locale {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  return raw && LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE;
}

function generateSessionToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  const locale = getLocaleFromRequest(req);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  try {
    const body = await req.json();
    const { result, selectedInstallers, messages } = body;

    if (!result || !selectedInstallers || selectedInstallers.length === 0) {
      return NextResponse.json(
        { error: t("api.caseDataRequired") },
        { status: 400 }
      );
    }

    const sessionToken = generateSessionToken();

    // Create case
    const caseData = await createCase({
      session_token: sessionToken,
      postal_code: result.location.postalCode,
      city: result.location.city,
      region: result.location.region,
      system_size_kwp: result.system.kwp,
      panel_count: result.system.panelCount,
      estimated_cost: result.pricing.estimatedCost,
      subsidy_amount: result.pricing.subsidyAmount,
      net_cost: result.pricing.netCost,
      monthly_bill: result.savings.currentMonthlyBill,
      monthly_saving: result.savings.monthlySaving,
      include_battery: result.system.includeBattery,
      financing_preference: body.financingPreference || null,
      phone: body.phone || null,
      email: body.email || null,
    });

    if (!caseData) {
      return NextResponse.json(
        { error: t("api.caseDbError") },
        { status: 500 }
      );
    }

    // Create chats for each selected installer
    const chats = [];
    for (const installer of selectedInstallers) {
      const initialMsg =
        messages?.[installer.id] ||
        generateInitialMessage(result, installer.name);

      const chat = await createChat({
        case_id: caseData.id,
        listing_id: installer.id,
        listing_name: installer.name,
        initial_message: initialMsg,
        status: "pending",
      });

      if (chat) {
        // Create initial user message
        await createMessage({
          chat_id: chat.id,
          sender_type: "user",
          body: initialMsg,
        });

        // Create system message
        await createMessage({
          chat_id: chat.id,
          sender_type: "system",
          body: generateSystemMessage("case_created"),
        });

        chats.push(chat);
      }
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("sj_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
    });

    return NextResponse.json({
      caseId: caseData.id,
      sessionToken,
      chats,
    });
  } catch (err) {
    console.error("Create case error:", err);
    return NextResponse.json(
      { error: t("api.caseError") },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("sj_session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ case: null });
    }

    const caseData = await getCaseBySession(sessionToken);
    return NextResponse.json({ case: caseData });
  } catch (err) {
    console.error("Get case error:", err);
    return NextResponse.json({ case: null });
  }
}
