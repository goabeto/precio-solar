"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { formatTime } from "@/i18n/formatters";

interface Message {
  id: string;
  chat_id: string;
  sender_type: "user" | "installer" | "system" | "bot";
  body: string;
  read_at: string | null;
  created_at: string;
}

interface ChatThreadProps {
  chatId: string;
  caseId: string;
  installerName: string;
}

export default function ChatThread({
  chatId,
  caseId,
  installerName,
}: ChatThreadProps) {
  const { t, locale } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/chats/${chatId}/messages`
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [caseId, chatId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      const res = await fetch(
        `/api/cases/${caseId}/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: newMessage.trim() }),
        }
      );

      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col" style={{ minHeight: 400 }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="font-heading font-bold text-foreground">{installerName}</p>
        <p className="text-xs text-muted-foreground">
          {messages.length === 1 ? t("thread.messageCount.one") : t("thread.messageCount.other", { count: messages.length })}
        </p>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ maxHeight: 400 }}
      >
        {messages.map((msg) => {
          if (msg.sender_type === "system") {
            return (
              <div key={msg.id} className="text-center">
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
                  {msg.body}
                </p>
              </div>
            );
          }

          const isUser = msg.sender_type === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : msg.sender_type === "bot"
                    ? "bg-blue-50 text-blue-900 border border-blue-200"
                    : "bg-muted text-foreground"
                }`}
              >
                {!isUser && (
                  <p className="text-xs font-bold mb-1">
                    {msg.sender_type === "installer"
                      ? installerName
                      : msg.sender_type === "bot"
                      ? t("thread.assistant")
                      : t("thread.system")}
                  </p>
                )}
                <p className="text-sm whitespace-pre-line">{msg.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    isUser ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(msg.created_at, locale)}
                </p>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>{t("thread.noMessages")}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("thread.inputPlaceholder")}
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? "..." : t("thread.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
