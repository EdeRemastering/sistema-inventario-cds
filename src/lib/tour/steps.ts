export type AppTourStep = {
  id: string;
  route: string;
  selector: string; // CSS selector (prefer data-tour)
  title: string;
  description: string;
  /**
   * Acción opcional antes de mostrar el step.
   * Útil para abrir un modal (ej: click en "Crear") antes de resaltar campos del formulario.
   */
  beforeClickSelector?: string;
  /**
   * Si el step pide "haz clic en X", podemos avanzar automáticamente
   * cuando el usuario haga clic en el elemento objetivo.
   *
   * Importante: úsalo solo en pasos cuyo objetivo sea un botón/acción,
   * no en inputs donde el usuario debe escribir.
   */
  autoAdvanceOnClick?: boolean;
  /**
   * Selector alternativo para detectar el click (si `selector` resalta un contenedor).
   * Ej: resaltar fila completa, pero detectar click en el botón interno.
   */
  autoAdvanceClickSelector?: string;
  /**
   * Avanza automáticamente cuando un elemento desaparece del DOM.
   * Útil para pasos finales como "Guardar" donde el modal se cierra al éxito.
   */
  autoAdvanceOnGone?: boolean;
  /**
   * Selector del elemento cuya desaparición dispara el avance.
   * Si no se provee, se usa `selector`.
   */
  autoAdvanceGoneSelector?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

/**
 * Tour guiado (Driver.js) para el uso general de la app.
 *
 * Nota: usamos `data-tour="..."` en componentes clave para que los selectores
 * sean estables aunque cambie el layout o las clases.
 */
export const APP_TOUR_STEPS: AppTourStep[] = [
  {
    id: "welcome",
    route: "/dashboard",
    selector: "body",
    title: "Bienvenida",
    description:
      "Este tutorial te mostrará el flujo completo: configurar sedes/ubicaciones, crear elementos, gestionar mantenimientos, tickets y revisar KPIs.",
    side: "bottom",
    align: "center",
  },
  {
    id: "sidebar",
    route: "/dashboard",
    selector: '[data-tour="sidebar-menu"]',
    title: "Menú principal",
    description:
      "Usa este menú para navegar por los módulos. Puedes volver aquí en cualquier momento para continuar el recorrido.",
    side: "right",
    align: "start",
  },
  {
    id: "categorias",
    route: "/categorias",
    selector: '[data-tour="page-title"]',
    title: "Categorías",
    description:
      "Primero define categorías y subcategorías para clasificar los elementos (equipos/activos).",
    side: "bottom",
    align: "start",
  },
  {
    id: "categorias-create",
    route: "/categorias",
    selector: '[data-tour="categorias-create"]',
    title: "Crear categoría",
    description:
      "Usa este botón para crear una nueva categoría. Puedes agregar nombre y descripción.",
    side: "left",
    align: "end",
  },
  {
    id: "subcategorias",
    route: "/subcategorias",
    selector: '[data-tour="page-title"]',
    title: "Subcategorías",
    description:
      "Define subcategorías para detallar la clasificación (por ejemplo: audio, video, iluminación, etc.).",
    side: "bottom",
    align: "start",
  },
  {
    id: "ubicaciones",
    route: "/ubicaciones",
    selector: '[data-tour="page-title"]',
    title: "Ubicaciones",
    description:
      "Crea ubicaciones (salones/ambientes). Los tickets prestan ubicaciones, y las ubicaciones contienen elementos.",
    side: "bottom",
    align: "start",
  },
  {
    id: "hojas-vida",
    route: "/hojas-vida",
    selector: '[data-tour="page-title"]',
    title: "Hojas de Vida",
    description:
      "Consulta y registra la hoja de vida del elemento: datos técnicos, rutinas, responsables y cambios relevantes.",
    side: "bottom",
    align: "start",
  },
  {
    id: "elementos",
    route: "/elementos",
    selector: '[data-tour="elementos-create"]',
    title: "Elementos",
    description:
      "Aquí registras el inventario. Usa “Crear” para añadir un elemento y (opcional) tomar/subir una foto.",
    side: "left",
    align: "end",
  },
  {
    id: "mantenimientos",
    route: "/mantenimientos",
    selector: '[data-tour="mantenimientos-tabs"]',
    title: "Mantenimientos",
    description:
      "Gestiona mantenimientos programados y registra mantenimientos ejecutados. La pestaña “Semana” te ayuda a priorizar pendientes.",
    side: "bottom",
    align: "start",
  },
  {
    id: "tickets",
    route: "/tickets",
    selector: '[data-tour="tickets-create"]',
    title: "Tickets (préstamos de ubicaciones)",
    description:
      "Crea tickets para prestar una ubicación. El sistema registra quién solicita y quién resuelve (firmas incluidas).",
    side: "left",
    align: "end",
  },
  {
    id: "kpis",
    route: "/kpis/mantenimientos",
    selector: '[data-tour="kpis-filters"]',
    title: "KPIs de mantenimiento",
    description:
      "Filtra por fechas/sede/ubicación/categoría/subcategoría. Las gráficas y el análisis con IA usan estos mismos datos.",
    side: "bottom",
    align: "start",
  },
  {
    id: "usuarios",
    route: "/usuarios",
    selector: '[data-tour="page-title"]',
    title: "Usuarios y firmas",
    description:
      "Administra usuarios, nombre/apellido y firma (se guarda en Cloudflare R2). Esto permite autollenar “resuelve” en tickets y responsable en mantenimientos.",
    side: "bottom",
    align: "start",
  },
  {
    id: "done",
    route: "/dashboard",
    selector: '[data-tour="tutorial-button"]',
    title: "¡Listo!",
    description:
      "Puedes volver a ejecutar este tutorial cuando quieras desde el botón “Tutorial”.",
    side: "right",
    align: "start",
  },
];

