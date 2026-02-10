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
import { getDateFromWeekKey, getWeekLabel } from "../../lib/mantenimientos-semanas";
import type {
  CreateMantenimientoProgramadoInput,
  UpdateMantenimientoProgramadoInput,
} from "./types";
import { prisma } from "../../lib/prisma";

const SEMANAS_KEYS = [
  "enero_semana1", "enero_semana2", "enero_semana3", "enero_semana4",
  "febrero_semana1", "febrero_semana2", "febrero_semana3", "febrero_semana4",
  "marzo_semana1", "marzo_semana2", "marzo_semana3", "marzo_semana4",
  "abril_semana1", "abril_semana2", "abril_semana3", "abril_semana4",
  "mayo_semana1", "mayo_semana2", "mayo_semana3", "mayo_semana4",
  "junio_semana1", "junio_semana2", "junio_semana3", "junio_semana4",
  "julio_semana1", "julio_semana2", "julio_semana3", "julio_semana4",
  "agosto_semana1", "agosto_semana2", "agosto_semana3", "agosto_semana4",
  "septiembre_semana1", "septiembre_semana2", "septiembre_semana3", "septiembre_semana4",
  "octubre_semana1", "octubre_semana2", "octubre_semana3", "octubre_semana4",
  "noviembre_semana1", "noviembre_semana2", "noviembre_semana3", "noviembre_semana4",
  "diciembre_semana1", "diciembre_semana2", "diciembre_semana3", "diciembre_semana4",
] as const;

const cronogramaSetSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  año: z.coerce.number().int().min(2020).max(2100),
  frecuencia: z.enum(["DIARIO", "SEMANAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).optional(),
  tipos_semana: z.string().optional(),
  observaciones: z.string().optional(),
  enero_semana1: z.coerce.boolean().optional(),
  enero_semana2: z.coerce.boolean().optional(),
  enero_semana3: z.coerce.boolean().optional(),
  enero_semana4: z.coerce.boolean().optional(),
  febrero_semana1: z.coerce.boolean().optional(),
  febrero_semana2: z.coerce.boolean().optional(),
  febrero_semana3: z.coerce.boolean().optional(),
  febrero_semana4: z.coerce.boolean().optional(),
  marzo_semana1: z.coerce.boolean().optional(),
  marzo_semana2: z.coerce.boolean().optional(),
  marzo_semana3: z.coerce.boolean().optional(),
  marzo_semana4: z.coerce.boolean().optional(),
  abril_semana1: z.coerce.boolean().optional(),
  abril_semana2: z.coerce.boolean().optional(),
  abril_semana3: z.coerce.boolean().optional(),
  abril_semana4: z.coerce.boolean().optional(),
  mayo_semana1: z.coerce.boolean().optional(),
  mayo_semana2: z.coerce.boolean().optional(),
  mayo_semana3: z.coerce.boolean().optional(),
  mayo_semana4: z.coerce.boolean().optional(),
  junio_semana1: z.coerce.boolean().optional(),
  junio_semana2: z.coerce.boolean().optional(),
  junio_semana3: z.coerce.boolean().optional(),
  junio_semana4: z.coerce.boolean().optional(),
  julio_semana1: z.coerce.boolean().optional(),
  julio_semana2: z.coerce.boolean().optional(),
  julio_semana3: z.coerce.boolean().optional(),
  julio_semana4: z.coerce.boolean().optional(),
  agosto_semana1: z.coerce.boolean().optional(),
  agosto_semana2: z.coerce.boolean().optional(),
  agosto_semana3: z.coerce.boolean().optional(),
  agosto_semana4: z.coerce.boolean().optional(),
  septiembre_semana1: z.coerce.boolean().optional(),
  septiembre_semana2: z.coerce.boolean().optional(),
  septiembre_semana3: z.coerce.boolean().optional(),
  septiembre_semana4: z.coerce.boolean().optional(),
  octubre_semana1: z.coerce.boolean().optional(),
  octubre_semana2: z.coerce.boolean().optional(),
  octubre_semana3: z.coerce.boolean().optional(),
  octubre_semana4: z.coerce.boolean().optional(),
  noviembre_semana1: z.coerce.boolean().optional(),
  noviembre_semana2: z.coerce.boolean().optional(),
  noviembre_semana3: z.coerce.boolean().optional(),
  noviembre_semana4: z.coerce.boolean().optional(),
  diciembre_semana1: z.coerce.boolean().optional(),
  diciembre_semana2: z.coerce.boolean().optional(),
  diciembre_semana3: z.coerce.boolean().optional(),
  diciembre_semana4: z.coerce.boolean().optional(),
});

function getResponsableFromSession(session: Session | null): string {
  const nombre = (session?.user as { nombre?: string })?.nombre ?? "";
  const apellido = (session?.user as { apellido?: string })?.apellido ?? "";
  const full = `${nombre} ${apellido}`.trim();
  return full || session?.user?.name || (session?.user as { username?: string })?.username || "";
}

export async function actionCreateMantenimientoProgramado(formData: FormData) {
  const parsed = mantenimientoProgramadoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const session = await getServerSession(authOptions);
  const responsable = getResponsableFromSession(session) || "Sistema";

  const createData: CreateMantenimientoProgramadoInput = {
    elemento_id: parsed.data.elemento_id,
    fecha_mantenimiento: parsed.data.fecha_mantenimiento,
    tipo: parsed.data.tipo,
    descripcion: parsed.data.descripcion,
    averias_encontradas: parsed.data.averias_encontradas ?? null,
    repuestos_utilizados: parsed.data.repuestos_utilizados ?? null,
    responsable,
    costo: parsed.data.costo === "" ? null : (parsed.data.costo ?? null),
    estado: parsed.data.estado ?? "PENDIENTE",
    observaciones: parsed.data.observaciones ?? null,
    creado_por: (session?.user as { username?: string })?.username ?? null,
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

  const updateData: UpdateMantenimientoProgramadoInput = {
    ...(parsed.data.elemento_id !== undefined && { elemento_id: parsed.data.elemento_id }),
    ...(parsed.data.fecha_mantenimiento !== undefined && { fecha_mantenimiento: parsed.data.fecha_mantenimiento }),
    ...(parsed.data.tipo !== undefined && { tipo: parsed.data.tipo }),
    ...(parsed.data.descripcion !== undefined && { descripcion: parsed.data.descripcion }),
    ...(parsed.data.averias_encontradas !== undefined && { averias_encontradas: parsed.data.averias_encontradas ?? null }),
    ...(parsed.data.repuestos_utilizados !== undefined && { repuestos_utilizados: parsed.data.repuestos_utilizados ?? null }),
    ...(parsed.data.responsable !== undefined && parsed.data.responsable !== "" && { responsable: parsed.data.responsable }),
    ...(parsed.data.costo !== undefined && { costo: parsed.data.costo === "" ? null : parsed.data.costo }),
    ...(parsed.data.estado !== undefined && { estado: parsed.data.estado }),
    ...(parsed.data.observaciones !== undefined && { observaciones: parsed.data.observaciones ?? null }),
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

export async function actionSetCronogramaElementoYear(formData: FormData) {
  const parsed = cronogramaSetSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  let tiposSemana: Record<string, string> = {};
  if (parsed.data.tipos_semana) {
    try {
      tiposSemana = JSON.parse(parsed.data.tipos_semana) ?? {};
    } catch {
      tiposSemana = {};
    }
  }

  const weekKeys = SEMANAS_KEYS.filter((k) => (parsed.data as Record<string, unknown>)[k] === true);

  const start = new Date(parsed.data.año, 0, 1);
  const end = new Date(parsed.data.año, 11, 31);

  await prisma.mantenimientos_programados.deleteMany({
    where: {
      elemento_id: parsed.data.elemento_id,
      fecha_mantenimiento: { gte: start, lte: end },
    },
  });

  const session = await getServerSession(authOptions);
  const responsable = getResponsableFromSession(session) || "Sistema";
  let firstId: number | null = null;

  for (const weekKey of weekKeys) {
    const tipo =
      (tiposSemana[weekKey] as "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO" | undefined) ||
      "PREVENTIVO";
    const fecha = getDateFromWeekKey(weekKey, parsed.data.año);
    const created = await createMantenimientoProgramado({
      elemento_id: parsed.data.elemento_id,
      fecha_mantenimiento: fecha,
      tipo,
      descripcion: `Mantenimiento programado - ${getWeekLabel(weekKey)}`,
      averias_encontradas: null,
      repuestos_utilizados: null,
      responsable,
      costo: null,
      estado: "PENDIENTE",
      observaciones: parsed.data.observaciones ?? null,
      creado_por: (session?.user as { username?: string })?.username ?? null,
    });
    if (firstId == null) firstId = created.id;
  }

  await logAction({
    action: "UPDATE",
    entity: "mantenimiento_programado",
    entityId: firstId ?? 0,
    details: `Cronograma reemplazado: ${weekKeys.length} mantenimiento(s) para elemento ${parsed.data.elemento_id} (año ${parsed.data.año})`,
  });

  revalidatePath("/mantenimientos");
  revalidatePath("/cronograma");
  revalidatePath("/kpis/mantenimientos");
}

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
    responsable: responsableFromSession || String(parsed.data.responsable ?? "").trim(),
    creado_por: (session?.user as { username?: string })?.username ?? parsed.data.creado_por ?? null,
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

export async function actionBulkUpdateMantenimientosRealizadosByElemento(formData: FormData) {
  const parsed = bulkUpdateRealizadosByElementoSchema.safeParse(formDataToObject(formData));
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

export async function actionGetMantenimientosPendientes(): Promise<number> {
  return countMantenimientosPendientes();
}

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

export async function actionMarcarSemanaComoRealizada(programacionId: number, weekKey: string) {
  const programacion = await getMantenimientoProgramado(programacionId);
  if (!programacion) {
    throw new Error("Programación no encontrada");
  }

  const session = await getServerSession(authOptions);
  const responsable = getResponsableFromSession(session);
  const descripcion = `Mantenimiento programado - ${getWeekLabel(weekKey)}`;

  await createMantenimientoRealizado({
    elemento_id: programacion.elemento_id,
    programacion_id: programacionId,
    fecha_mantenimiento: programacion.fecha_mantenimiento,
    tipo: programacion.tipo,
    descripcion,
    responsable: responsable || "Sistema",
    averias_encontradas: null,
    repuestos_utilizados: null,
    costo: null,
    creado_por: (session?.user as { username?: string })?.username ?? null,
  });

  await updateEstadoMantenimiento(programacionId, "REALIZADO");

  await logAction({
    action: "CREATE",
    entity: "mantenimiento_realizado",
    entityId: programacionId,
    details: `Mantenimiento marcado como ejecutado para elemento ${programacion.elemento_id}`,
  });

  revalidatePath("/mantenimientos");
  revalidatePath("/cronograma");
  revalidatePath("/kpis/mantenimientos");
}
