import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  MantenimientoProgramado,
  MantenimientoRealizado,
  CreateMantenimientoProgramadoInput,
  UpdateMantenimientoProgramadoInput,
  CreateMantenimientoRealizadoInput,
  UpdateMantenimientoRealizadoInput,
} from "./types";

/**
 * Mapea CreateMantenimientoProgramadoInput a Prisma.mantenimientos_programadosUncheckedCreateInput
 */
function mapCreateProgramadoInputToPrisma(
  data: CreateMantenimientoProgramadoInput
): Prisma.mantenimientos_programadosUncheckedCreateInput {
  return {
    elemento_id: data.elemento_id,
    frecuencia: data.frecuencia,
    año: data.año,
    tipos_semana: data.tipos_semana ?? Prisma.DbNull,
    estado: data.estado ?? "PENDIENTE",
    observaciones: data.observaciones ?? null,
  };
}

/**
 * Mapea UpdateMantenimientoProgramadoInput a Prisma.mantenimientos_programadosUncheckedUpdateInput
 */
function mapUpdateProgramadoInputToPrisma(
  data: UpdateMantenimientoProgramadoInput
): Prisma.mantenimientos_programadosUncheckedUpdateInput {
  const payload: Prisma.mantenimientos_programadosUncheckedUpdateInput = {};

  if (data.elemento_id !== undefined) payload.elemento_id = data.elemento_id;
  if (data.frecuencia !== undefined) payload.frecuencia = data.frecuencia;
  if (data.año !== undefined) payload.año = data.año;
  if (data.tipos_semana !== undefined) payload.tipos_semana = data.tipos_semana ?? Prisma.DbNull;
  if (data.estado !== undefined) payload.estado = data.estado;
  if (data.observaciones !== undefined) payload.observaciones = data.observaciones ?? null;

  return payload;
}

/**
 * Mapea CreateMantenimientoRealizadoInput a Prisma.mantenimientos_realizadosUncheckedCreateInput
 */
function mapCreateRealizadoInputToPrisma(
  data: CreateMantenimientoRealizadoInput
): Prisma.mantenimientos_realizadosUncheckedCreateInput {
  return {
    elemento_id: data.elemento_id,
    programacion_id: data.programacion_id ?? null,
    fecha_mantenimiento: data.fecha_mantenimiento,
    tipo: data.tipo,
    descripcion: data.descripcion,
    averias_encontradas: data.averias_encontradas ?? null,
    repuestos_utilizados: data.repuestos_utilizados ?? null,
    responsable: data.responsable,
    costo: data.costo ?? null,
    creado_por: data.creado_por ?? null,
  };
}

/**
 * Mapea UpdateMantenimientoRealizadoInput a Prisma.mantenimientos_realizadosUncheckedUpdateInput
 */
function mapUpdateRealizadoInputToPrisma(
  data: UpdateMantenimientoRealizadoInput
): Prisma.mantenimientos_realizadosUncheckedUpdateInput {
  const payload: Prisma.mantenimientos_realizadosUncheckedUpdateInput = {};

  if (data.elemento_id !== undefined) payload.elemento_id = data.elemento_id;
  if (data.programacion_id !== undefined) payload.programacion_id = data.programacion_id ?? null;
  if (data.fecha_mantenimiento !== undefined) payload.fecha_mantenimiento = data.fecha_mantenimiento;
  if (data.tipo !== undefined) payload.tipo = data.tipo;
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
  if (data.averias_encontradas !== undefined) payload.averias_encontradas = data.averias_encontradas ?? null;
  if (data.repuestos_utilizados !== undefined) payload.repuestos_utilizados = data.repuestos_utilizados ?? null;
  if (data.responsable !== undefined) payload.responsable = data.responsable;
  if (data.costo !== undefined) payload.costo = data.costo ?? null;
  if (data.creado_por !== undefined) payload.creado_por = data.creado_por ?? null;

  return payload;
}

// Funciones para Mantenimientos Programados
export function listMantenimientosProgramados(): Promise<MantenimientoProgramado[]> {
  return prisma.mantenimientos_programados.findMany({
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
    orderBy: [{ año: "desc" }, { creado_en: "desc" }],
  }) as Promise<MantenimientoProgramado[]>;
}

export function getMantenimientoProgramado(id: number): Promise<MantenimientoProgramado | null> {
  return prisma.mantenimientos_programados.findUnique({
    where: { id },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
  }) as Promise<MantenimientoProgramado | null>;
}

export function createMantenimientoProgramado(
  data: CreateMantenimientoProgramadoInput
): Promise<MantenimientoProgramado> {
  const payload = mapCreateProgramadoInputToPrisma(data);
  return prisma.mantenimientos_programados.create({
    data: payload,
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
  }) as Promise<MantenimientoProgramado>;
}

export function updateMantenimientoProgramado(
  id: number,
  data: UpdateMantenimientoProgramadoInput
): Promise<MantenimientoProgramado> {
  const payload = mapUpdateProgramadoInputToPrisma(data);
  return prisma.mantenimientos_programados.update({
    where: { id },
    data: payload,
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
  }) as Promise<MantenimientoProgramado>;
}

export function deleteMantenimientoProgramado(id: number): Promise<MantenimientoProgramado> {
  return prisma.mantenimientos_programados.delete({
    where: { id },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
  }) as Promise<MantenimientoProgramado>;
}

// Funciones para Mantenimientos Realizados
export function listMantenimientosRealizados(): Promise<MantenimientoRealizado[]> {
  return prisma.mantenimientos_realizados.findMany({
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      programacion: {
        include: {
          elemento: {
            select: {
              id: true,
              serie: true,
              marca: true,
              modelo: true,
            },
          },
        },
      },
    },
    orderBy: { fecha_mantenimiento: "desc" },
  }) as Promise<MantenimientoRealizado[]>;
}

export function listMantenimientosRealizadosByElemento(
  elemento_id: number
): Promise<MantenimientoRealizado[]> {
  return prisma.mantenimientos_realizados.findMany({
    where: { elemento_id },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      programacion: true,
    },
    orderBy: { fecha_mantenimiento: "desc" },
  }) as Promise<MantenimientoRealizado[]>;
}

export function getMantenimientoRealizado(id: number): Promise<MantenimientoRealizado | null> {
  return prisma.mantenimientos_realizados.findUnique({
    where: { id },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      programacion: {
        include: {
          elemento: {
            select: {
              id: true,
              serie: true,
              marca: true,
              modelo: true,
            },
          },
        },
      },
    },
  }) as Promise<MantenimientoRealizado | null>;
}

export function createMantenimientoRealizado(
  data: CreateMantenimientoRealizadoInput
): Promise<MantenimientoRealizado> {
  const payload = mapCreateRealizadoInputToPrisma(data);
  return prisma.mantenimientos_realizados.create({
    data: payload,
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      programacion: {
        include: {
          elemento: {
            select: {
              id: true,
              serie: true,
              marca: true,
              modelo: true,
            },
          },
        },
      },
    },
  }) as Promise<MantenimientoRealizado>;
}

/**
 * Actualiza todos los mantenimientos realizados de un mismo equipo (elemento).
 * Útil para cambiar el tipo en bloque (ej. de preventivo a correctivo).
 */
export async function updateMantenimientosRealizadosByElemento(
  elemento_id: number,
  data: Pick<UpdateMantenimientoRealizadoInput, "tipo" | "responsable">
): Promise<{ updated: number }> {
  const ids = await prisma.mantenimientos_realizados.findMany({
    where: { elemento_id },
    select: { id: true },
  });
  const payload = mapUpdateRealizadoInputToPrisma(data as UpdateMantenimientoRealizadoInput);
  for (const { id } of ids) {
    await prisma.mantenimientos_realizados.update({
      where: { id },
      data: payload,
    });
  }
  return { updated: ids.length };
}

export function updateMantenimientoRealizado(
  id: number,
  data: UpdateMantenimientoRealizadoInput
): Promise<MantenimientoRealizado> {
  const payload = mapUpdateRealizadoInputToPrisma(data);
  return prisma.mantenimientos_realizados.update({
    where: { id },
    data: payload,
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      programacion: {
        include: {
          elemento: {
            select: {
              id: true,
              serie: true,
              marca: true,
              modelo: true,
            },
          },
        },
      },
    },
  }) as Promise<MantenimientoRealizado>;
}

export function deleteMantenimientoRealizado(id: number): Promise<MantenimientoRealizado> {
  return prisma.mantenimientos_realizados.delete({
    where: { id },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      programacion: {
        include: {
          elemento: {
            select: {
              id: true,
              serie: true,
              marca: true,
              modelo: true,
            },
          },
        },
      },
    },
  }) as Promise<MantenimientoRealizado>;
}

// Contar mantenimientos pendientes del año actual
export async function countMantenimientosPendientes(): Promise<number> {
  const currentYear = new Date().getFullYear();
  
  return prisma.mantenimientos_programados.count({
    where: {
      año: currentYear,
      estado: "PENDIENTE",
    },
  });
}

// Contar mantenimientos por estado
export async function countMantenimientosPorEstado(): Promise<{
  pendientes: number;
  realizados: number;
  aplazados: number;
}> {
  const currentYear = new Date().getFullYear();
  
  const [pendientes, realizados, aplazados] = await Promise.all([
    prisma.mantenimientos_programados.count({
      where: { año: currentYear, estado: "PENDIENTE" },
    }),
    prisma.mantenimientos_programados.count({
      where: { año: currentYear, estado: "REALIZADO" },
    }),
    prisma.mantenimientos_programados.count({
      where: { año: currentYear, estado: "APLAZADO" },
    }),
  ]);
  
  return { pendientes, realizados, aplazados };
}

// Actualizar estado de mantenimiento programado
export function updateEstadoMantenimiento(
  id: number,
  estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO"
): Promise<MantenimientoProgramado> {
  return prisma.mantenimientos_programados.update({
    where: { id },
    data: { estado },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
  }) as Promise<MantenimientoProgramado>;
}

