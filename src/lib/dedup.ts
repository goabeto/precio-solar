import type { ListingWithPricing } from "@shared/types";
import { slugify } from "@shared/lib";

function dedupKey(listing: ListingWithPricing): string {
  if (listing.google_place_id) return listing.google_place_id;
  return `${slugify(listing.name)}|${slugify(listing.city)}`;
}

export function dedupListings(listings: ListingWithPricing[]): ListingWithPricing[] {
  const groups = new Map<string, ListingWithPricing[]>();

  for (const listing of listings) {
    const key = dedupKey(listing);
    const group = groups.get(key);
    if (group) {
      group.push(listing);
    } else {
      groups.set(key, [listing]);
    }
  }

  return Array.from(groups.values()).map((group) => {
    // Keep highest-rated as base
    const sorted = [...group].sort(
      (a, b) => (b.google_rating ?? 0) - (a.google_rating ?? 0)
    );
    const base = { ...sorted[0] };

    // Merge verticals_served from all entries
    const allVerticals = new Set<string>();
    for (const entry of group) {
      if (entry.verticals_served) {
        for (const v of entry.verticals_served) allVerticals.add(v);
      }
    }
    if (allVerticals.size > 0) {
      base.verticals_served = [...allVerticals];
    }

    // Merge pricing from all entries (dedup by config_type)
    const seenConfigs = new Set<string>();
    const mergedPricing = [];
    for (const entry of group) {
      for (const p of entry.pricing) {
        if (!seenConfigs.has(p.config_type)) {
          seenConfigs.add(p.config_type);
          mergedPricing.push(p);
        }
      }
    }
    base.pricing = mergedPricing;

    // Merge services
    const seenServices = new Set<string>();
    const mergedServices = [];
    for (const entry of group) {
      for (const s of entry.services) {
        if (!seenServices.has(s.service_category)) {
          seenServices.add(s.service_category);
          mergedServices.push(s);
        }
      }
    }
    base.services = mergedServices;

    return base;
  });
}

/**
 * Lightweight dedup for counting — only needs name, city, and google_place_id.
 * Returns the number of unique businesses per city.
 */
export function dedupCityCounts(
  rows: { city: string; name: string; google_place_id: string | null }[]
): Record<string, number> {
  const seenPerCity = new Map<string, Set<string>>();
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const key = row.google_place_id ?? `${slugify(row.name)}|${slugify(row.city)}`;
    let seen = seenPerCity.get(row.city);
    if (!seen) {
      seen = new Set<string>();
      seenPerCity.set(row.city, seen);
    }
    if (seen.has(key)) continue;
    seen.add(key);
    counts[row.city] = (counts[row.city] || 0) + 1;
  }

  return counts;
}
