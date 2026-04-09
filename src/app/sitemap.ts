import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://preciosolar.es";

const CCAA_REGIONS = [
  "andalucia",
  "aragon",
  "asturias",
  "baleares",
  "canarias",
  "cantabria",
  "castilla-la-mancha",
  "castilla-y-leon",
  "cataluna",
  "comunidad-valenciana",
  "extremadura",
  "galicia",
  "madrid",
  "murcia",
  "navarra",
  "pais-vasco",
  "la-rioja",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/guias`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guias/subvenciones`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/revisar-propuesta`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/politica-privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/aviso-legal`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const regionPages: MetadataRoute.Sitemap = CCAA_REGIONS.map((region) => ({
    url: `${SITE_URL}/guias/subvenciones/${region}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...regionPages];
}
