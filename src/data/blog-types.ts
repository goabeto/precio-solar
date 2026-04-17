export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  date: string; // ISO format YYYY-MM-DD
  readingMinutes: number;
  excerpt: string;
  tags: string[];
  // For external articles
  type: "external" | "internal";
  source?: string;
  sourceUrl?: string;
  // For internal articles (full content)
  heroBadge?: string;
  body?: string[];
  cta?: { text: string; href: string };
}
