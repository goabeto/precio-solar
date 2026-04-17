import type { BlogPost } from "./blog-types";
import { EXTERNAL_POSTS } from "./blog-external";
import { INTERNAL_POSTS_1 } from "./blog-internal-1";
import { INTERNAL_POSTS_2 } from "./blog-internal-2";

export type { BlogPost };

// All posts (internal + external) sorted by date, newest first
export const ALL_POSTS: BlogPost[] = [
  ...EXTERNAL_POSTS,
  ...INTERNAL_POSTS_1,
  ...INTERNAL_POSTS_2,
].sort((a, b) => b.date.localeCompare(a.date));

// Only internal posts (for detail page routing)
export const INTERNAL_POSTS: BlogPost[] = [
  ...INTERNAL_POSTS_1,
  ...INTERNAL_POSTS_2,
].sort((a, b) => b.date.localeCompare(a.date));

export function getInternalPostBySlug(slug: string): BlogPost | undefined {
  return INTERNAL_POSTS.find((p) => p.slug === slug);
}

// All unique tags across every post
export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const post of ALL_POSTS) {
    for (const tag of post.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}

// Format ISO date into Spanish-style human readable
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${d} de ${months[m - 1]} de ${y}`;
}
