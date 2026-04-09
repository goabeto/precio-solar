import type { SubsidyProgram } from "../types";

interface SubsidyBannerProps {
  subsidies: SubsidyProgram[];
  title: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCta?: { label: string; href: string };
}

export function SubsidyBanner({
  subsidies,
  title,
  ctaLabel,
  ctaHref,
  secondaryCta,
}: SubsidyBannerProps) {
  if (subsidies.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--secondary-container, var(--primary))", opacity: 0.15 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="var(--secondary, var(--primary))"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <p className="font-semibold text-[var(--on-surface,var(--foreground))] text-sm">
            {title}
          </p>
        </div>
        <a
          href={ctaHref}
          className="text-sm font-medium text-[var(--primary)] hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          {ctaLabel} &rarr;
        </a>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {subsidies.map((s) => (
          <a
            key={s.id}
            href={s.url ?? ctaHref}
            target={s.url ? "_blank" : undefined}
            rel={s.url ? "noopener noreferrer" : undefined}
            className="snap-start shrink-0 w-[280px] rounded-xl bg-[var(--surface-container-low,var(--muted))] p-4 hover:shadow-ambient-lg transition-all group"
          >
            <p className="font-medium text-sm text-[var(--on-surface,var(--foreground))] leading-snug group-hover:text-[var(--primary)] transition-colors">
              {s.name}
            </p>
            {s.amount && (
              <span className="inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--secondary-container,var(--success))] text-[var(--secondary,var(--success-foreground))]">
                {s.amount}
              </span>
            )}
            {s.eligibility && (
              <p className="mt-2 text-xs text-[var(--on-surface-variant,var(--muted-foreground))] leading-relaxed line-clamp-2">
                {s.eligibility}
              </p>
            )}
          </a>
        ))}
      </div>

      {secondaryCta && (
        <a
          href={secondaryCta.href}
          className="inline-block mt-2 text-xs text-[var(--on-surface-variant,var(--muted-foreground))] hover:text-[var(--primary)] transition-colors"
        >
          {secondaryCta.label} &rarr;
        </a>
      )}
    </div>
  );
}
