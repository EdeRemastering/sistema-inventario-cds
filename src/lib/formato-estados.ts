/**
 * Mapeo de códigos de estado (B, D, I, FS, etc.) a nombres legibles.
 * Usar en reportes, detalles de elementos y cualquier vista que muestre estado.
 */
export const ESTADO_LABELS: Record<string, string> = {
  B: "Bueno",
  D: "Deficiente",
  I: "Inservible",
  FS: "Fuera de Servicio",
  O: "Óptimo",
  R: "Regular",
  OB: "Óptimo Bueno",
};

/**
 * Formatea un código de estado a su nombre legible.
 */
export function fmtEstado(codigo?: string | null): string {
  if (!codigo) return "—";
  return ESTADO_LABELS[codigo] ?? codigo;
}
