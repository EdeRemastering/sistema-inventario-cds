"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { z } from "zod";
import { formDataToObject } from "../../utils/form";
import {
  mantenimientoProgramadoCreateSchema,
  mantenimientoProgramadoUpdateSchema,
  mantenimientoRealizadoCreateSchema,
  mantenimientoRealizadoUpdateSchema,
} from "./validations";
import {
  createMantenimientoProgramado,
  updateMantenimientoProgramado,
  deleteMantenimientoProgramado,
  createMantenimientoRealizado,
  updateMantenimientoRealizado,
  updateMantenimientosRealizadosByElemento,
  deleteMantenimientoRealizado,
  countMantenimientosPendientes,
  updateEstadoMantenimiento,
  getMantenimientoProgramado,
} from "./services";
import { logAction } from "../../lib/audit-logger";
import { authOptions } from "@/lib/auth";
import {
  SEMANAS_KEYS,
  getDateFromWeekKey,
  getWeekLabel,
  isWeekProgrammed,
} from "../../lib/mantenimientos-semanas";

/**
 * Normaliza el nombre del usuario autenticado para usarlo como "responsable".
 * Importante: esto se calcula en el servidor para evitar que el cliente lo manipule.
 */
function getResponsableFromSession(session: Session | null): string {
  // `nombre`/`apellido` son campos extendidos en nuestra sesión (module augmentation).
  const nombre = (session?.user as any)?.nombre ?? "";
  const apellido = (session?.user as any)?.apellido ?? "";
  const full = `${nombre} ${apellido}`.trim();
  return full || session?.user?.name || (session?.user as any)?.username || "";
}

// Actions para Mantenimientos Programados
export async function actionCreateMantenimientoProgramado(formData: FormData) {
  const parsed = mantenimientoProgramadoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const createData = {
    ...parsed.data,
    observaciones: parsed.data.observaciones ?? null,
  };

  const mantenimiento = await createMantenimientoProgramado(createData);
  await logAction({
    action: "CREATE",
    entity: "mantenimiento_programado",
    entityId: mantenimiento.id,
    details: `Mantenimiento programado creado para elemento ${parsed.data.elemento_id}`,
  });
  revalidatePath("/mantenimientos");
}

export async function actionUpdateMantenimientoProgramado(formData: FormData) {
  const parsed = mantenimientoProgramadoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const updateData = {
    ...parsed.data,
    observaciones: parsed.data.observaciones ?? null,
  };

  await updateMantenimientoProgramado(parsed.data.id!, updateData);
  await logAction({
    action: "UPDATE",
    entity: "mantenimiento_programado",
    entityId: parsed.data.id,
    details: `Mantenimiento programado actualizado: ${parsed.data.id}`,
  });
  revalidatePath("/mantenimientos");
}

export async function actionDeleteMantenimientoProgramado(id: number) {
  await deleteMantenimientoProgramado(id);
  await logAction({
    action: "DELETE",
    entity: "mantenimiento_programado",
    entityId: id,
    details: `Mantenimiento programado eliminado: ${id}`,
  });
  revalidatePath("/mantenimientos");
}

// Actions para Mantenimientos Realizados
export async function actionCreateMantenimientoRealizado(formData: FormData) {
  const parsed = mantenimientoRealizadoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const session = await getServerSession(authOptions);
  const responsableFromSession = getResponsableFromSession(session);

  const createData = {
    ...parsed.data,
    programacion_id: parsed.data.programacion_id === "" ? null : (parsed.data.programacion_id ?? null),
    averias_encontradas: parsed.data.averias_encontradas ?? null,
    repuestos_utilizados: parsed.data.repuestos_utilizados ?? null,
    costo: parsed.data.costo === "" ? null : (parsed.data.costo ?? null),
    // Fuerza el responsable como el usuario autenticado (evita manipulación del formulario).
    responsable: responsableFromSession || String(parsed.data.responsable ?? "").trim(),
    creado_por: session?.user?.username ?? parsed.data.creado_por ?? null,
  };

  if (!createData.responsable) {
    throw new Error("No se pudo determinar el responsable (sesión no disponible).");
  }

  const mantenimiento = await createMantenimientoRealizado(createData);
  await logAction({
    action: "CREATE",
    entity: "mantenimiento_realizado",
    entityId: mantenimiento.id,
    details: `Mantenimiento realizado creado para elemento ${parsed.data.elemento_id}`,
  });
  revalidatePath("/mantenimientos");
}

export async function actionUpdateMantenimientoRealizado(formData: FormData) {
  const parsed = mantenimientoRealizadoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const updateData = {
    ...parsed.data,
    programacion_id: parsed.data.programacion_id === "" ? null : (parsed.data.programacion_id ?? null),
    averias_encontradas: parsed.data.averias_encontradas ?? null,
    repuestos_utilizados: parsed.data.repuestos_utilizados ?? null,
    costo: parsed.data.costo === "" ? null : (parsed.data.costo ?? null),
    creado_por: parsed.data.creado_por ?? null,
  };

  await updateMantenimientoRealizado(parsed.data.id!, updateData);
  await logAction({
    action: "UPDATE",
    entity: "mantenimiento_realizado",
    entityId: parsed.data.id,
    details: `Mantenimiento realizado actualizado: ${parsed.data.id}`,
  });
  revalidatePath("/mantenimientos");
}

export async function actionDeleteMantenimientoRealizado(id: number) {
  await deleteMantenimientoRealizado(id);
  await logAction({
    action: "DELETE",
    entity: "mantenimiento_realizado",
    entityId: id,
    details: `Mantenimiento realizado eliminado: ${id}`,
  });
  revalidatePath("/mantenimientos");
}

const bulkUpdateRealizadosByElementoSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "PREDICTIVO"]),
  responsable: z.string().max(100).optional().or(z.literal("")),
});

/**
 * Aplica el mismo tipo (y opcionalmente responsable) a todos los mantenimientos
 * realizados de un mismo equipo. Útil para pasar de preventivo a correctivo en bloque.
 */
export async function actionBulkUpdateMantenimientosRealizadosByElemento(
  formData: FormData
) {
  const parsed = bulkUpdateRealizadosByElementoSchema.safeParse(
    formDataToObject(formData)
  );
  if (!parsed.success) throw new Error("Datos inválidos");

  const { elemento_id, tipo, responsable } = parsed.data;
  const { updated } = await updateMantenimientosRealizadosByElemento(elemento_id, {
    tipo,
    ...(responsable !== undefined && responsable !== "" && { responsable }),
  });

  await logAction({
    action: "UPDATE",
    entity: "mantenimiento_realizado",
    entityId: elemento_id,
    details: `Actualización masiva: ${updated} mantenimiento(s) del elemento ${elemento_id} → tipo ${tipo}`,
  });
  revalidatePath("/mantenimientos");
}

// Obtener conteo de mantenimientos pendientes
export async function actionGetMantenimientosPendientes(): Promise<number> {
  return countMantenimientosPendientes();
}

// Cambiar estado de mantenimiento (acción rápida: aplazado, cancelado, restaurar pendiente)
export async function actionCambiarEstadoMantenimiento(
  id: number,
  estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO"
) {
  await updateEstadoMantenimiento(id, estado);
  await logAction({
    action: "UPDATE",
    entity: "mantenimiento_programado",
    entityId: id,
    details: `Estado de mantenimiento cambiado a: ${estado}`,
  });
  revalidatePath("/mantenimientos");
  revalidatePath("/cronograma");
}

/**
 * Marcar UNA semana concreta de una programación como ejecutada.
 * Crea un registro en mantenimientos_realizados para esa semana y NO cambia el estado de toda la programación.
 */
export async function actionMarcarSemanaComoRealizada(
  programacionId: number,
  weekKey: string
) {
  if (!SEMANAS_KEYS.includes(weekKey)) {
    throw new Error("Semana no válida");
  }

  const programacion = await getMantenimientoProgramado(programacionId);
  if (!programacion) {
    throw new Error("Programación no encontrada");
  }

  if (!isWeekProgrammed(programacion as unknown as Record<string, unknown>, weekKey)) {
    throw new Error("Esa semana no está programada para este mantenimiento");
  }

  const session = await getServerSession(authOptions);
  const responsable = getResponsableFromSession(session);
  const fecha = getDateFromWeekKey(weekKey, programacion.año);
  const descripcion = `Mantenimiento programado - ${getWeekLabel(weekKey)}`;

  await createMantenimientoRealizado({
    elemento_id: programacion.elemento_id,
    programacion_id: programacionId,
    fecha_mantenimiento: fecha,
    tipo: "PREVENTIVO",
    descripcion,
    responsable: responsable || "Sistema",
    averias_encontradas: null,
    repuestos_utilizados: null,
    costo: null,
    creado_por: (session?.user as { username?: string })?.username ?? null,
  });

  await logAction({
    action: "CREATE",
    entity: "mantenimiento_realizado",
    entityId: programacionId,
    details: `Semana ${getWeekLabel(weekKey)} marcada como ejecutada para elemento ${programacion.elemento_id}`,
  });

  revalidatePath("/mantenimientos");
  revalidatePath("/cronograma");
  revalidatePath("/kpis/mantenimientos");
}

