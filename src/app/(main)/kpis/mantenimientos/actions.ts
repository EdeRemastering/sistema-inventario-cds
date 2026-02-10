"use server";

import { getMantenimientosKpis } from "@/modules/mantenimientos/kpis";
import { getMantenimientosAiTrendAnalysis } from "@/modules/mantenimientos/kpis-ai";

function parseYmd(input: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

function parseId(n: number | undefined): number | undefined {
  if (n == null || !Number.isFinite(n) || n < 1) return undefined;
  return n;
}

export type GenerateAiAnalysisParams = {
  from: string;
  to: string;
  selectedYear: number;
  sede_id?: number;
  ubicacion_id?: number;
  categoria_id?: number;
  subcategoria_id?: number;
};

export async function generateAiAnalysis(params: GenerateAiAnalysisParams): Promise<string> {
  const from = parseYmd(params.from);
  const to = parseYmd(params.to);
  if (!from || !to) return "Fechas inválidas. Usa formato YYYY-MM-DD.";
  try {
    const kpis = await getMantenimientosKpis({
      from,
      to,
      selectedYear: params.selectedYear,
      sede_id: parseId(params.sede_id),
      ubicacion_id: parseId(params.ubicacion_id),
      categoria_id: parseId(params.categoria_id),
      subcategoria_id: parseId(params.subcategoria_id),
    });
    return await getMantenimientosAiTrendAnalysis(kpis);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error generando análisis IA";
    return `No se pudo generar el análisis IA: ${msg}`;
  }
}
