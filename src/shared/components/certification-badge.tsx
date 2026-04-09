import type { Certification } from "../types";

interface CertificationBadgeProps {
  certification: Certification;
  size?: "sm" | "md";
}

export function CertificationBadge({
  certification,
  size = "sm",
}: CertificationBadgeProps) {
  const sizeClasses =
    size === "md"
      ? "px-3.5 py-1.5 text-sm"
      : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-[var(--secondary-container,var(--primary))]/15 text-[var(--secondary,var(--primary))] ${sizeClasses}`}
      title={`${certification.cert_name} — ${certification.cert_body}${certification.cert_number ? ` #${certification.cert_number}` : ""}`}
    >
      {certification.verified && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5 opacity-70"
        >
          <path
            fillRule="evenodd"
            d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {certification.cert_name}
    </span>
  );
}
