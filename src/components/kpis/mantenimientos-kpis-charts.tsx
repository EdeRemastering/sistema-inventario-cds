"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MantenimientosKpis } from "@/modules/mantenimientos/kpis";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

// Recharts por defecto puede "saltarse" etiquetas del eje X cuando hay poco espacio.
// Para KPIs queremos ver todos los meses (aunque sean 0) para dar contexto.
const X_AXIS_ALL_TICKS = { interval: 0, minTickGap: 0 } as const;

const tendenciaConfig = {
  // Ejecutados: azul
  realizados: { label: "Ejecutados", color: "var(--kpi-blue)" },
} satisfies ChartConfig;

// BarChart interactivo (estilo Shadcn): permite alternar serie.
const anualInteractiveConfig = {
  // Total: azul (agregado)
  total: { label: "Total", color: "var(--kpi-blue)" },
  // Tipos: preventivo verde, correctivo rojo, predictivo azul
  preventivo: { label: "Preventivo", color: "var(--kpi-green)" },
  correctivo: { label: "Correctivo", color: "var(--kpi-red)" },
  predictivo: { label: "Predictivo", color: "var(--kpi-blue)" },
} satisfies ChartConfig;

const estadosConfig = {
  // Estados: realizados azul, pendientes amarillo, cancelados rojo
  pendientes: { label: "Programados (pendientes)", color: "var(--kpi-yellow)" },
  realizados: { label: "Programados (marcados como realizados)", color: "var(--kpi-blue)" },
  cancelados: { label: "Programados (cancelados)", color: "var(--kpi-red)" },
} satisfies ChartConfig;

const tiposConfig = {
  value: { label: "Mantenimientos" },
  preventivo: { label: "Preventivo", color: "var(--kpi-green)" },
  correctivo: { label: "Correctivo", color: "var(--kpi-red)" },
  predictivo: { label: "Predictivo", color: "var(--kpi-blue)" },
} satisfies ChartConfig;

export function MantenimientosKpisCharts({ kpis }: { kpis: MantenimientosKpis }) {
  const [activeSerie, setActiveSerie] =
    React.useState<keyof typeof anualInteractiveConfig>("total");
  const [trendRange, setTrendRange] = React.useState<"all" | "6m" | "12m">("all");

  const annualTotals = React.useMemo(() => {
    const base = { total: 0, preventivo: 0, correctivo: 0, predictivo: 0 };
    for (const row of kpis.realizadosPorMesAnualPorTipo) {
      base.total += row.total;
      base.preventivo += row.preventivo;
      base.correctivo += row.correctivo;
      base.predictivo += row.predictivo;
    }
    return base;
  }, [kpis.realizadosPorMesAnualPorTipo]);

  const filteredTrendData = React.useMemo(() => {
    const data = kpis.tendenciaMensual;
    if (trendRange === "all") return data;
    const n = trendRange === "6m" ? 6 : 12;
    if (data.length <= n) return data;
    return data.slice(-n);
  }, [kpis.tendenciaMensual, trendRange]);

  const estadosData = [
    {
      name: "Programaciones",
      pendientes: kpis.pendientes,
      realizados: kpis.realizados,
      cancelados: kpis.cancelados,
    },
  ];

  const tiposData = [
    { tipo: "preventivo", value: kpis.preventivosPeriodo, fill: "var(--color-preventivo)" },
    { tipo: "correctivo", value: kpis.correctivosPeriodo, fill: "var(--color-correctivo)" },
    { tipo: "predictivo", value: kpis.predictivosPeriodo, fill: "var(--color-predictivo)" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-primary/20 lg:col-span-3">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
            <div className="text-sm font-medium">Mantenimientos ejecutados mes a mes ({kpis.selectedYear})</div>
            <div className="text-xs text-muted-foreground">
              Basado en registros de mantenimiento realizado (OT cerradas). Alterna entre Total / Preventivo / Correctivo / Predictivo.
            </div>
          </div>
          <div className="flex">
            {(["total", "preventivo", "correctivo", "predictivo"] as const).map((key) => (
              <button
                key={key}
                data-active={activeSerie === key}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveSerie(key)}
                type="button"
              >
                <span className="text-muted-foreground text-xs flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: `var(--color-${key})` }}
                    aria-hidden="true"
                  />
                  {String(anualInteractiveConfig[key].label ?? key)}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {annualTotals[key].toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={anualInteractiveConfig} className="aspect-auto h-[260px] w-full">
            <BarChart
              accessibilityLayer
              data={kpis.realizadosPorMesAnualPorTipo}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                {...X_AXIS_ALL_TICKS}
              />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={activeSerie} fill={`var(--color-${activeSerie})`} radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-primary/20 lg:col-span-2">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <div className="text-sm font-medium">Tendencia de mantenimientos ejecutados (por mes)</div>
            <div className="text-xs text-muted-foreground">Evolución de OT ejecutadas dentro del periodo seleccionado.</div>
          </div>
          <Select value={trendRange} onValueChange={(v) => setTrendRange(v as typeof trendRange)}>
            <SelectTrigger className="hidden w-[180px] rounded-lg sm:ml-auto sm:flex" aria-label="Selecciona rango">
              <SelectValue placeholder="Todo el periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todo el periodo
              </SelectItem>
              <SelectItem value="12m" className="rounded-lg">
                Últimos 12 meses
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Últimos 6 meses
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={tendenciaConfig} className="aspect-auto h-[260px] w-full">
            <AreaChart accessibilityLayer data={filteredTrendData}>
              <defs>
                <linearGradient id="fillRealizadosTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-realizados)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-realizados)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                {...X_AXIS_ALL_TICKS}
              />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} cursor={false} />
              <Area
                type="natural"
                dataKey="realizados"
                stroke="var(--color-realizados)"
                fill="url(#fillRealizadosTrend)"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <div className="text-sm font-medium">Mantenimientos ejecutados por tipo</div>
          <div className="text-xs text-muted-foreground">
            Resumen del periodo + distribución mes a mes ({kpis.selectedYear}).
          </div>
        </CardHeader>
        <CardContent>
          {/* Resumen del periodo (totales por tipo) */}
          <ChartContainer config={tiposConfig} className="aspect-auto h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="tipo" labelKey="value" />} />
              <Pie
                data={tiposData}
                dataKey="value"
                nameKey="tipo"
                innerRadius={55}
                outerRadius={85}
                stroke="hsl(var(--border))"
              />
              <ChartLegend content={<ChartLegendContent nameKey="tipo" />} />
            </PieChart>
          </ChartContainer>

          {/* Etiquetas fijas (si un tipo es 0, la porción puede no notarse). */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-preventivo)" }} />
                <span className="text-muted-foreground">Preventivo</span>
              </div>
              <span className="font-medium tabular-nums">{kpis.preventivosPeriodo.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-correctivo)" }} />
                <span className="text-muted-foreground">Correctivo</span>
              </div>
              <span className="font-medium tabular-nums">{kpis.correctivosPeriodo.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border px-2 py-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-predictivo)" }} />
                <span className="text-muted-foreground">Predictivo</span>
              </div>
              <span className="font-medium tabular-nums">{kpis.predictivosPeriodo.toLocaleString()}</span>
            </div>
          </div>

          {/* Distribución mes a mes por tipo (año seleccionado) */}
          <div className="mt-4">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Distribución mes a mes por tipo ({kpis.selectedYear})
            </div>
            <ChartContainer config={tiposConfig} className="aspect-auto h-[240px] w-full">
              <BarChart accessibilityLayer data={kpis.realizadosPorMesAnualPorTipo} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tick={{ fontSize: 10 }}
                  {...X_AXIS_ALL_TICKS}
                  tickFormatter={(value) => String(value).replace(".", "").slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} width={32} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} cursor={false} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="preventivo" fill="var(--color-preventivo)" radius={4} />
                <Bar dataKey="correctivo" fill="var(--color-correctivo)" radius={4} />
                <Bar dataKey="predictivo" fill="var(--color-predictivo)" radius={4} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 lg:col-span-3">
        <CardHeader className="pb-2">
          <div className="text-sm font-medium">Mantenimientos programados por estado (años del periodo)</div>
          <div className="text-xs text-muted-foreground">
            Este gráfico usa el estado de <span className="font-medium">mantenimientos programados</span>. Puede no coincidir con “Mantenimientos ejecutados mes a mes” si aún no se han registrado las OT ejecutadas.
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={estadosConfig} className="aspect-auto h-[260px] w-full">
            <BarChart accessibilityLayer data={estadosData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="pendientes" fill="var(--color-pendientes)" radius={4} />
              <Bar dataKey="realizados" fill="var(--color-realizados)" radius={4} />
              <Bar dataKey="cancelados" fill="var(--color-cancelados)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

