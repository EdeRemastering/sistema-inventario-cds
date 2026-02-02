import type { TutorialItem } from "../types";

export const MANTENIMIENTOS_ITEMS: TutorialItem[] = [
  {
    id: "mantenimientos",
    title: "¿Cómo gestionar mantenimientos (programados y ejecutados)?",
    description:
      "Ve a Mantenimientos y usa las pestañas para programar, ejecutar y ver la semana.",
    // TODO: convertir a flujos completos separados (programar, marcar realizado, crear ejecutado)
    howto: {
      route: "/mantenimientos",
      selector: '[data-tour="mantenimientos-tabs"]',
      title: "Pestañas de mantenimientos",
      description:
        "Usa estas pestañas para navegar: Semana / Programados / Ejecutados / Cronograma.",
      side: "bottom",
      align: "start",
    },
  },
];

