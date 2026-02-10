import type { TutorialItem } from "../types";

export const ELEMENTOS_ITEMS: TutorialItem[] = [
  {
    id: "crear-elemento",
    title: "¿Cómo crear un elemento del inventario?",
    description:
      "Ve a Elementos y usa el botón de crear. Puedes tomar/subir foto y guardar.",
    flow: {
      title: "Crear elemento",
      steps: [
        {
          id: "howto-crear-elemento-1",
          route: "/elementos",
          selector: '[data-tour="elementos-create"]',
          title: "Abrir el formulario",
          description:
            "Haz clic en “Crear” para abrir el formulario de elemento en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-crear-elemento-2",
          route: "/elementos",
          selector: '[data-tour="elementos-create"]',
          title: "Seleccionar ubicación y categoría",
          description:
            "En el formulario, selecciona sede, ubicación, categoría y (si aplica) subcategoría para ubicar correctamente el equipo.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-elemento-3",
          route: "/elementos",
          selector: '[data-tour="elementos-create"]',
          title: "Datos del equipo",
          description:
            "Completa los campos de serie, marca, modelo y cantidad. La serie es clave para identificar el elemento.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-elemento-4",
          route: "/elementos",
          selector: '[data-tour="elementos-create"]',
          title: "Foto (opcional)",
          description:
            "Si quieres, toma o sube una foto del equipo. Esto ayuda a identificarlo visualmente en auditorías.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-elemento-5",
          route: "/elementos",
          selector: '[data-tour="elementos-create"]',
          title: "Guardar el elemento",
          description:
            "Pulsa el botón de guardar del formulario para crear el elemento. El modal se cerrará cuando se guarde correctamente.",
          autoAdvanceOnGone: true,
          autoAdvanceGoneSelector: '[data-tour="ticket-form"]',
          side: "top",
          align: "end",
        },
        {
          id: "howto-crear-elemento-6",
          route: "/elementos",
          selector: '[data-tour="page-title"]',
          title: "Verificar en la lista",
          description:
            "Verifica que el nuevo elemento aparezca en la lista. Si no lo ves, usa el buscador o revisa la paginación.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
  {
    id: "editar-elemento",
    title: "¿Cómo editar un elemento?",
    description: "En la lista, usa el botón Editar del primer elemento.",
    flow: {
      title: "Editar elemento",
      steps: [
        {
          id: "howto-editar-elemento-1",
          route: "/elementos",
          selector: '[data-tour="elementos-edit-first"]',
          title: "Abrir la edición",
          description:
            "Haz clic en el botón de editar del primer elemento para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-editar-elemento-2",
          route: "/elementos",
          selector: '[data-tour="elementos-edit-first"]',
          title: "Actualizar datos básicos",
          description:
            "Ajusta serie, marca, modelo o cantidad según el cambio que necesites registrar.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-elemento-3",
          route: "/elementos",
          selector: '[data-tour="elementos-edit-first"]',
          title: "Cambiar ubicación o categoría (opcional)",
          description:
            "Si el equipo cambió de ambiente o clasificación, actualiza sede, ubicación, categoría y subcategoría.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-elemento-4",
          route: "/elementos",
          selector: '[data-tour="elementos-edit-first"]',
          title: "Guardar cambios",
          description:
            "Pulsa el botón de guardar del formulario para actualizar el elemento.",
          side: "top",
          align: "end",
        },
      ],
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

