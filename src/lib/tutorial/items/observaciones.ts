import type { TutorialItem } from "../types";

/**
 * Las observaciones se gestionan dentro del módulo Hojas de Vida (por elemento).
 * El tutorial lleva al usuario a Hojas de Vida y le indica que abra un elemento
 * para ver y gestionar observaciones en la pestaña correspondiente.
 */
export const OBSERVACIONES_ITEMS: TutorialItem[] = [
  {
    id: "crear-observacion",
    title: "¿Cómo crear una observación?",
    description:
      "Las observaciones están en Hojas de Vida. Abre la hoja de vida de un elemento y en la pestaña Observaciones podrás crear.",
    flow: {
      title: "Crear observación (Hojas de Vida)",
      steps: [
        {
          id: "howto-crear-observacion-1",
          route: "/hojas-vida",
          selector: '[data-tour="page-title"]',
          title: "Ir a Hojas de Vida",
          description:
            "Las observaciones se gestionan dentro de Hojas de Vida. Aquí verás la lista de elementos con hoja de vida.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-observacion-2",
          route: "/hojas-vida",
          selector: '[data-tour="hojasvida-ver-historial-first"]',
          title: "Abrir la hoja de vida de un elemento",
          description:
            "Haz clic en «Ver historial» de un elemento para abrir su hoja de vida. En esa página, en la pestaña «Observaciones», podrás crear, editar y eliminar observaciones.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
      ],
    },
  },
  {
    id: "editar-observacion",
    title: "¿Cómo editar una observación?",
    description:
      "Entra a Hojas de Vida, abre un elemento (Ver historial) y en la pestaña Observaciones edita la observación.",
    flow: {
      title: "Editar observación (Hojas de Vida)",
      steps: [
        {
          id: "howto-editar-observacion-1",
          route: "/hojas-vida",
          selector: '[data-tour="page-title"]',
          title: "Ir a Hojas de Vida",
          description:
            "Las observaciones se gestionan dentro de Hojas de Vida.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-observacion-2",
          route: "/hojas-vida",
          selector: '[data-tour="hojasvida-ver-historial-first"]',
          title: "Abrir la hoja de vida",
          description:
            "Haz clic en «Ver historial» de un elemento. En la pestaña «Observaciones» podrás editar las observaciones existentes.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
      ],
    },
  },
  {
    id: "eliminar-observacion",
    title: "¿Cómo eliminar una observación?",
    description:
      "Entra a Hojas de Vida, abre un elemento (Ver historial) y en la pestaña Observaciones elimina la observación.",
    flow: {
      title: "Eliminar observación (Hojas de Vida)",
      steps: [
        {
          id: "howto-eliminar-observacion-1",
          route: "/hojas-vida",
          selector: '[data-tour="page-title"]',
          title: "Ir a Hojas de Vida",
          description:
            "Las observaciones se gestionan dentro de Hojas de Vida.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-eliminar-observacion-2",
          route: "/hojas-vida",
          selector: '[data-tour="hojasvida-ver-historial-first"]',
          title: "Abrir la hoja de vida",
          description:
            "Haz clic en «Ver historial» de un elemento. En la pestaña «Observaciones» podrás eliminar observaciones (con confirmación).",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
      ],
    },
  },
];
