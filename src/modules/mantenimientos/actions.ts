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
import type {
  CreateMantenimientoProgramadoInput,
  UpdateMantenimientoProgramadoInput,
} from "./types";
import { prisma } from "../../lib/prisma";

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

  // Parsear tipos_semana plano (weekKey -> tipo) desde el formulario, si viene
  let tiposPlano: Record<string, string> | null = null;
  if (parsed.data.tipos_semana) {
    try {
      tiposPlano = JSON.parse(parsed.data.tipos_semana);
    } catch {
      tiposPlano = null;
    }
  }

  // Construir JSON completo por semana: programado + estado + tipo
  const semanas: Record<
    string,
    {
      programado: boolean;
      estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO";
      tipo: "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO";
    }
  > = {};

  // Y en paralelo, los booleanos (enero_semana1, ...) para la tabla
  const booleanWeeks: Partial<CreateMantenimientoProgramadoInput> = {};

  for (const weekKey of SEMANAS_KEYS) {
    const programado = (parsed.data as any)[weekKey] === true;
    (booleanWeeks as any)[weekKey] = programado;
    if (!programado) continue;

    const tipo =
      (tiposPlano?.[weekKey] as "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO" | undefined) ||
      "PREVENTIVO";
    semanas[weekKey] = {
      programado: true,
      estado: parsed.data.estado ?? "PENDIENTE",
      tipo,
    };
  }

  const createData: CreateMantenimientoProgramadoInput = {
    elemento_id: parsed.data.elemento_id,
    frecuencia: parsed.data.frecuencia,
    año: parsed.data.año,
    ...(booleanWeeks as any),
    tipos_semana: semanas,
    estado: parsed.data.estado ?? "PENDIENTE",
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

  // Parsear tipos_semana plano (weekKey -> tipo) desde el formulario, si viene
  let tiposPlano: Record<string, string> | null = null;
  if (parsed.data.tipos_semana) {
    try {
      tiposPlano = JSON.parse(parsed.data.tipos_semana);
    } catch {
      tiposPlano = null;
    }
  }

  // Reconstruir JSON por semana a partir de los booleanos enviados
  const semanas: Record<
    string,
    {
      programado: boolean;
      estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO";
      tipo: "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO";
    }
  > = {};

  const booleanWeeks: Partial<UpdateMantenimientoProgramadoInput> = {};

  for (const weekKey of SEMANAS_KEYS) {
    const programado = (parsed.data as any)[weekKey] === true;
    (booleanWeeks as any)[weekKey] = programado;
    if (!programado) continue;
    const tipo =
      (tiposPlano?.[weekKey] as "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO" | undefined) ||
      "PREVENTIVO";
    semanas[weekKey] = {
      programado: true,
      estado: parsed.data.estado ?? "PENDIENTE",
      tipo,
    };
  }

  const updateData: UpdateMantenimientoProgramadoInput = {
    ...(booleanWeeks as any),
    tipos_semana: semanas,
  };

  if (parsed.data.elemento_id !== undefined) {
    updateData.elemento_id = parsed.data.elemento_id;
  }
  if (parsed.data.frecuencia !== undefined) {
    updateData.frecuencia = parsed.data.frecuencia as any;
  }
  if (parsed.data.año !== undefined) {
    updateData.año = parsed.data.año as any;
  }
  if (parsed.data.estado !== undefined) {
    updateData.estado = parsed.data.estado as any;
  }
  if (parsed.data.observaciones !== undefined) {
    updateData.observaciones = parsed.data.observaciones ?? null;
  }

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

/**
 * Reemplaza TODO el cronograma de un elemento en un año:
 * - borra programados existentes de ese elemento/año
 * - crea 1 registro por cada semana marcada (mantenimiento independiente)
 *
 * Se usa desde el Cronograma (pintar semanas).
 */
export async function actionSetCronogramaElementoYear(formData: FormData) {
  const parsed = mantenimientoProgramadoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  // Parsear tipos_semana de string JSON a objeto
  let tiposSemana: Record<string, string> | null = null;
  if (parsed.data.tipos_semana) {
    try {
      tiposSemana = JSON.parse(parsed.data.tipos_semana);
    } catch {
      tiposSemana = null;
    }
  }

  const weekKeys = Object.entries(parsed.data)
    .filter(([k, v]) => k.includes("_semana") && v === true)
    .map(([k]) => k);

  // Reemplazar: borrar todo lo anterior del elemento/año
  await prisma.mantenimientos_programados.deleteMany({
    where: {
      elemento_id: parsed.data.elemento_id,
      año: parsed.data.año,
    },
  });

  // Si no se marcaron semanas, simplemente queda "vacío" (cronograma eliminado)
  let firstId: number | null = null;
  for (const weekKey of weekKeys) {
    const tipo =
      (tiposSemana?.[weekKey] as "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO" | undefined) ||
      "PREVENTIVO";
    const created = await createMantenimientoProgramado({
      elemento_id: parsed.data.elemento_id,
      frecuencia: parsed.data.frecuencia,
      año: parsed.data.año,
      [weekKey]: true,
      tipos_semana: { [weekKey]: tipo },
      estado: "PENDIENTE",
      observaciones: parsed.data.observaciones ?? null,
    } as any);
    if (firstId == null) firstId = created.id;
  }

  await logAction({
    action: "UPDATE",
    entity: "mantenimiento_programado",
    entityId: firstId ?? 0,
    details: `Cronograma reemplazado: ${weekKeys.length} mantenimiento(s) programado(s) para elemento ${parsed.data.elemento_id} (año ${parsed.data.año})`,
  });

  revalidatePath("/mantenimientos");
  revalidatePath("/cronograma");
  revalidatePath("/kpis/mantenimientos");
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

  let programacion = await getMantenimientoProgramado(programacionId);
  if (!programacion) {
    throw new Error("Programación no encontrada");
  }

  // Si esta programación no tiene esa semana marcada, buscar otra programación
  // del mismo elemento y año que sí tenga esa semana programada.
  if (!isWeekProgrammed(programacion as unknown as Record<string, unknown>, weekKey)) {
    const otras = await prisma.mantenimientos_programados.findMany({
      where: {
        elemento_id: programacion.elemento_id,
        año: programacion.año,
      },
    });

    const candidata = otras.find((p) =>
      isWeekProgrammed(p as unknown as Record<string, unknown>, weekKey)
    );

    if (!candidata) {
      throw new Error("Esa semana no está programada para este mantenimiento");
    }

    programacion = candidata as any;
    programacionId = candidata.id;
  }

  // En este punto TypeScript ya sabe que programacion no es null
  const nonNullProgramacion = programacion!;

  const session = await getServerSession(authOptions);
  const responsable = getResponsableFromSession(session);
  const fecha = getDateFromWeekKey(weekKey, nonNullProgramacion.año);
  const descripcion = `Mantenimiento programado - ${getWeekLabel(weekKey)}`;

  // Determinar el tipo de mantenimiento desde tipos_semana, o PREVENTIVO por defecto
  const tiposSemana = (nonNullProgramacion.tipos_semana as Record<string, string> | null) ?? {};
  // Compatibilidad: soportar tanto mapa plano como objeto por semana
  let tipo: "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO" = "PREVENTIVO";
  const entry = tiposSemana[weekKey] as
    | { tipo?: "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO" }
    | "PREVENTIVO"
    | "CORRECTIVO"
    | "PREDICTIVO"
    | undefined;
  if (entry && typeof entry === "object" && "tipo" in entry && entry.tipo) {
    tipo = entry.tipo;
  } else if (typeof entry === "string") {
    tipo = entry as any;
  }

  await createMantenimientoRealizado({
    elemento_id: nonNullProgramacion.elemento_id,
    programacion_id: programacionId,
    fecha_mantenimiento: fecha,
    tipo,
    descripcion,
    responsable: responsable || "Sistema",
    averias_encontradas: null,
    repuestos_utilizados: null,
    costo: null,
    creado_por: (session?.user as { username?: string })?.username ?? null,
  });

  // Actualizar el JSON de tipos_semana para reflejar que esta semana está ejecutada
  const tiposSemanaFull =
    (nonNullProgramacion.tipos_semana as Record<
      string,
      { programado?: boolean; estado?: string; tipo?: string }
    > | null) ?? {};
  const prev = tiposSemanaFull[weekKey] || {};
  tiposSemanaFull[weekKey] = {
    programado: true,
    tipo,
    estado: "REALIZADO",
  };
  await prisma.mantenimientos_programados.update({
    where: { id: programacionId },
    data: { tipos_semana: tiposSemanaFull },
  });

  await logAction({
    action: "CREATE",
    entity: "mantenimiento_realizado",
    entityId: programacionId,
    details: `Semana ${getWeekLabel(weekKey)} marcada como ejecutada para elemento ${nonNullProgramacion.elemento_id}`,
  });

  revalidatePath("/mantenimientos");
  revalidatePath("/cronograma");
  revalidatePath("/kpis/mantenimientos");
}

