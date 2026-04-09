import { NextRequest, NextResponse } from "next/server";
import { createMessage, getMessagesByChat } from "@/lib/data";
import { getDictionary, translate, type Locale, LOCALES, DEFAULT_LOCALE, COOKIE_NAME } from "@/i18n";

function getLocaleFromRequest(req: NextRequest): Locale {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  return raw && LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE;
}

interface RouteParams {
  params: Promise<{ caseId: string; chatId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;
    const messages = await getMessagesByChat(chatId);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Get messages error:", err);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const locale = getLocaleFromRequest(req);
  const dict = getDictionary(locale);
  const t = (key: string, params?: Record<string, string | number>) => translate(dict, key, params);

  try {
    const { chatId } = await params;
    const body = await req.json();
    const { body: messageBody, senderType = "user" } = body;

    if (!messageBody) {
      return NextResponse.json(
        { error: t("api.messageRequired") },
        { status: 400 }
      );
    }

    const message = await createMessage({
      chat_id: chatId,
      sender_type: senderType,
      body: messageBody,
    });

    if (!message) {
      return NextResponse.json(
        { error: t("api.messageError") },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json(
      { error: t("api.messageError") },
      { status: 500 }
    );
  }
}
