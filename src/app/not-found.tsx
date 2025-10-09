import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-sky-500/10 to-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(75rem_30rem_at_50%_-10%,hsl(var(--muted))/40,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-3xl place-items-center px-6 py-16 text-center sm:py-24">
        <div className="relative w-full rounded-2xl border bg-card/60 p-8 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-xl sm:p-12">
          <div className="absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <h1 className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Página no encontrada
          </h1>

          <p className="mx-auto mt-3 max-w-prose text-balance text-muted-foreground">
            La ruta que intentas visitar no existe o fue movida. Verifica el
            enlace o vuelve al inicio para continuar navegando.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">Ir al inicio</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Ir al panel</Link>
            </Button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground/80">
            Código de error:{" "}
            <span className="font-medium text-foreground/80">404</span>
          </div>

          {/* Accent underline */}
          <div className="absolute inset-x-8 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
