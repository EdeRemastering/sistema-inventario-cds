import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MantenimientosKpisFilters } from "@/components/kpis/mantenimientos-kpis-filters";
import { MantenimientosKpisCharts } from "@/components/kpis/mantenimientos-kpis-charts";
import { MantenimientosAiCard } from "@/components/kpis/mantenimientos-ai-card";
import { getMantenimientosKpis } from "@/modules/mantenimientos/kpis";
import { getFormSelectOptions } from "@/lib/form-options";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    year?: string;
    sede?: string;
    ubicacion?: string;
    categoria?: string;
    subcategoria?: string;
  }>;
};

function formatCOP(value: number): string {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value}`;
  }
}

function parseYmd(input: string | undefined): Date | undefined {
  if (!input) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const dt = new Date(y, mo - 1, d);
  // Validación básica (evita 2026-02-31)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
    return undefined;
  return dt;
}

function parseId(input: string | undefined): number | undefined {
  if (!input) return undefined;
  const n = Number(input);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export default async function KpisMantenimientosPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), 0, 1);
  const defaultTo = now;

  const from = parseYmd(sp.from) ?? defaultFrom;
  const to = parseYmd(sp.to) ?? defaultTo;

  const requestedYear = sp.year ? Number(sp.year) : undefined;
  const sede_id = parseId(sp.sede);
  const ubicacion_id = parseId(sp.ubicacion);
  const categoria_id = parseId(sp.categoria);
  const subcategoria_id = parseId(sp.subcategoria);

  const [kpis, options] = await Promise.all([
    getMantenimientosKpis({
      from,
      to,
      selectedYear: requestedYear,
      sede_id,
      ubicacion_id,
      categoria_id,
      subcategoria_id,
    }),
    getFormSelectOptions(),
  ]);
  const yearsLabel =
    kpis.years.length === 1
      ? String(kpis.years[0])
      : `${kpis.years[0]}–${kpis.years[kpis.years.length - 1]}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">KPIs • Mantenimientos</h1>
          <p className="text-sm text-muted-foreground">
            Periodo: {kpis.from} a {kpis.to}
          </p>
        </div>
      </div>

      <MantenimientosKpisFilters
        initialFrom={from}
        initialTo={to}
        years={kpis.years}
        initialYear={kpis.selectedYear}
        sedes={options.sedes}
        ubicaciones={options.ubicaciones}
        categorias={options.categorias}
        subcategorias={options.subcategorias}
        initialSedeId={sede_id}
        initialUbicacionId={ubicacion_id}
        initialCategoriaId={categoria_id}
        initialSubcategoriaId={subcategoria_id}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">
              Programaciones ({yearsLabel})
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {kpis.programacionesTotal}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">Pendientes</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendientes}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">Realizados</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.realizados}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">Aplazados</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.aplazados}</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">Cumplimiento</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.cumplimientoPct}%</div>
            <div className="text-xs text-muted-foreground">
              Realizados / programados (incluye cancelados)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-primary/20 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">Realizados (periodo)</div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-xl font-semibold">
                {kpis.realizadosPeriodo}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Preventivos</div>
              <div className="text-xl font-semibold">
                {kpis.preventivosPeriodo}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Correctivos</div>
              <div className="text-xl font-semibold">
                {kpis.correctivosPeriodo}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Costo total</div>
              <div className="text-xl font-semibold">
                {formatCOP(kpis.costoTotalPeriodo)}
              </div>
              {(kpis.costoPeriodo > 0 || kpis.costoCambiosPeriodo > 0) && (
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Mantenimientos: {formatCOP(kpis.costoPeriodo)}
                  {kpis.costoCambiosPeriodo > 0 && (
                    <> · Cambios: {formatCOP(kpis.costoCambiosPeriodo)}</>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="text-sm font-medium">
              Top responsables (periodo)
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {kpis.topResponsablesPeriodo.length === 0 ? (
              <div className="text-sm text-muted-foreground">Sin datos.</div>
            ) : (
              kpis.topResponsablesPeriodo.map((r) => (
                <div
                  key={r.responsable}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="text-sm truncate">{r.responsable}</div>
                  <div className="text-sm font-medium">{r.total}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <MantenimientosKpisCharts kpis={kpis} />

      <MantenimientosAiCard
        from={kpis.from}
        to={kpis.to}
        selectedYear={kpis.selectedYear}
        sede_id={sede_id}
        ubicacion_id={ubicacion_id}
        categoria_id={categoria_id}
        subcategoria_id={subcategoria_id}
      />
    </div>
  );
}
