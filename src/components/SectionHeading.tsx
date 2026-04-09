"use client";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  size?: "lg" | "xl";
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
  size = "lg",
}: SectionHeadingProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2
        className={`font-heading font-bold text-foreground ${
          size === "xl" ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
