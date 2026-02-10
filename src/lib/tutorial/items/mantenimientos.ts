import type { TutorialItem } from "../types";

export const MANTENIMIENTOS_ITEMS: TutorialItem[] = [
  {
    id: "mantenimientos",
    title: "¿Cómo gestionar mantenimientos (programados y ejecutados)?",
    description:
      "Ve a Mantenimientos y usa las pestañas para programar, ejecutar y ver la semana.",
    flow: {
      title: "Visión general de mantenimientos",
      steps: [
        {
          id: "howto-mantenimientos-tabs-1",
          route: "/mantenimientos",
          selector: '[data-tour="mantenimientos-tabs"]',
          title: "Pestañas principales",
          description:
            "Desde aquí navegas entre Semana, Programados, Ejecutados y Cronograma para gestionar los mantenimientos.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
  {
    id: "mantenimiento-programado-crear",
    title: "¿Cómo programar un mantenimiento?",
    description:
      "En la pestaña Programados, crea una programación asociada a un equipo.",
    flow: {
      title: "Programar mantenimiento",
      steps: [
        {
          id: "howto-mantenimiento-programado-1",
          route: "/mantenimientos?tab=programados",
          selector: '[data-tour="mantenimientos-programados-create"]',
          title: "Abrir el formulario de programado",
          description:
            "En la pestaña Programados, haz clic en el botón para crear un mantenimiento programado.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-mantenimiento-programado-2",
          route: "/mantenimientos?tab=programados",
          selector: '[data-tour="mantenimientos-programados-create"]',
          title: "Seleccionar equipo y ubicación",
          description:
            "En el formulario, selecciona el elemento (equipo), su sede y ubicación donde se realizará el mantenimiento.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-mantenimiento-programado-3",
          route: "/mantenimientos?tab=programados",
          selector: '[data-tour="mantenimientos-programados-create"]',
          title: "Definir frecuencia y año",
          description:
            "Configura la frecuencia (mensual, trimestral, etc.) y el año para generar el plan de semanas.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-mantenimiento-programado-4",
          route: "/mantenimientos?tab=programados",
          selector: '[data-tour="mantenimientos-programados-create"]',
          title: "Guardar programación",
          description:
            "Pulsa el botón de guardar del formulario para crear la programación.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
  {
    id: "mantenimiento-programado-marcar-realizado",
    title: "¿Cómo marcar un mantenimiento programado como realizado?",
    description:
      "Marca la semana ejecutada desde la pestaña Programados cuando completes un mantenimiento.",
    flow: {
      title: "Marcar semana como ejecutada",
      steps: [
        {
          id: "howto-mantenimiento-programado-realizado-1",
          route: "/mantenimientos?tab=programados",
          selector: '[data-tour="mantenimientos-programados-marcar-realizado"]',
          title: "Abrir el diálogo de semana realizada",
          description:
            "En la tabla de Programados, haz clic en el ícono de check del primer registro para marcar una semana como ejecutada.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-mantenimiento-programado-realizado-2",
          route: "/mantenimientos?tab=programados",
          selector: "body",
          title: "Elegir la semana ejecutada",
          description:
            "En el diálogo, selecciona la semana que realmente se ejecutó y confirma para registrar el mantenimiento realizado.",
          side: "bottom",
          align: "center",
        },
      ],
    },
  },
  {
    id: "mantenimiento-ejecutado-crear",
    title: "¿Cómo registrar un mantenimiento ejecutado directamente?",
    description:
      "En la pestaña Ejecutados, crea un registro cuando ya tienes un mantenimiento realizado.",
    flow: {
      title: "Crear mantenimiento realizado",
      steps: [
        {
          id: "howto-mantenimiento-realizado-1",
          route: "/mantenimientos?tab=realizados",
          selector: '[data-tour="mantenimientos-realizados-create"]',
          title: "Abrir el formulario de realizado",
          description:
            "En la pestaña Ejecutados, haz clic en el botón para crear un mantenimiento realizado.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-mantenimiento-realizado-2",
          route: "/mantenimientos?tab=realizados",
          selector: '[data-tour="mantenimientos-realizados-create"]',
          title: "Seleccionar equipo y tipo",
          description:
            "En el formulario, selecciona el equipo, define el tipo (preventivo, correctivo, etc.) y la fecha de ejecución.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-mantenimiento-realizado-3",
          route: "/mantenimientos?tab=realizados",
          selector: '[data-tour="mantenimientos-realizados-create"]',
          title: "Responsable y costo",
          description:
            "Registra quién realizó el mantenimiento y, si aplica, el costo asociado.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-mantenimiento-realizado-4",
          route: "/mantenimientos?tab=realizados",
          selector: '[data-tour="mantenimientos-realizados-create"]',
          title: "Guardar el mantenimiento realizado",
          description:
            "Pulsa el botón de guardar del formulario para registrar el mantenimiento ejecutado.",
          side: "top",
          align: "end",
        },
      ],
    },
  },
];

