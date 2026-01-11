"use server";

import { revalidatePath } from "next/cache";
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
  deleteMantenimientoRealizado,
  countMantenimientosPendientes,
  updateEstadoMantenimiento,
} from "./services";
import { logAction } from "../../lib/audit-logger";

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

  const createData = {
    ...parsed.data,
    programacion_id: parsed.data.programacion_id === "" ? null : (parsed.data.programacion_id ?? null),
    averias_encontradas: parsed.data.averias_encontradas ?? null,
    repuestos_utilizados: parsed.data.repuestos_utilizados ?? null,
    costo: parsed.data.costo === "" ? null : (parsed.data.costo ?? null),
    creado_por: parsed.data.creado_por ?? null,
  };

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

// Obtener conteo de mantenimientos pendientes
export async function actionGetMantenimientosPendientes(): Promise<number> {
  return countMantenimientosPendientes();
}

// Cambiar estado de mantenimiento (acción rápida)
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

