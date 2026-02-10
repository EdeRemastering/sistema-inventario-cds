import { prisma } from "@/lib/prisma";
import { withDatabaseRetry } from "@/lib/db-connection";

export type MantenimientosKpis = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  years: number[];
  selectedYear: number;
  filters: {
    sede_id?: number;
    ubicacion_id?: number;
    categoria_id?: number;
    subcategoria_id?: number;
  };
  // Programaciones (mantenimientos_programados)
  programacionesTotal: number;
  pendientes: number;
  realizados: number;
  aplazados: number;
  cancelados: number;
  cumplimientoPct: number; // realizados / (pendientes+realizados+aplazados+cancelados)

  // Realizados (mantenimientos_realizados) del periodo
  realizadosPeriodo: number;
  preventivosPeriodo: number;
  correctivosPeriodo: number;
  predictivosPeriodo: number;
  costoPeriodo: number;

  topResponsablesPeriodo: Array<{ responsable: string; total: number }>;
  tendenciaMensual: Array<{ name: string; realizados: number }>;
  realizadosPorMesAnual: Array<{ month: string; realizados: number }>;
  // Dataset para bar chart interactivo (Total vs tipos) del año seleccionado.
  realizadosPorMesAnualPorTipo: Array<{
    month: string;
    total: number;
    preventivo: number;
    correctivo: number;
    predictivo: number;
  }>;
};

function monthLabelEs(date: Date): string {
  return date.toLocaleDateString("es-CO", { month: "short" });
}

function toYmd(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function getMantenimientosKpis(input?: {
  from?: Date;
  to?: Date;
  selectedYear?: number;
  sede_id?: number;
  ubicacion_id?: number;
  categoria_id?: number;
  subcategoria_id?: number;
}): Promise<MantenimientosKpis> {
  return withDatabaseRetry(async () => {
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), 0, 1);
    const defaultTo = now;

    const from = startOfDay(input?.from ?? defaultFrom);
    const to = startOfDay(input?.to ?? defaultTo);
    const toExclusive = new Date(to.getFullYear(), to.getMonth(), to.getDate() + 1);

    const yearFrom = from.getFullYear();
    const yearTo = to.getFullYear();
    const years: number[] = [];
    for (let y = yearFrom; y <= yearTo; y++) years.push(y);

    const requestedYear = input?.selectedYear;
    const fallbackYear = to.getFullYear();
    const selectedYear =
      requestedYear && years.includes(requestedYear) ? requestedYear : years.includes(fallbackYear) ? fallbackYear : years[years.length - 1];

    // Filtros por contexto del elemento (sede/ubicación/categoría/subcategoría).
    // Se aplican tanto a "programados" (por elemento) como a "realizados" (por elemento).
    const filters = {
      sede_id: input?.sede_id,
      ubicacion_id: input?.ubicacion_id,
      categoria_id: input?.categoria_id,
      subcategoria_id: input?.subcategoria_id,
    };

    const hasElementoFilters = Boolean(
      filters.sede_id ||
        filters.ubicacion_id ||
        filters.categoria_id ||
        filters.subcategoria_id
    );

    // Prisma permite filtrar por relaciones anidadas.
    // Usamos `any` para evitar fricción de tipos cuando el client local queda desfasado en Windows.
    const elementoWhere: any = {};
    if (filters.categoria_id) elementoWhere.categoria_id = filters.categoria_id;
    if (filters.subcategoria_id) elementoWhere.subcategoria_id = filters.subcategoria_id;
    if (filters.ubicacion_id) elementoWhere.ubicacion_id = filters.ubicacion_id;
    if (filters.sede_id) elementoWhere.ubicacion_rel = { sede_id: filters.sede_id };

    // Tendencia mensual dentro del periodo (máx: meses entre from y to)
    const startTrend = new Date(from.getFullYear(), from.getMonth(), 1);
    const endTrendExclusive = new Date(to.getFullYear(), to.getMonth() + 1, 1);

    const programadosBaseWhere: any = {
      año: { gte: yearFrom, lte: yearTo },
      ...(hasElementoFilters ? { elemento: elementoWhere } : {}),
    };

    const realizadosBaseWhere: any = {
      ...(hasElementoFilters ? { elemento: elementoWhere } : {}),
    };

    const [
      programacionesTotal,
      pendientes,
      realizados,
      aplazados,
      cancelados,
      realizadosPeriodo,
      preventivosPeriodo,
      correctivosPeriodo,
      predictivosPeriodo,
      costoAggPeriodo,
      topResponsablesRaw,
      realizadosTrendRows,
      realizadosYearRows,
    ] = await Promise.all([
      prisma.mantenimientos_programados.count({ where: programadosBaseWhere }),
      prisma.mantenimientos_programados.count({
        where: { ...programadosBaseWhere, estado: "PENDIENTE" },
      }),
      prisma.mantenimientos_programados.count({
        where: { ...programadosBaseWhere, estado: "REALIZADO" },
      }),
      prisma.mantenimientos_programados.count({
        where: { ...programadosBaseWhere, estado: "APLAZADO" },
      }),
      prisma.mantenimientos_programados.count({
        where: { ...programadosBaseWhere, estado: "CANCELADO" },
      }),

      prisma.mantenimientos_realizados.count({
        where: { ...realizadosBaseWhere, fecha_mantenimiento: { gte: from, lt: toExclusive } },
      }),
      prisma.mantenimientos_realizados.count({
        where: {
          ...realizadosBaseWhere,
          fecha_mantenimiento: { gte: from, lt: toExclusive },
          tipo: "PREVENTIVO",
        },
      }),
      prisma.mantenimientos_realizados.count({
        where: {
          ...realizadosBaseWhere,
          fecha_mantenimiento: { gte: from, lt: toExclusive },
          tipo: "CORRECTIVO",
        },
      }),
      prisma.mantenimientos_realizados.count({
        where: {
          ...realizadosBaseWhere,
          fecha_mantenimiento: { gte: from, lt: toExclusive },
          tipo: "PREDICTIVO",
        },
      }),
      prisma.mantenimientos_realizados.aggregate({
        where: { ...realizadosBaseWhere, fecha_mantenimiento: { gte: from, lt: toExclusive } },
        _sum: { costo: true },
      }),
      prisma.mantenimientos_realizados.findMany({
        where: { ...realizadosBaseWhere, fecha_mantenimiento: { gte: from, lt: toExclusive } },
        select: { responsable: true },
      }),
      prisma.mantenimientos_realizados.findMany({
        where: { ...realizadosBaseWhere, fecha_mantenimiento: { gte: startTrend, lt: endTrendExclusive } },
        select: { fecha_mantenimiento: true },
        orderBy: { fecha_mantenimiento: "asc" },
      }),
      prisma.mantenimientos_realizados.findMany({
        where: {
          ...realizadosBaseWhere,
          fecha_mantenimiento: {
            gte: new Date(selectedYear, 0, 1),
            lt: new Date(selectedYear + 1, 0, 1),
          },
        },
        select: { fecha_mantenimiento: true, tipo: true },
        orderBy: { fecha_mantenimiento: "asc" },
      }),
    ]);

    const totalBase = programacionesTotal || (pendientes + realizados + aplazados + cancelados);
    const cumplimientoPct =
      totalBase > 0 ? Math.round((realizados / totalBase) * 1000) / 10 : 0;

    const costoPeriodo = Number(costoAggPeriodo._sum.costo ?? 0);

    const responsableCounts = new Map<string, number>();
    for (const r of topResponsablesRaw) {
      const name = r.responsable ?? "Sin asignar";
      responsableCounts.set(name, (responsableCounts.get(name) ?? 0) + 1);
    }
    const topResponsablesPeriodo = Array.from(responsableCounts.entries())
      .map(([responsable, total]) => ({ responsable, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Tendencia mensual dentro del periodo (JS aggregation)
    const buckets = new Map<string, number>();
    for (
      let d = new Date(startTrend);
      d < endTrendExclusive;
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    ) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets.set(key, 0);
    }
    for (const row of realizadosTrendRows) {
      const d = row.fecha_mantenimiento;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const tendenciaMensual = Array.from(buckets.entries()).map(([key, count]) => {
      const [y, m] = key.split("-").map(Number);
      const d = new Date(y, m, 1);
      return { name: monthLabelEs(d), realizados: count };
    });

    // Serie mes-a-mes para el año seleccionado (enero–diciembre).
    // Nota: se calcula por año calendario. La UI filtra por rango al comparar from/to.
    const totalBuckets: number[] = new Array(12).fill(0);
    const preventivoBuckets: number[] = new Array(12).fill(0);
    const correctivoBuckets: number[] = new Array(12).fill(0);
    const predictivoBuckets: number[] = new Array(12).fill(0);

    for (const row of realizadosYearRows) {
      const d = row.fecha_mantenimiento;
      if (d.getFullYear() !== selectedYear) continue;
      const m = d.getMonth();
      totalBuckets[m]++;
      if (row.tipo === "PREVENTIVO") preventivoBuckets[m]++;
      else if (row.tipo === "CORRECTIVO") correctivoBuckets[m]++;
      else if (row.tipo === "PREDICTIVO") predictivoBuckets[m]++;
    }

    const realizadosPorMesAnual = totalBuckets.map((count, monthIdx) => {
      const d = new Date(selectedYear, monthIdx, 1);
      return { month: monthLabelEs(d), realizados: count };
    });

    const realizadosPorMesAnualPorTipo = totalBuckets.map((count, monthIdx) => {
      const d = new Date(selectedYear, monthIdx, 1);
      return {
        month: monthLabelEs(d),
        total: count,
        preventivo: preventivoBuckets[monthIdx],
        correctivo: correctivoBuckets[monthIdx],
        predictivo: predictivoBuckets[monthIdx],
      };
    });

    return {
      from: toYmd(from),
      to: toYmd(to),
      years,
      selectedYear,
      filters,
      programacionesTotal,
      pendientes,
      realizados,
      aplazados,
      cancelados,
      cumplimientoPct,
      realizadosPeriodo,
      preventivosPeriodo,
      correctivosPeriodo,
      predictivosPeriodo,
      costoPeriodo,
      topResponsablesPeriodo,
      tendenciaMensual,
      realizadosPorMesAnual,
      realizadosPorMesAnualPorTipo,
    };
  });
}

