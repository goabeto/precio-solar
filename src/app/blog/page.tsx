import type { Metadata } from "next";
import Link from "next/link";
import { ALL_POSTS, formatPostDate } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog Solar — Noticias, analisis y estrategia | Precio Solar",
  description:
    "El pulso del mercado solar en Espana en 2026: politica energetica, precios del petroleo, subvenciones, baterias, IA aplicada al solar. Articulos originales y una seleccion de la mejor prensa del sector.",
  alternates: { canonical: "/blog" },
};

function sourceLabel(post: { type: string; source?: string }) {
  if (post.type === "internal") return "Precio Solar";
  return post.source || "Fuente externa";
}

export default function BlogIndexPage() {
  const posts = ALL_POSTS;
  const totalInternal = posts.filter((p) => p.type === "internal").length;
  const totalExternal = posts.length - totalInternal;
  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-surface" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full blur-3xl bg-primary/20" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full blur-3xl bg-primary/10" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Blog Solar &middot; Actualizado cada semana
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight text-foreground max-w-3xl">
            El pulso del mercado solar en Espana
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Analisis, noticias y estrategia del mayor boom energetico de la decada. Articulos
            originales firmados por Precio Solar y una seleccion curada de la mejor prensa
            del sector.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-xl bg-surface px-3 py-1.5 shadow-ambient">
              <strong className="text-foreground">{totalInternal}</strong>
              <span className="text-muted-foreground"> articulos originales</span>
            </span>
            <span className="rounded-xl bg-surface px-3 py-1.5 shadow-ambient">
              <strong className="text-foreground">{totalExternal}</strong>
              <span className="text-muted-foreground"> noticias de referencia</span>
            </span>
            <span className="rounded-xl bg-surface px-3 py-1.5 shadow-ambient text-muted-foreground">
              <strong className="text-foreground">2026</strong> &middot; el ano del cambio
            </span>
          </div>
        </div>
      </section>

      {/* Featured (top 3 newest) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          Destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((post) => (
            <PostCard key={post.slug + post.date} post={post} variant="featured" />
          ))}
        </div>
      </section>

      {/* Full chronological feed */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          Todo el feed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <PostCard key={post.slug + post.date} post={post} />
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary/10 to-surface p-8 shadow-ambient">
          <h3 className="text-2xl font-heading font-bold text-foreground">
            Calcula tu instalacion solar en 60 segundos
          </h3>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Datos reales de PVGIS, precios actualizados y el listado oficial de subvenciones
            de tu comunidad autonoma. Sin llamadas comerciales, sin compartir tus datos.
          </p>
          <a
            href="/"
            className="inline-flex mt-5 items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-ambient hover:bg-primary/90 transition-colors"
          >
            Calcular precio gratis
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}

function PostCard({
  post,
  variant,
}: {
  post: import("@/data/blog-types").BlogPost;
  variant?: "featured";
}) {
  const isInternal = post.type === "internal";
  const href = isInternal ? `/blog/${post.slug}` : post.sourceUrl || "#";
  const external = !isInternal;
  const label = sourceLabel(post);

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border border-border bg-background/60 backdrop-blur-sm shadow-ambient overflow-hidden hover:shadow-lg transition-shadow ${
        variant === "featured" ? "md:min-h-[18rem]" : ""
      }`}
    >
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="flex flex-col h-full p-5"
      >
        <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wider mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
              isInternal
                ? "bg-primary/15 text-primary"
                : "bg-surface text-muted-foreground"
            }`}
          >
            {isInternal ? "Original" : "Prensa"}
          </span>
          <span className="text-muted-foreground normal-case tracking-normal">
            {formatPostDate(post.date)}
          </span>
        </div>

        <h3
          className={`font-heading font-bold text-foreground leading-tight group-hover:text-primary transition-colors ${
            variant === "featured" ? "text-lg" : "text-base"
          }`}
        >
          {post.title}
        </h3>

        {post.subtitle && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.subtitle}</p>
        )}

        <p className="mt-3 text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground truncate max-w-[60%]">{label}</span>
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            {external ? (
              <>
                Ver articulo
                <span aria-hidden="true">&#8599;</span>
              </>
            ) : (
              <>
                Leer
                <span aria-hidden="true">&rarr;</span>
              </>
            )}
          </span>
        </div>
      </Link>
    </article>
  );
}
