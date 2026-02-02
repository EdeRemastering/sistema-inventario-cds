import type { TutorialItem } from "../types";

export const SUBCATEGORIAS_ITEMS: TutorialItem[] = [
  {
    id: "crear-subcategoria",
    title: "¿Cómo crear una subcategoría?",
    description:
      "Ve a Subcategorías y registra una subcategoría asociada a una categoría.",
    flow: {
      title: "Crear subcategoría",
      steps: [
        {
          id: "howto-crear-subcategoria-1",
          route: "/subcategorias",
          selector: '[data-tour="subcategorias-create-button"]',
          title: "Abrir el formulario",
          description: "Haz clic en “Crear” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-crear-subcategoria-2",
          route: "/subcategorias",
          selector: '[data-tour="subcategoria-form-nombre"]',
          title: "Nombre",
          description: "Escribe un nombre claro (ej: “Micrófonos”, “Parlantes”).",
          beforeClickSelector: '[data-tour="subcategorias-create-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-subcategoria-3",
          route: "/subcategorias",
          selector: '[data-tour="subcategoria-form-categoria"]',
          title: "Categoría",
          description: "Selecciona la categoría a la que pertenece esta subcategoría.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-subcategoria-4",
          route: "/subcategorias",
          selector: '[data-tour="subcategoria-form-submit"]',
          title: "Guardar",
          description: "Pulsa “Crear” para guardar la subcategoría.",
          // Cierra el tutorial cuando el modal se cierre tras guardar.
          autoAdvanceOnGone: true,
          autoAdvanceGoneSelector: '[data-tour="subcategoria-form"]',
          side: "top",
          align: "end",
        },
        {
          id: "howto-crear-subcategoria-5",
          route: "/subcategorias",
          selector: '[data-tour="page-title"]',
          title: "Verificación",
          description:
            "Verifica que la subcategoría aparezca en la lista. Si no la ves, usa el buscador para encontrarla.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
  {
    id: "editar-subcategoria",
    title: "¿Cómo editar una subcategoría?",
    description: "En la lista, usa el botón de editar de una subcategoría.",
    flow: {
      title: "Editar subcategoría",
      steps: [
        {
          id: "howto-editar-subcategoria-1",
          route: "/subcategorias",
          selector:
            '[data-tour="subcategorias-edit-first"] [data-tour="subcategorias-edit-button"]',
          title: "Abrir la edición",
          description: "Haz clic en “Editar” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-editar-subcategoria-2",
          route: "/subcategorias",
          selector: '[data-tour="subcategoria-form-nombre"]',
          title: "Actualizar el nombre",
          description: "Edita el nombre de la subcategoría (ej: “Micrófonos”).",
          beforeClickSelector:
            '[data-tour="subcategorias-edit-first"] [data-tour="subcategorias-edit-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-subcategoria-3",
          route: "/subcategorias",
          selector: '[data-tour="subcategoria-form-categoria"]',
          title: "Verificar la categoría",
          description:
            "Asegúrate de que la subcategoría esté asociada a la categoría correcta.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-subcategoria-4",
          route: "/subcategorias",
          selector: '[data-tour="subcategoria-form-submit"]',
          title: "Guardar cambios",
          description: "Pulsa “Guardar cambios” para actualizar la subcategoría.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "eliminar-subcategoria",
    title: "¿Cómo eliminar una subcategoría?",
    description: "En la lista, usa el botón de eliminar (con confirmación).",
    flow: {
      title: "Eliminar subcategoría",
      steps: [
        {
          id: "howto-eliminar-subcategoria-1",
          route: "/subcategorias",
          selector: '[data-tour="subcategorias-delete-first-trigger"]',
          title: "Iniciar eliminación",
          description: "Haz clic en “Eliminar” para abrir la confirmación.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-eliminar-subcategoria-2",
          route: "/subcategorias",
          selector: '[data-tour="subcategorias-delete-first-confirm"]',
          title: "Confirmar",
          description: "Pulsa “Sí, eliminar” para confirmar la eliminación.",
          autoAdvanceOnClick: true,
          side: "top",
          align: "end",
        },
        {
          id: "howto-eliminar-subcategoria-3",
          route: "/subcategorias",
          selector: '[data-tour="page-title"]',
          title: "Listo",
          description: "La subcategoría fue eliminada.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
];

