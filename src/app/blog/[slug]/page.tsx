import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  INTERNAL_POSTS,
  ALL_POSTS,
  formatPostDate,
  getInternalPostBySlug,
} from "@/data/blog-posts";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return INTERNAL_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getInternalPostBySlug(slug);
  if (!post) {
    return { title: "Articulo no encontrado | Precio Solar" };
  }
  return {
    title: `${post.title} | Precio Solar`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = getInternalPostBySlug(slug);
  if (!post) notFound();

  const related = ALL_POSTS.filter(
    (p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t))
  ).slice(0, 3);

  return (
    <article className="pb-20">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full blur-3xl bg-primary/15" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-8">
          <nav className="text-xs text-muted-foreground mb-6">
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <span className="mx-2">&rsaquo;</span>
            <span>{formatPostDate(post.date)}</span>
          </nav>

          {post.heroBadge && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
              {post.heroBadge}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
              {post.subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-6 w-6 rounded-full bg-primary/20 inline-flex items-center justify-center text-primary text-[10px] font-bold">
                PS
              </span>
              <strong className="text-foreground font-medium">Precio Solar</strong>
            </span>
            <span className="text-muted-foreground/60">&bull;</span>
            <span>{formatPostDate(post.date)}</span>
            <span className="text-muted-foreground/60">&bull;</span>
            <span>{post.readingMinutes} min de lectura</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="prose-solar">
          {(post.body || []).map((block, i) => (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: block }}
              className="mb-5 last:mb-0"
            />
          ))}
        </div>

        {/* CTA */}
        {post.cta && (
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary/10 to-surface p-8 shadow-ambient">
            <h3 className="text-xl font-heading font-bold text-foreground">
              Pasa del analisis a la accion
            </h3>
            <p className="mt-2 text-muted-foreground">
              En menos de 60 segundos tendras un precio real para tu casa, calculado con datos
              oficiales de PVGIS y la lista de subvenciones activas en tu comunidad.
            </p>
            <Link
              href={post.cta.href}
              className="inline-flex mt-5 items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-ambient hover:bg-primary/90 transition-colors"
            >
              {post.cta.text}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs rounded-full bg-surface px-3 py-1 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Seguir leyendo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((rp) => {
              const href =
                rp.type === "internal" ? `/blog/${rp.slug}` : rp.sourceUrl || "#";
              const external = rp.type !== "internal";
              return (
                <Link
                  key={rp.slug + rp.date}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="rounded-2xl border border-border bg-background/60 p-5 shadow-ambient hover:shadow-lg transition-shadow group"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider mb-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        rp.type === "internal"
                          ? "bg-primary/15 text-primary"
                          : "bg-surface text-muted-foreground"
                      }`}
                    >
                      {rp.type === "internal" ? "Original" : "Prensa"}
                    </span>
                    <span className="text-muted-foreground normal-case tracking-normal">
                      {formatPostDate(rp.date)}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                    {rp.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {rp.excerpt}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Back to blog */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <span aria-hidden="true">&larr;</span> Volver al blog
        </Link>
      </div>

    </article>
  );
}
