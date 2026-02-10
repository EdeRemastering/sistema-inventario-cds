import type { TutorialItem } from "../types";

export const PRESTAMOS_ITEMS: TutorialItem[] = [
  {
    id: "crear-prestamo",
    title: "¿Cómo crear un préstamo?",
    description:
      "Ve a Préstamos y crea un préstamo para registrar una ubicación (ambiente) con firmas.",
    flow: {
      title: "Crear préstamo",
      steps: [
        {
          id: "howto-crear-prestamo-1",
          route: "/prestamos",
          selector: '[data-tour="prestamos-create"]',
          title: "Abrir el formulario de préstamo",
          description:
            "Haz clic en \"Crear\" para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-crear-prestamo-2",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form-fechas"]',
          title: "Definir fechas del préstamo",
          description:
            "Selecciona la fecha y hora de inicio y, opcionalmente, la fecha estimada de devolución.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-prestamo-3",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form-ubicacion"]',
          title: "Elegir la ubicación a prestar",
          description:
            "Escoge la ubicación (ambiente/salón) que se va a prestar.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-prestamo-4",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form"]',
          title: "Completar datos del solicitante",
          description:
            "Diligencia dependencia, nombre y apellido del solicitante, motivo y número de orden (si aplica).",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-prestamo-5",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form-submit"]',
          title: "Guardar el préstamo",
          description:
            "Pulsa \"Crear\" para guardar. El número se generará automáticamente con el formato PRESTAMO-YYYY-NNNNNN.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "editar-prestamo",
    title: "¿Cómo editar un préstamo?",
    description: "Dentro del préstamo, usa el botón Editar.",
    flow: {
      title: "Editar préstamo",
      steps: [
        {
          id: "howto-editar-prestamo-1",
          route: "/prestamos",
          selector: '[data-tour="prestamos-edit"]',
          title: "Abrir la edición",
          description:
            "Haz clic en \"Editar\" para abrir el formulario del préstamo en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-editar-prestamo-2",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form-ubicacion"]',
          title: "Ubicación prestada",
          description:
            "Cambia la ubicación si es necesario.",
          beforeClickSelector: '[data-tour="prestamos-edit"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-prestamo-3",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form-fecha-inicio"]',
          title: "Fecha de inicio",
          description:
            "Ajusta la fecha/hora de inicio si cambió el horario del préstamo.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-prestamo-4",
          route: "/prestamos",
          selector: '[data-tour="prestamo-form-submit"]',
          title: "Guardar cambios",
          description: "Pulsa \"Guardar cambios\" para actualizar el préstamo.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "marcar-prestamo-entregado",
    title: "¿Cómo marcar un préstamo como entregado?",
    description: "Esto abre el flujo de firmas para cerrar el préstamo.",
    flow: {
      title: "Marcar préstamo como entregado",
      steps: [
        {
          id: "howto-prestamo-entregado-1",
          route: "/prestamos",
          selector: '[data-tour="prestamos-deliver"]',
          title: "Iniciar cierre del préstamo",
          description:
            "Haz clic en \"Marcar como entregado\" para abrir el diálogo de cierre con firmas.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-prestamo-entregado-2",
          route: "/prestamos",
          selector: "body",
          title: "Firmas y confirmación",
          description:
            "En el diálogo, revisa los datos, captura las firmas requeridas y confirma la entrega.",
          side: "bottom",
          align: "center",
        },
      ],
    },
  },
];
