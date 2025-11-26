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
    enero_semana1: data.enero_semana1 ?? false,
    enero_semana2: data.enero_semana2 ?? false,
    enero_semana3: data.enero_semana3 ?? false,
    enero_semana4: data.enero_semana4 ?? false,
    febrero_semana1: data.febrero_semana1 ?? false,
    febrero_semana2: data.febrero_semana2 ?? false,
    febrero_semana3: data.febrero_semana3 ?? false,
    febrero_semana4: data.febrero_semana4 ?? false,
    marzo_semana1: data.marzo_semana1 ?? false,
    marzo_semana2: data.marzo_semana2 ?? false,
    marzo_semana3: data.marzo_semana3 ?? false,
    marzo_semana4: data.marzo_semana4 ?? false,
    abril_semana1: data.abril_semana1 ?? false,
    abril_semana2: data.abril_semana2 ?? false,
    abril_semana3: data.abril_semana3 ?? false,
    abril_semana4: data.abril_semana4 ?? false,
    mayo_semana1: data.mayo_semana1 ?? false,
    mayo_semana2: data.mayo_semana2 ?? false,
    mayo_semana3: data.mayo_semana3 ?? false,
    mayo_semana4: data.mayo_semana4 ?? false,
    junio_semana1: data.junio_semana1 ?? false,
    junio_semana2: data.junio_semana2 ?? false,
    junio_semana3: data.junio_semana3 ?? false,
    junio_semana4: data.junio_semana4 ?? false,
    julio_semana1: data.julio_semana1 ?? false,
    julio_semana2: data.julio_semana2 ?? false,
    julio_semana3: data.julio_semana3 ?? false,
    julio_semana4: data.julio_semana4 ?? false,
    agosto_semana1: data.agosto_semana1 ?? false,
    agosto_semana2: data.agosto_semana2 ?? false,
    agosto_semana3: data.agosto_semana3 ?? false,
    agosto_semana4: data.agosto_semana4 ?? false,
    septiembre_semana1: data.septiembre_semana1 ?? false,
    septiembre_semana2: data.septiembre_semana2 ?? false,
    septiembre_semana3: data.septiembre_semana3 ?? false,
    septiembre_semana4: data.septiembre_semana4 ?? false,
    octubre_semana1: data.octubre_semana1 ?? false,
    octubre_semana2: data.octubre_semana2 ?? false,
    octubre_semana3: data.octubre_semana3 ?? false,
    octubre_semana4: data.octubre_semana4 ?? false,
    noviembre_semana1: data.noviembre_semana1 ?? false,
    noviembre_semana2: data.noviembre_semana2 ?? false,
    noviembre_semana3: data.noviembre_semana3 ?? false,
    noviembre_semana4: data.noviembre_semana4 ?? false,
    diciembre_semana1: data.diciembre_semana1 ?? false,
    diciembre_semana2: data.diciembre_semana2 ?? false,
    diciembre_semana3: data.diciembre_semana3 ?? false,
    diciembre_semana4: data.diciembre_semana4 ?? false,
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
  if (data.enero_semana1 !== undefined) payload.enero_semana1 = data.enero_semana1;
  if (data.enero_semana2 !== undefined) payload.enero_semana2 = data.enero_semana2;
  if (data.enero_semana3 !== undefined) payload.enero_semana3 = data.enero_semana3;
  if (data.enero_semana4 !== undefined) payload.enero_semana4 = data.enero_semana4;
  if (data.febrero_semana1 !== undefined) payload.febrero_semana1 = data.febrero_semana1;
  if (data.febrero_semana2 !== undefined) payload.febrero_semana2 = data.febrero_semana2;
  if (data.febrero_semana3 !== undefined) payload.febrero_semana3 = data.febrero_semana3;
  if (data.febrero_semana4 !== undefined) payload.febrero_semana4 = data.febrero_semana4;
  if (data.marzo_semana1 !== undefined) payload.marzo_semana1 = data.marzo_semana1;
  if (data.marzo_semana2 !== undefined) payload.marzo_semana2 = data.marzo_semana2;
  if (data.marzo_semana3 !== undefined) payload.marzo_semana3 = data.marzo_semana3;
  if (data.marzo_semana4 !== undefined) payload.marzo_semana4 = data.marzo_semana4;
  if (data.abril_semana1 !== undefined) payload.abril_semana1 = data.abril_semana1;
  if (data.abril_semana2 !== undefined) payload.abril_semana2 = data.abril_semana2;
  if (data.abril_semana3 !== undefined) payload.abril_semana3 = data.abril_semana3;
  if (data.abril_semana4 !== undefined) payload.abril_semana4 = data.abril_semana4;
  if (data.mayo_semana1 !== undefined) payload.mayo_semana1 = data.mayo_semana1;
  if (data.mayo_semana2 !== undefined) payload.mayo_semana2 = data.mayo_semana2;
  if (data.mayo_semana3 !== undefined) payload.mayo_semana3 = data.mayo_semana3;
  if (data.mayo_semana4 !== undefined) payload.mayo_semana4 = data.mayo_semana4;
  if (data.junio_semana1 !== undefined) payload.junio_semana1 = data.junio_semana1;
  if (data.junio_semana2 !== undefined) payload.junio_semana2 = data.junio_semana2;
  if (data.junio_semana3 !== undefined) payload.junio_semana3 = data.junio_semana3;
  if (data.junio_semana4 !== undefined) payload.junio_semana4 = data.junio_semana4;
  if (data.julio_semana1 !== undefined) payload.julio_semana1 = data.julio_semana1;
  if (data.julio_semana2 !== undefined) payload.julio_semana2 = data.julio_semana2;
  if (data.julio_semana3 !== undefined) payload.julio_semana3 = data.julio_semana3;
  if (data.julio_semana4 !== undefined) payload.julio_semana4 = data.julio_semana4;
  if (data.agosto_semana1 !== undefined) payload.agosto_semana1 = data.agosto_semana1;
  if (data.agosto_semana2 !== undefined) payload.agosto_semana2 = data.agosto_semana2;
  if (data.agosto_semana3 !== undefined) payload.agosto_semana3 = data.agosto_semana3;
  if (data.agosto_semana4 !== undefined) payload.agosto_semana4 = data.agosto_semana4;
  if (data.septiembre_semana1 !== undefined) payload.septiembre_semana1 = data.septiembre_semana1;
  if (data.septiembre_semana2 !== undefined) payload.septiembre_semana2 = data.septiembre_semana2;
  if (data.septiembre_semana3 !== undefined) payload.septiembre_semana3 = data.septiembre_semana3;
  if (data.septiembre_semana4 !== undefined) payload.septiembre_semana4 = data.septiembre_semana4;
  if (data.octubre_semana1 !== undefined) payload.octubre_semana1 = data.octubre_semana1;
  if (data.octubre_semana2 !== undefined) payload.octubre_semana2 = data.octubre_semana2;
  if (data.octubre_semana3 !== undefined) payload.octubre_semana3 = data.octubre_semana3;
  if (data.octubre_semana4 !== undefined) payload.octubre_semana4 = data.octubre_semana4;
  if (data.noviembre_semana1 !== undefined) payload.noviembre_semana1 = data.noviembre_semana1;
  if (data.noviembre_semana2 !== undefined) payload.noviembre_semana2 = data.noviembre_semana2;
  if (data.noviembre_semana3 !== undefined) payload.noviembre_semana3 = data.noviembre_semana3;
  if (data.noviembre_semana4 !== undefined) payload.noviembre_semana4 = data.noviembre_semana4;
  if (data.diciembre_semana1 !== undefined) payload.diciembre_semana1 = data.diciembre_semana1;
  if (data.diciembre_semana2 !== undefined) payload.diciembre_semana2 = data.diciembre_semana2;
  if (data.diciembre_semana3 !== undefined) payload.diciembre_semana3 = data.diciembre_semana3;
  if (data.diciembre_semana4 !== undefined) payload.diciembre_semana4 = data.diciembre_semana4;
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

