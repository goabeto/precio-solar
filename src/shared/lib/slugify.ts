/**
 * Convert text to a URL-safe slug.
 * Handles Spanish (ñ, á, é, í, ó, ú, ü), Polish (ą, ć, ę, ł, ń, ś, ź, ż),
 * Portuguese, French, and other European diacritics.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Spanish
    .replace(/ñ/g, "n")
    // Polish
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    // Normalize remaining diacritics (á→a, é→e, ü→u, etc.)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
