/**
 * Utilidades para semanas de mantenimientos programados (enero_semana1, ... diciembre_semana4).
 * Usado para listar semanas programadas y marcar una semana concreta como ejecutada.
 */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

export const SEMANAS_KEYS: string[] = [];
for (let mes = 0; mes < 12; mes++) {
  for (let s = 1; s <= 4; s++) {
    SEMANAS_KEYS.push(`${MESES[mes]}_semana${s}`);
  }
}

/** Obtiene la etiqueta legible para una semana (ej: "Enero - Semana 1"). */
export function getWeekLabel(weekKey: string): string {
  const [mes, semana] = weekKey.split("_semana");
  const mesCapitalizado = mes ? mes.charAt(0).toUpperCase() + mes.slice(1) : "";
  return `${mesCapitalizado} - Semana ${semana || ""}`;
}

/** Dado un weekKey (ej: "enero_semana1") y un año, devuelve el primer día de esa semana (día 1, 8, 15 o 22 del mes). */
export function getDateFromWeekKey(weekKey: string, año: number): Date {
  const [mesStr, semanaStr] = weekKey.split("_semana");
  const mesIdx = MESES.indexOf(mesStr as (typeof MESES)[number]);
  const semanaNum = parseInt(semanaStr || "1", 10);
  if (mesIdx < 0 || semanaNum < 1 || semanaNum > 4) {
    return new Date(año, 0, 1);
  }
  const day = (semanaNum - 1) * 7 + 1;
  return new Date(año, mesIdx, day);
}

/** Dado una fecha, devuelve el weekKey correspondiente (ej: "enero_semana1"). */
export function getWeekKeyFromDate(date: Date): string {
  const mesIdx = date.getMonth();
  const day = date.getDate();
  const semanaNum = Math.min(4, Math.floor((day - 1) / 7) + 1);
  return `${MESES[mesIdx]}_semana${semanaNum}`;
}

/** Indica si un programado tiene una semana concreta marcada (el boolean es true). */
export function isWeekProgrammed(programado: Record<string, unknown>, weekKey: string): boolean {
  return programado[weekKey] === true;
}
