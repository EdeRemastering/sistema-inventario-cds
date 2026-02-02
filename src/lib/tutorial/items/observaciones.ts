import type { TutorialItem } from "../types";

export const OBSERVACIONES_ITEMS: TutorialItem[] = [
  {
    id: "crear-observacion",
    title: "¿Cómo crear una observación?",
    description:
      "Agrega observaciones asociadas a un elemento para documentar su estado.",
    flow: {
      title: "Crear observación",
      steps: [
        {
          id: "howto-crear-observacion-1",
          route: "/observaciones",
          selector: '[data-tour="observaciones-create-button"]',
          title: "Abrir el formulario",
          description: "Haz clic en “Crear” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-crear-observacion-2",
          route: "/observaciones",
          selector: '[data-tour="observacion-form-elemento"]',
          title: "Seleccionar elemento",
          description: "Elige el elemento al que pertenece esta observación.",
          beforeClickSelector: '[data-tour="observaciones-create-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-observacion-3",
          route: "/observaciones",
          selector: '[data-tour="observacion-form-descripcion"]',
          title: "Descripción",
          description:
            "Escribe la observación (qué pasó, qué se recomienda, qué se debe revisar).",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-observacion-4",
          route: "/observaciones",
          selector: '[data-tour="observacion-form-submit"]',
          title: "Guardar",
          description: "Pulsa “Crear” para guardar la observación.",
          autoAdvanceOnGone: true,
          autoAdvanceGoneSelector: '[data-tour="observacion-form"]',
          side: "top",
          align: "end",
        },
        {
          id: "howto-crear-observacion-5",
          route: "/observaciones",
          selector: '[data-tour="page-title"]',
          title: "Verificación",
          description:
            "Verifica que la observación aparezca en la lista. Si no la ves, usa el buscador.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
  {
    id: "editar-observacion",
    title: "¿Cómo editar una observación?",
    description: "Edita una observación ya registrada.",
    flow: {
      title: "Editar observación",
      steps: [
        {
          id: "howto-editar-observacion-1",
          route: "/observaciones",
          selector:
            '[data-tour="observaciones-edit-first"] [data-tour="observaciones-edit-button"]',
          title: "Abrir la edición",
          description: "Haz clic en “Editar” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-editar-observacion-2",
          route: "/observaciones",
          selector: '[data-tour="observacion-form-descripcion"]',
          title: "Actualizar la descripción",
          description: "Edita el texto para reflejar el estado real del elemento.",
          beforeClickSelector:
            '[data-tour="observaciones-edit-first"] [data-tour="observaciones-edit-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-observacion-3",
          route: "/observaciones",
          selector: '[data-tour="observacion-form-submit"]',
          title: "Guardar cambios",
          description: "Pulsa “Guardar cambios” para actualizar la observación.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "eliminar-observacion",
    title: "¿Cómo eliminar una observación?",
    description: "En la lista, usa Eliminar (con confirmación).",
    flow: {
      title: "Eliminar observación",
      steps: [
        {
          id: "howto-eliminar-observacion-1",
          route: "/observaciones",
          selector: '[data-tour="observaciones-delete-first-trigger"]',
          title: "Iniciar eliminación",
          description: "Haz clic en “Eliminar” para abrir la confirmación.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-eliminar-observacion-2",
          route: "/observaciones",
          selector: '[data-tour="observaciones-delete-first-confirm"]',
          title: "Confirmar",
          description: "Pulsa “Sí, eliminar” para confirmar.",
          autoAdvanceOnClick: true,
          side: "top",
          align: "end",
        },
        {
          id: "howto-eliminar-observacion-3",
          route: "/observaciones",
          selector: '[data-tour="page-title"]',
          title: "Listo",
          description: "La observación fue eliminada.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
];

