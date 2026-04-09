"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/i18n/useTranslation";

interface Region {
  slug: string;
  name: string;
  popular?: boolean;
}

interface RegionGridProps {
  regions: Region[];
}

export default function RegionGrid({ regions }: RegionGridProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return regions;
    const q = search.toLowerCase();
    return regions.filter((r) => r.name.toLowerCase().includes(q));
  }, [regions, search]);

  // Sort: popular first, then alphabetical
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name, "es");
    });
  }, [filtered]);

  return (
    <div>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("guides.searchPlaceholder")}
          className="w-full sm:max-w-xs px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((r) => (
          <a
            key={r.slug}
            href={`/guias/subvenciones/${r.slug}`}
            className="group relative flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
          >
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {r.name}
            </span>
            <div className="flex items-center gap-2">
              {r.popular && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {t("guides.popular")}
                </span>
              )}
              <span className="text-muted-foreground text-xs group-hover:text-primary transition-colors">
                &rarr;
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* No results */}
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          {t("guides.noSearchResults")}
        </p>
      )}
    </div>
  );
}
