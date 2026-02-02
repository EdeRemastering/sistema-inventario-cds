import type { TutorialItem } from "../types";

export const ELEMENTOS_ITEMS: TutorialItem[] = [
  {
    id: "crear-elemento",
    title: "¿Cómo crear un elemento del inventario?",
    description:
      "Ve a Elementos y usa el botón de crear. Puedes tomar/subir foto y guardar.",
    // TODO: convertir a flow completo (modal -> campos -> guardar -> verificar en la lista)
    howto: {
      route: "/elementos",
      selector: '[data-tour="elementos-create"]',
      title: "Crear elemento",
      description: "Haz clic aquí para crear un elemento.",
      side: "left",
      align: "end",
    },
  },
  {
    id: "editar-elemento",
    title: "¿Cómo editar un elemento?",
    description: "En la lista, usa el botón Editar del primer elemento.",
    // TODO: convertir a flow completo (abrir modal -> campos -> guardar)
    howto: {
      route: "/elementos",
      selector: '[data-tour="elementos-edit-first"]',
      title: "Editar elemento",
      description: "Usa este botón para editar un elemento.",
      side: "left",
      align: "end",
    },
  },
  {
    id: "eliminar-elemento",
    title: "¿Cómo eliminar un elemento?",
    description: "En la lista, usa el botón Eliminar (con confirmación).",
    flow: {
      title: "Eliminar elemento",
      steps: [
        {
          id: "howto-eliminar-elemento-1",
          route: "/elementos",
          selector: '[data-tour="elementos-delete-first-trigger"]',
          title: "Iniciar eliminación",
          description: "Haz clic en “Eliminar” para abrir la confirmación.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-eliminar-elemento-2",
          route: "/elementos",
          selector: '[data-tour="elementos-delete-first-confirm"]',
          title: "Confirmar",
          description: "Pulsa “Sí, eliminar” para confirmar la eliminación.",
          autoAdvanceOnClick: true,
          side: "top",
          align: "end",
        },
        {
          id: "howto-eliminar-elemento-3",
          route: "/elementos",
          selector: '[data-tour="page-title"]',
          title: "Listo",
          description:
            "El elemento fue eliminado. Si no lo ves reflejado, revisa la búsqueda/filtros y recarga la lista.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
];

