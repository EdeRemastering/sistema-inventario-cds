import type { TutorialItem } from "../types";

export const TICKETS_ITEMS: TutorialItem[] = [
  {
    id: "crear-ticket",
    title: "¿Cómo crear un ticket (préstamo de ubicación)?",
    description:
      "Ve a Tickets y crea un ticket para prestar una ubicación (con firmas).",
    flow: {
      title: "Crear ticket",
      steps: [
        {
          id: "howto-crear-ticket-1",
          route: "/tickets",
          selector: '[data-tour="tickets-create"]',
          title: "Abrir el formulario de ticket",
          description:
            "Haz clic en “Crear ticket” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-crear-ticket-2",
          route: "/tickets",
          selector: '[data-tour="ticket-form-fechas"]',
          title: "Definir fechas del préstamo",
          description:
            "Selecciona la fecha y hora de inicio y, opcionalmente, la fecha estimada de devolución del préstamo.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-ticket-3",
          route: "/tickets",
          selector: '[data-tour="ticket-form-ubicacion"]',
          title: "Elegir la ubicación a prestar",
          description:
            "Escoge la ubicación (ambiente/salón) que se va a prestar para este ticket.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-ticket-4",
          route: "/tickets",
          selector: '[data-tour="ticket-form"]',
          title: "Completar datos del solicitante",
          description:
            "Diligencia dependencia, nombre y apellido del solicitante, motivo y número de orden (si aplica).",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-ticket-5",
          route: "/tickets",
          selector: '[data-tour="ticket-form"]',
          title: "Firma digital del solicitante",
          description:
            "En la sección de firmas, dibuja la firma del solicitante. Es requerida cuando creas un ticket nuevo.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-ticket-6",
          route: "/tickets",
          selector: '[data-tour="ticket-form-submit"]',
          title: "Guardar el ticket",
          description:
            "Pulsa “Crear” para guardar el ticket. El número se generará automáticamente con el formato TICKET-YYYY-NNNNNN.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "editar-ticket",
    title: "¿Cómo editar un ticket?",
    description: "Dentro del ticket, usa el botón Editar.",
    flow: {
      title: "Editar ticket",
      steps: [
        {
          id: "howto-editar-ticket-1",
          route: "/tickets",
          selector: '[data-tour="tickets-edit"]',
          title: "Abrir la edición",
          description:
            "Haz clic en “Editar” para abrir el formulario del ticket en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-editar-ticket-2",
          route: "/tickets",
          selector: '[data-tour="ticket-form-ubicacion"]',
          title: "Ubicación prestada",
          description:
            "Cambia la ubicación si es necesario (el ticket presta un ambiente).",
          beforeClickSelector: '[data-tour="tickets-edit"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-ticket-3",
          route: "/tickets",
          selector: '[data-tour="ticket-form-fecha-inicio"]',
          title: "Fecha de inicio",
          description:
            "Ajusta la fecha/hora de inicio si cambió el horario del préstamo.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-editar-ticket-4",
          route: "/tickets",
          selector: '[data-tour="ticket-form-submit"]',
          title: "Guardar cambios",
          description: "Pulsa “Guardar cambios” para actualizar el ticket.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "marcar-ticket-entregado",
    title: "¿Cómo marcar un ticket como entregado?",
    description: "Esto abre el flujo de firmas para cerrar el ticket.",
    flow: {
      title: "Marcar ticket como entregado",
      steps: [
        {
          id: "howto-ticket-entregado-1",
          route: "/tickets",
          selector: '[data-tour="tickets-deliver"]',
          title: "Iniciar cierre del ticket",
          description:
            "Haz clic en “Marcar como entregado” para abrir el diálogo de cierre con firmas.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-ticket-entregado-2",
          route: "/tickets",
          selector: "body",
          title: "Firmas y confirmación",
          description:
            "En el diálogo, revisa los datos, captura las firmas requeridas y confirma la entrega para cerrar el ticket.",
          side: "bottom",
          align: "center",
        },
      ],
    },
  },
];

