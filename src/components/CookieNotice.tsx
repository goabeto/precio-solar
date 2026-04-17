"use client";

import { useEffect, useState } from "react";

const COOKIE_KEY = "ps-cookie-consent";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = typeof window !== "undefined" ? localStorage.getItem(COOKIE_KEY) : null;
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = (type: "all" | "essential") => {
    localStorage.setItem(COOKIE_KEY, type);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-ambient-lg border border-border p-4 sm:p-5 pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1 text-sm text-foreground">
            <p className="font-heading font-extrabold mb-1">Cookies y privacidad</p>
            <p className="text-xs text-muted-foreground">
              Usamos cookies esenciales para el funcionamiento del sitio y analiticas para mejorar la experiencia. No compartimos tus datos con terceros. Consulta la{" "}
              <a href="/politica-privacidad" className="text-primary underline">politica de privacidad</a>.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => accept("essential")}
              className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground border border-border transition-colors"
            >
              Solo esenciales
            </button>
            <button
              onClick={() => accept("all")}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
