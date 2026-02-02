import type { TutorialItem } from "../types";

export const CATEGORIAS_ITEMS: TutorialItem[] = [
  {
    id: "crear-categoria",
    title: "¿Cómo crear una categoría?",
    description:
      "Ve a Categorías y usa el botón de crear para registrar una nueva categoría.",
    flow: {
      title: "Crear categoría",
      steps: [
        {
          id: "howto-categoria-1",
          route: "/categorias",
          selector: '[data-tour="categorias-create-button"]',
          title: "Abrir el formulario",
          description: "Haz clic en “Crear” para abrir el formulario de categoría.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-categoria-2",
          route: "/categorias",
          selector: '[data-tour="categoria-form-nombre"]',
          title: "Nombre de la categoría",
          description:
            "Escribe un nombre claro y corto. Recomendación: usa singular (ej: “Audio”, “Video”, “Iluminación”).",
          beforeClickSelector: '[data-tour="categorias-create-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-categoria-3",
          route: "/categorias",
          selector: '[data-tour="categoria-form-descripcion"]',
          title: "Descripción (opcional)",
          description:
            "Agrega una breve descripción para que el equipo entienda qué incluye esta categoría.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-categoria-4",
          route: "/categorias",
          selector: '[data-tour="categoria-form-estado"]',
          title: "Estado",
          description:
            "Deja “Activo” para usarla normalmente. Usa “Inactivo” si no quieres que se use en nuevos registros.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-categoria-5",
          route: "/categorias",
          selector: '[data-tour="categoria-form-submit"]',
          title: "Guardar",
          description: "Cuando termines, pulsa “Crear” para guardar la categoría.",
          // Cierra el tutorial cuando el modal se cierre tras guardar.
          autoAdvanceOnGone: true,
          autoAdvanceGoneSelector: '[data-tour="categoria-form"]',
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "editar-categoria",
    title: "¿Cómo editar una categoría?",
    description: "En la lista, usa el botón de editar de una categoría.",
    flow: {
      title: "Editar categoría",
      steps: [
        {
          id: "howto-editar-categoria-1",
          route: "/categorias",
          selector:
            '[data-tour="categorias-edit-first"] [data-tour="categorias-edit-button"]',
          title: "Abrir la edición",
          description: "Haz clic en “Editar” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-editar-categoria-2",
          route: "/categorias",
          selector: '[data-tour="categoria-form-nombre"]',
          title: "Actualizar el nombre",
          description:
            "Edita el nombre si cambió la clasificación (ej: “Audio”, “Video”).",
          beforeClickSelector:
            '[data-tour="categorias-edit-first"] [data-tour="categorias-edit-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-categoria-3",
          route: "/categorias",
          selector: '[data-tour="categoria-form-descripcion"]',
          title: "Actualizar la descripción (opcional)",
          description:
            "Ajusta la descripción para que sea clara sobre qué incluye la categoría.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-categoria-4",
          route: "/categorias",
          selector: '[data-tour="categoria-form-submit"]',
          title: "Guardar cambios",
          description: "Pulsa “Guardar cambios” para actualizar la categoría.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "eliminar-categoria",
    title: "¿Cómo eliminar una categoría?",
    description: "En la lista, usa el botón de eliminar (con confirmación).",
    flow: {
      title: "Eliminar categoría",
      steps: [
        {
          id: "howto-eliminar-categoria-1",
          route: "/categorias",
          selector: '[data-tour="categorias-delete-first-trigger"]',
          title: "Iniciar eliminación",
          description: "Haz clic en “Eliminar” para abrir la confirmación.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-eliminar-categoria-2",
          route: "/categorias",
          selector: '[data-tour="categorias-delete-first-confirm"]',
          title: "Confirmar",
          description: "Pulsa “Sí, eliminar” para confirmar la eliminación.",
          autoAdvanceOnClick: true,
          side: "top",
          align: "end",
        },
        {
          id: "howto-eliminar-categoria-3",
          route: "/categorias",
          selector: '[data-tour="page-title"]',
          title: "Listo",
          description:
            "La categoría fue eliminada. Si no la ves, revisa que no esté filtrada por búsqueda.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
];

