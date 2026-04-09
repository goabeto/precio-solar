/**
 * Lightweight HTML sanitizer for server-rendered content.
 * Allows safe HTML tags (headings, paragraphs, lists, links, formatting)
 * and strips dangerous elements (script, iframe, object, embed, form, style).
 */

const DANGEROUS_TAG_PATTERN =
  /<\s*\/?\s*(script|iframe|object|embed|form|style|link|meta|base)\b[^>]*>/gi;

const EVENT_HANDLER_PATTERN = /\s+on\w+\s*=\s*["'][^"']*["']/gi;

const JAVASCRIPT_URI_PATTERN = /href\s*=\s*["']\s*javascript:/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAG_PATTERN, "")
    .replace(EVENT_HANDLER_PATTERN, "")
    .replace(JAVASCRIPT_URI_PATTERN, 'href="');
}
