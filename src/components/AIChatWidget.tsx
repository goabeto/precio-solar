"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { useTranslation } from "@/i18n/useTranslation";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function AIChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStarted = useRef(false);

  const conversation = useConversation({
    onMessage: useCallback(
      (msg: { source: string; message: string }) => {
        if (msg.source === "ai") {
          setMessages((prev) => [...prev, { role: "assistant", text: msg.message }]);
        }
      },
      []
    ),
    onError: useCallback((err: unknown) => {
      console.error("AI chat error:", err);
      setError(t("aiChat.error"));
    }, [t]),
  });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initSession = useCallback(async () => {
    if (sessionStarted.current) return;
    setConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-chat", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.signedUrl) {
        setError(t("aiChat.unavailable"));
        return;
      }

      await conversation.startSession({ signedUrl: data.signedUrl });
      sessionStarted.current = true;
      setMessages([{ role: "assistant", text: t("aiChat.welcome") }]);
    } catch (err) {
      console.error("Failed to start AI chat:", err);
      setError(t("aiChat.unavailable"));
    } finally {
      setConnecting(false);
    }
  }, [conversation, t]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!sessionStarted.current) {
      initSession();
    }
  }, [initSession]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || conversation.status !== "connected") return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    conversation.sendUserMessage(text);
    setInput("");
  }, [input, conversation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center"
          aria-label={t("aiChat.title")}
          title={t("aiChat.title")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-30 w-[380px] h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-heading font-bold text-sm text-foreground">
                {t("aiChat.title")}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={t("aiChat.close")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {connecting && (
              <div className="text-center text-sm text-muted-foreground py-8">
                <svg className="animate-spin h-5 w-5 mx-auto mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("aiChat.loading")}
              </div>
            )}

            {error && (
              <div className="text-center text-sm text-destructive py-4">
                {error}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("aiChat.inputPlaceholder")}
                disabled={conversation.status !== "connected"}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-ring outline-none transition disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || conversation.status !== "connected"}
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t("aiChat.send")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
