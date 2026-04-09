import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getServerLocale } from "@/i18n/getServerLocale";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

const SITE_NAME = "Precio Solar";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://preciosolar.es";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Calculadora solar independiente para el mercado espanol. Compara precios, subvenciones y financiacion para tu instalacion de placas solares.",
  sameAs: ["https://tuenergiaverde.es"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?postalCode={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  title: {
    default:
      "Calcula el precio de tus placas solares en segundos | Precio Solar",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Calculadora solar gratuita: descubre cu\u00e1ntas placas solares necesitas, cu\u00e1nto cuestan con subvenciones y financiaci\u00f3n, y conecta con instaladores verificados en tu zona.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            defer
            src="https://cloud.umami.is/script.js"
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="bg-background text-foreground antialiased font-sans">
        <ClientLayout initialLocale={locale}>{children}</ClientLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
