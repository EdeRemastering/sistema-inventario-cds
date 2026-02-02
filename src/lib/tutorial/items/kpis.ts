import type { TutorialItem } from "../types";

export const KPIS_ITEMS: TutorialItem[] = [
  {
    id: "kpis",
    title: "¿Cómo usar los KPIs de mantenimientos?",
    description:
      "Ve a KPIs y usa filtros por fecha/sede/ubicación/categoría/subcategoría.",
    // TODO: convertir a flow completo (cambiar periodo, aplicar filtros, ver cambios en gráficas y análisis IA)
    howto: {
      route: "/kpis/mantenimientos",
      selector: '[data-tour="kpis-filters"]',
      title: "Filtros de KPIs",
      description: "Ajusta periodo y filtros para que cambien gráficas y análisis IA.",
      side: "bottom",
      align: "start",
    },
  },
];

