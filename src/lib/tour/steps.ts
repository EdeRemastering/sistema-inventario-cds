export type AppTourStep = {
  id: string;
  route: string;
  selector: string; // CSS selector (prefer data-tour)
  title: string;
  description: string;
  /**
   * Acción opcional antes de mostrar el step.
   * Útil para abrir un modal (ej: click en "Crear") antes de resaltar campos del formulario.
   */
  beforeClickSelector?: string;
  /**
   * Si el step pide "haz clic en X", podemos avanzar automáticamente
   * cuando el usuario haga clic en el elemento objetivo.
   *
   * Importante: úsalo solo en pasos cuyo objetivo sea un botón/acción,
   * no en inputs donde el usuario debe escribir.
   */
  autoAdvanceOnClick?: boolean;
  /**
   * Selector alternativo para detectar el click (si `selector` resalta un contenedor).
   * Ej: resaltar fila completa, pero detectar click en el botón interno.
   */
  autoAdvanceClickSelector?: string;
  /**
   * Avanza automáticamente cuando un elemento desaparece del DOM.
   * Útil para pasos finales como "Guardar" donde el modal se cierra al éxito.
   */
  autoAdvanceOnGone?: boolean;
  /**
   * Selector del elemento cuya desaparición dispara el avance.
   * Si no se provee, se usa `selector`.
   */
  autoAdvanceGoneSelector?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

/**
 * Tour general de la app (desactivado).
 *
 * Dejamos el arreglo vacío para que no exista un recorrido
 * global que encadene todos los módulos. Solo se usan los
 * flujos específicos por módulo lanzados desde `/tutorial`.
 */
export const APP_TOUR_STEPS: AppTourStep[] = [];

