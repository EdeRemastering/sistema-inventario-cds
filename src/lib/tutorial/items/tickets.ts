import type { TutorialItem } from "../types";

export const TICKETS_ITEMS: TutorialItem[] = [
  {
    id: "crear-ticket",
    title: "¿Cómo crear un ticket (préstamo de ubicación)?",
    description:
      "Ve a Tickets y crea un ticket para prestar una ubicación (con firmas).",
    // TODO: convertir a flow completo (abrir modal -> fechas -> ubicación -> solicitante -> firma -> guardar)
    howto: {
      route: "/tickets",
      selector: '[data-tour="tickets-create"]',
      title: "Crear ticket",
      description: "Haz clic aquí para crear un ticket y seleccionar una ubicación.",
      side: "left",
      align: "end",
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
    // TODO: convertir a flow completo (abrir dialog -> firmar -> confirmar -> ver estado Entregado)
    howto: {
      route: "/tickets",
      selector: '[data-tour="tickets-deliver"]',
      title: "Marcar como entregado",
      description: "Haz clic para cerrar el ticket (se solicitarán firmas).",
      side: "left",
      align: "end",
    },
  },
];

