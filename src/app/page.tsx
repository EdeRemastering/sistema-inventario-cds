import Link from "next/link";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Shield,
  ClipboardList,
  BarChart3,
  RefreshCw,
  Boxes,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/40">
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Sistema Inventario CDS
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Gestiona tu inventario con precisión y trazabilidad
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Gestión integral del inventario institucional: catalogación,
            préstamos, devoluciones, reportes y auditoría.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/(main)">Ir al panel</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Boxes className="h-5 w-5" />}
            title="Control de Inventario"
            desc="Registro y categorización precisa de elementos."
          />
          <Feature
            icon={<ClipboardList className="h-5 w-5" />}
            title="Gestión de Préstamos"
            desc="Control de salidas y responsables."
          />
          <Feature
            icon={<RefreshCw className="h-5 w-5" />}
            title="Devoluciones"
            desc="Seguimiento del retorno con validación."
          />
          <Feature
            icon={<BarChart3 className="h-5 w-5" />}
            title="Reportes"
            desc="Exportación a PDF/Excel para auditorías."
          />
          <Feature
            icon={<Shield className="h-5 w-5" />}
            title="Auditoría"
            desc="Logs con trazabilidad de acciones."
          />
          <Feature
            icon={<Lock className="h-5 w-5" />}
            title="Seguridad"
            desc="Accesos protegidos y roles definidos."
          />
        </div>

        <Card className="mx-auto mt-12 max-w-5xl">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-semibold">
              Análisis de Requerimientos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium">Objetivo principal:</span> Gestionar
              eficientemente el ciclo de vida de los elementos de
              infraestructura.
            </p>
            <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
              <li>Control de inventario: registro y categorización.</li>
              <li>Gestión de préstamos: control de salidas.</li>
              <li>Seguimiento de devoluciones con validación.</li>
              <li>Reportes PDF/Excel.</li>
              <li>Auditoría y trazabilidad (logs).</li>
              <li>Seguridad y control de acceso.</li>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-5">
        <div className="rounded bg-primary/10 p-2 text-primary">{icon}</div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </CardContent>
    </Card>
  );
}
