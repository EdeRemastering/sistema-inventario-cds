import type { MantenimientosKpis } from "./kpis";
import { groqChatCompletion } from "@/lib/groq";
import { unstable_cache } from "next/cache";

type AiAnalysisInput = {
  // Periodo del dashboard (rango escogido por el usuario)
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD

  // Año usado para series mes-a-mes (gráficas anuales)
  selectedYear: number;

  // Filtros activos (ids)
  filters: MantenimientosKpis["filters"];

  // KPIs de programaciones (mantenimientos_programados) y estados (lo que se grafica)
  programaciones: {
    years: number[];
    total: number;
    pendientes: number;
    realizados: number;
    aplazados: number;
    cancelados: number;
    cumplimientoPct: number;
  };

  // KPIs del periodo (mantenimientos_realizados) y tipos (lo que se grafica)
  realizadosPeriodo: {
    total: number;
    preventivo: number;
    correctivo: number;
    predictivo: number;
    costoTotal: number;
    topResponsables: Array<{ responsable: string; total: number }>;
  };

  // Series para gráficas
  charts: {
    // Tendencia por mes dentro del periodo (puede ser 1..N meses)
    tendenciaMensual: Array<{ month: string; realizados: number }>;
    // Año seleccionado (ene-dic), total realizados por mes
    realizadosPorMesAnual: Array<{ month: string; realizados: number }>;
    // Año seleccionado (ene-dic), comparativo por tipo (total vs preventivo/correctivo/predictivo)
    realizadosPorMesAnualPorTipo: Array<{
      month: string;
      total: number;
      preventivo: number;
      correctivo: number;
      predictivo: number;
    }>;
  };
};

function stableStringify(obj: unknown): string {
  // JSON ordenado por inserción (suficiente para nuestro caso: construimos el objeto siempre igual).
  return JSON.stringify(obj, null, 2);
}

function buildPrompt(input: AiAnalysisInput): string {
  const filtrosTxt = (() => {
    const f = input.filters;
    const parts: string[] = [];
    if (f.sede_id) parts.push(`sede_id=${f.sede_id}`);
    if (f.ubicacion_id) parts.push(`ubicacion_id=${f.ubicacion_id}`);
    if (f.categoria_id) parts.push(`categoria_id=${f.categoria_id}`);
    if (f.subcategoria_id) parts.push(`subcategoria_id=${f.subcategoria_id}`);
    return parts.length ? parts.join(", ") : "sin filtros";
  })();

  // Entregamos a la IA un “paquete” estructurado con TODOS los datos que alimentan las gráficas.
  // Así el análisis no se basa solo en un subconjunto y el caché se invalida si cualquiera cambia.
  const payload = stableStringify(input);

  const prompt = [
    `Contexto del rol: eres un analista/gestor de mantenimiento industrial (operación y gestión).`,
    `Analiza el desempeño de mantenimientos usando los KPIs y series del dashboard.`,
    ``,
    `Periodo general del dashboard: ${input.from} a ${input.to}.`,
    `Filtros activos: ${filtrosTxt}.`,
    ``,
    `Datos (JSON, fuente de verdad para el análisis):`,
    payload,
    ``,
    `Formato de salida (IMPORTANTE):`,
    `- No uses Markdown ni asteriscos (*) para negritas.`,
    `- Usa como máximo 1 a 3 emojis en todo el texto.`,
    `- Devuelve EXACTAMENTE estas secciones (una por línea):`,
    `  Tendencia: ...`,
    `  Picos: ...`,
    `  Meses debiles: ...`,
    `  Recomendaciones:`,
    `  - ...`,
    `  - ...`,
    `  Nota: ...`,
    `- IMPORTANTE (rol): Recomendaciones SOLO para gestión/operación de mantenimiento.`,
    `  Prohibido sugerir trabajo de desarrollo o software (ej: "implementar un sistema", "hacer una app", "programar", "crear una base de datos").`,
    `- Si hay datos insuficientes (muchos ceros), dilo explícitamente y sugiere acciones de proceso (no software):`,
    `  estandarizar el cierre de OT, checklist de cierre, capacitación, disciplina de registro, auditorías semanales, y responsables por calidad de datos.`,
    `No inventes causas específicas si no hay evidencia. Sé concreto.`,
  ].join("\n");

  return prompt;
}

const getCachedGroqTrendAnalysis = unstable_cache(
  // Cacheamos por el PROMPT final (incluye la serie). Si cambian datos, cambia el prompt y se invalida.
  async (prompt: string): Promise<string> => {
    return groqChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "Eres un analista/gestor de mantenimiento industrial. Responde en español, conciso, orientado a acción. No des recomendaciones para programadores ni desarrollo de software.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 450,
    });
  },
  // Bump de versión para evitar que quede pegado a un caché previo.
  ["mantenimientos-ai-analysis-v1"],
  {
    // Evita llamadas repetidas a la IA cuando el prompt (serie) no cambia.
    revalidate: 60 * 60 * 24, // 24h
  }
);

export async function getMantenimientosAiTrendAnalysis(kpis: MantenimientosKpis): Promise<string> {
  const input: AiAnalysisInput = {
    from: kpis.from,
    to: kpis.to,
    selectedYear: kpis.selectedYear,
    filters: kpis.filters,
    programaciones: {
      years: kpis.years,
      total: kpis.programacionesTotal,
      pendientes: kpis.pendientes,
      realizados: kpis.realizados,
      aplazados: kpis.aplazados,
      cancelados: kpis.cancelados,
      cumplimientoPct: kpis.cumplimientoPct,
    },
    realizadosPeriodo: {
      total: kpis.realizadosPeriodo,
      preventivo: kpis.preventivosPeriodo,
      correctivo: kpis.correctivosPeriodo,
      predictivo: kpis.predictivosPeriodo,
      costoTotal: kpis.costoPeriodo,
      topResponsables: kpis.topResponsablesPeriodo,
    },
    charts: {
      tendenciaMensual: kpis.tendenciaMensual.map((p) => ({ month: p.name, realizados: p.realizados })),
      realizadosPorMesAnual: kpis.realizadosPorMesAnual,
      realizadosPorMesAnualPorTipo: kpis.realizadosPorMesAnualPorTipo,
    },
  };

  // Si no hay API key, devolvemos el mensaje para UI (sin lanzar error).
  if (!process.env.GROQ_API_KEY) return "Configura `GROQ_API_KEY` para habilitar el análisis con IA.";

  const prompt = buildPrompt(input);
  return getCachedGroqTrendAnalysis(prompt);
}

