import type { TutorialItem } from "../types";

export const USUARIOS_ITEMS: TutorialItem[] = [
  {
    id: "usuarios",
    title: "¿Cómo crear/editar usuarios y firma?",
    description:
      "Ve a Usuarios para administrar cuentas, nombre/apellido y firma (R2).",
    flow: {
      title: "Crear usuario",
      steps: [
        {
          id: "howto-crear-usuario-1",
          route: "/usuarios",
          selector: '[data-tour="usuarios-create-button"]',
          title: "Abrir el formulario",
          description: "Haz clic en “Nuevo usuario” para abrir el formulario en un modal.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-crear-usuario-2",
          route: "/usuarios",
          selector: '[data-tour="usuario-form-username"]',
          title: "Usuario y contraseña",
          description: "Define el usuario (ej: juan.perez) y una contraseña segura.",
          beforeClickSelector: '[data-tour="usuarios-create-button"]',
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-usuario-3",
          route: "/usuarios",
          selector: '[data-tour="usuario-form-nombre"]',
          title: "Nombre y apellido",
          description: "Escribe el nombre y apellido del usuario.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-usuario-4",
          route: "/usuarios",
          selector: '[data-tour="usuario-form-firma"]',
          title: "Firma",
          description:
            "Dibuja la firma. Se guardará en R2 y se usará para tickets/mantenimientos.",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-usuario-5",
          route: "/usuarios",
          selector: '[data-tour="usuario-form-rol"]',
          title: "Rol",
          description: "Selecciona el rol (Usuario o Administrador).",
          side: "bottom",
          align: "start",
        },
        {
          id: "howto-crear-usuario-6",
          route: "/usuarios",
          selector: '[data-tour="usuario-form-submit"]',
          title: "Guardar",
          description: "Pulsa “Crear” para guardar el usuario.",
          autoAdvanceOnGone: true,
          autoAdvanceGoneSelector: '[data-tour="usuario-form"]',
          side: "top",
          align: "end",
        },
        {
          id: "howto-crear-usuario-7",
          route: "/usuarios",
          selector: '[data-tour="page-title"]',
          title: "Verificación",
          description:
            "Verifica que el usuario aparezca en la lista. Si no lo ves, usa el buscador.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
  {
    id: "eliminar-usuario",
    title: "¿Cómo eliminar un usuario?",
    description: "En la lista, usa Eliminar (con confirmación).",
    flow: {
      title: "Eliminar usuario",
      steps: [
        {
          id: "howto-eliminar-usuario-1",
          route: "/usuarios",
          selector: '[data-tour="usuarios-delete-first-trigger"]',
          title: "Iniciar eliminación",
          description: "Haz clic en “Eliminar” para abrir la confirmación.",
          autoAdvanceOnClick: true,
          side: "left",
          align: "end",
        },
        {
          id: "howto-eliminar-usuario-2",
          route: "/usuarios",
          selector: '[data-tour="usuarios-delete-first-confirm"]',
          title: "Confirmar",
          description: "Pulsa “Sí, eliminar” para confirmar.",
          autoAdvanceOnClick: true,
          side: "top",
          align: "end",
        },
        {
          id: "howto-eliminar-usuario-3",
          route: "/usuarios",
          selector: '[data-tour="page-title"]',
          title: "Listo",
          description: "El usuario fue eliminado.",
          side: "bottom",
          align: "start",
        },
      ],
    },
  },
];

