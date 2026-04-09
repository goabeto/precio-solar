import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-heading font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-foreground mb-2">Pagina no encontrada</p>
      <p className="text-muted-foreground mb-8">
        La pagina que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-heading font-bold hover:bg-primary/90 transition-colors"
      >
        Calcular precio solar
      </Link>
    </div>
  );
}
