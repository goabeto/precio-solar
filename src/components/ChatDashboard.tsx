"use client";

import { useState, useEffect, useCallback } from "react";
import type { CalculationResult } from "./SolarCalculator";
import ChatThread from "./ChatThread";
import { useTranslation } from "@/i18n/useTranslation";
import { formatEuro as fmtEuro, formatNumber } from "@/i18n/formatters";

interface ChatInfo {
  id: string;
  case_id: string;
  listing_id: string;
  listing_name: string;
  status: string;
  initial_message: string | null;
  installer_responded: boolean;
  created_at: string;
}

interface ChatDashboardProps {
  result: CalculationResult;
  caseId: string;
  onReset: () => void;
}

function getStatusLabel(status: string, t: (key: string) => string): { text: string; color: string } {
  const colors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    active: "bg-green-100 text-green-800",
    responded: "bg-blue-100 text-blue-800",
    closed: "bg-muted text-muted-foreground",
  };
  return { text: t("chatStatus." + status), color: colors[status] || colors.pending };
}

export default function ChatDashboard({
  result,
  caseId,
  onReset,
}: ChatDashboardProps) {
  const { t, locale } = useTranslation();
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`/api/cases`);
      if (res.ok) {
        const data = await res.json();
        if (data.case) {
          // Fetch chats for this case
          // For now, we store chats from the create response
        }
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    // On mount, set chats from the initial data stored in page state
    // The actual chats are passed via the creation response
    setLoading(false);
  }, []);

  // Poll for updates every 15s
  useEffect(() => {
    const interval = setInterval(fetchChats, 15000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  // Set chats from external prop (page.tsx passes them)
  useEffect(() => {
    // Chats are loaded when the component mounts from the parent
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id);
    }
  }, [chats, activeChat]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          {t("chat.title")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t("chat.subtitle")}
        </p>
      </div>

      {/* Project summary (collapsible) */}
      <div className="mb-6">
        <button
          onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3 text-sm"
        >
          <span className="font-bold text-foreground">
            {result.system.kwp} kWp en {result.location.city} &middot;{" "}
            {fmtEuro(result.pricing.netCost, locale)}
          </span>
          <span className="text-primary text-xs">
            {showSummary ? t("chat.hideDetails") : t("chat.showDetails")}
          </span>
        </button>
        {showSummary && (
          <div className="bg-muted/20 rounded-b-xl px-4 py-3 text-sm text-muted-foreground space-y-1 -mt-1 border-t border-border">
            <p>{t("chat.panelsProduction", { panels: result.system.panelCount, production: formatNumber(result.system.annualProductionKwh, locale) })}</p>
            <p>{t("chat.savings", { saving: fmtEuro(result.savings.annualSaving, locale), payback: result.savings.paybackYears })}</p>
            {result.pricing.subsidyAmount > 0 && (
              <p>{t("chat.subsidyApplied", { amount: fmtEuro(result.pricing.subsidyAmount, locale) })}</p>
            )}
          </div>
        )}
      </div>

      {/* Chat tabs + thread */}
      {chats.length === 0 && !loading ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="text-4xl mb-3">&#128172;</div>
          <p className="font-bold text-foreground mb-2">
            {t("chat.conversationsStarted")}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {t("chat.conversationsStartedDesc")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("chat.caseId", { id: caseId.slice(0, 8) })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Tab sidebar */}
          <div className="sm:w-48 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
            {chats.map((chat) => {
              const status = getStatusLabel(chat.status, t);
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`text-left px-3 py-2.5 rounded-lg border shrink-0 transition-colors ${
                    activeChat === chat.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-bold text-sm text-foreground truncate">
                    {chat.listing_name}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.color}`}>
                    {status.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active chat thread */}
          <div className="flex-1">
            {activeChat ? (
              <ChatThread
                chatId={activeChat}
                caseId={caseId}
                installerName={
                  chats.find((c) => c.id === activeChat)?.listing_name || ""
                }
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {t("chat.selectConversation")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("chat.newInquiry")}
        </button>
      </div>
    </div>
  );
}

// Export setter for parent to inject chats
export type { ChatInfo };
