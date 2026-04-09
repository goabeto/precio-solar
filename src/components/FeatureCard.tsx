"use client";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  badge?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  href,
  badge,
}: FeatureCardProps) {
  const content = (
    <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-md transition-all group relative">
      {badge && (
        <span className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-heading font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {href && (
        <span className="inline-block mt-3 text-sm text-primary font-medium group-hover:underline">
          &rarr;
        </span>
      )}
    </div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
}
