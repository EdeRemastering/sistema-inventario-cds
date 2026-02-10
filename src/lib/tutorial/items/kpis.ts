import type { TutorialItem } from "../types";

export const KPIS_ITEMS: TutorialItem[] = [
  {
    id: "kpis",
    title: "¿Cómo usar los KPIs de mantenimientos?",
    description:
      "Ve a KPIs y usa filtros por fecha/sede/ubicación/categoría/subcategoría.",
    flow: {
      title: "Usar KPIs de mantenimientos",
      steps: [
        {
          id: "howto-kpis-1",
          route: "/kpis/mantenimientos",
          selector: '[data-tour="kpis-filters"]',
          title: "Elegir el periodo de análisis",
          description:
            "Usa el selector de rango de fechas y el año para definir el periodo que quieres analizar.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-kpis-2",
          route: "/kpis/mantenimientos",
          selector: '[data-tour="kpis-filters"]',
          title: "Filtrar por sede y ubicación",
          description:
            "Filtra por sede y, opcionalmente, por una ubicación específica para enfocar las métricas en un ambiente.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-kpis-3",
          route: "/kpis/mantenimientos",
          selector: '[data-tour="kpis-filters"]',
          title: "Filtrar por categoría y subcategoría",
          description:
            "Limita el análisis a ciertas categorías/subcategorías (ej: solo Audio, o solo Iluminación).",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-kpis-4",
          route: "/kpis/mantenimientos",
          selector: '[data-tour="kpis-filters"]',
          title: "Aplicar los filtros",
          description:
            "Pulsa “Aplicar” para refrescar las gráficas y el análisis con los filtros seleccionados.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-kpis-5",
          route: "/kpis/mantenimientos",
          selector: "body",
          title: "Leer gráficas y análisis",
          description:
            "Debajo verás las gráficas y, si está disponible, el análisis con IA interpretando estos mismos datos.",
          side: "bottom",
          align: "center",
        },
      ],
    },
  },
];

