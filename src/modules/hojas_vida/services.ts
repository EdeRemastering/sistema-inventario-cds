import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  HojaVida,
  CambioElemento,
  CreateHojaVidaInput,
  UpdateHojaVidaInput,
  CreateCambioElementoInput,
  UpdateCambioElementoInput,
} from "./types";

/**
 * Mapea CreateHojaVidaInput a Prisma.hojas_vidaUncheckedCreateInput
 */
function mapCreateHojaVidaInputToPrisma(
  data: CreateHojaVidaInput
): Prisma.hojas_vidaUncheckedCreateInput {
  return {
    elemento_id: data.elemento_id,
    fecha_dilegenciamiento: data.fecha_dilegenciamiento,
    tipo_elemento: data.tipo_elemento,
    area_ubicacion: data.area_ubicacion ?? null,
    responsable: data.responsable ?? null,
    especificaciones_tecnicas: data.especificaciones_tecnicas
      ? (data.especificaciones_tecnicas as Prisma.InputJsonValue)
      : Prisma.JsonNull,
    descripcion: data.descripcion ?? null,
    requerimientos_funcionamiento: data.requerimientos_funcionamiento ?? null,
    requerimientos_seguridad: data.requerimientos_seguridad ?? null,
    rutina_mantenimiento: data.rutina_mantenimiento ?? null,
    fecha_actualizacion: data.fecha_actualizacion ?? null,
    activo: data.activo ?? true,
  };
}

/**
 * Mapea UpdateHojaVidaInput a Prisma.hojas_vidaUncheckedUpdateInput
 */
function mapUpdateHojaVidaInputToPrisma(
  data: UpdateHojaVidaInput
): Prisma.hojas_vidaUncheckedUpdateInput {
  const payload: Prisma.hojas_vidaUncheckedUpdateInput = {};

  if (data.elemento_id !== undefined) payload.elemento_id = data.elemento_id;
  if (data.fecha_dilegenciamiento !== undefined)
    payload.fecha_dilegenciamiento = data.fecha_dilegenciamiento;
  if (data.tipo_elemento !== undefined) payload.tipo_elemento = data.tipo_elemento;
  if (data.area_ubicacion !== undefined) payload.area_ubicacion = data.area_ubicacion ?? null;
  if (data.responsable !== undefined) payload.responsable = data.responsable ?? null;
  if (data.especificaciones_tecnicas !== undefined) {
    payload.especificaciones_tecnicas = data.especificaciones_tecnicas
      ? (data.especificaciones_tecnicas as Prisma.InputJsonValue)
      : Prisma.JsonNull;
  }
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion ?? null;
  if (data.requerimientos_funcionamiento !== undefined)
    payload.requerimientos_funcionamiento = data.requerimientos_funcionamiento ?? null;
  if (data.requerimientos_seguridad !== undefined)
    payload.requerimientos_seguridad = data.requerimientos_seguridad ?? null;
  if (data.rutina_mantenimiento !== undefined)
    payload.rutina_mantenimiento = data.rutina_mantenimiento ?? null;
  if (data.fecha_actualizacion !== undefined)
    payload.fecha_actualizacion = data.fecha_actualizacion ?? null;
  if (data.activo !== undefined) payload.activo = data.activo;

  return payload;
}

/**
 * Mapea CreateCambioElementoInput a Prisma.cambios_elementosUncheckedCreateInput
 */
function mapCreateCambioInputToPrisma(
  data: CreateCambioElementoInput
): Prisma.cambios_elementosUncheckedCreateInput {
  return {
    hoja_vida_id: data.hoja_vida_id,
    fecha_cambio: data.fecha_cambio,
    descripcion_cambio: data.descripcion_cambio,
    tipo_cambio: data.tipo_cambio,
    usuario: data.usuario ?? null,
  };
}

/**
 * Mapea UpdateCambioElementoInput a Prisma.cambios_elementosUncheckedUpdateInput
 */
function mapUpdateCambioInputToPrisma(
  data: UpdateCambioElementoInput
): Prisma.cambios_elementosUncheckedUpdateInput {
  const payload: Prisma.cambios_elementosUncheckedUpdateInput = {};

  if (data.hoja_vida_id !== undefined) payload.hoja_vida_id = data.hoja_vida_id;
  if (data.fecha_cambio !== undefined) payload.fecha_cambio = data.fecha_cambio;
  if (data.descripcion_cambio !== undefined) payload.descripcion_cambio = data.descripcion_cambio;
  if (data.tipo_cambio !== undefined) payload.tipo_cambio = data.tipo_cambio;
  if (data.usuario !== undefined) payload.usuario = data.usuario ?? null;

  return payload;
}

// Funciones para Hojas de Vida
export function listHojasVida(): Promise<HojaVida[]> {
  return prisma.hojas_vida.findMany({
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      cambios: {
        orderBy: { fecha_cambio: "desc" },
      },
    },
    orderBy: { creado_en: "desc" },
  }) as Promise<HojaVida[]>;
}

export function getHojaVida(id: number): Promise<HojaVida | null> {
  return prisma.hojas_vida.findUnique({
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
      cambios: {
        orderBy: { fecha_cambio: "desc" },
      },
    },
  }) as Promise<HojaVida | null>;
}

export function getHojaVidaByElemento(elemento_id: number): Promise<HojaVida | null> {
  return prisma.hojas_vida.findFirst({
    where: {
      elemento_id,
      activo: true,
    },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
      cambios: {
        orderBy: { fecha_cambio: "desc" },
      },
    },
  }) as Promise<HojaVida | null>;
}

export function createHojaVida(data: CreateHojaVidaInput): Promise<HojaVida> {
  const payload = mapCreateHojaVidaInputToPrisma(data);
  return prisma.hojas_vida.create({
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
      cambios: true,
    },
  }) as Promise<HojaVida>;
}

export function updateHojaVida(id: number, data: UpdateHojaVidaInput): Promise<HojaVida> {
  const payload = mapUpdateHojaVidaInputToPrisma(data);
  return prisma.hojas_vida.update({
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
      cambios: {
        orderBy: { fecha_cambio: "desc" },
      },
    },
  }) as Promise<HojaVida>;
}

export function deleteHojaVida(id: number): Promise<HojaVida> {
  return prisma.hojas_vida.delete({
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
      cambios: true,
    },
  }) as Promise<HojaVida>;
}

// Funciones para Cambios de Elementos
export function listCambiosElemento(hoja_vida_id: number): Promise<CambioElemento[]> {
  return prisma.cambios_elementos.findMany({
    where: { hoja_vida_id },
    orderBy: { fecha_cambio: "desc" },
  }) as Promise<CambioElemento[]>;
}

export function getCambioElemento(id: number): Promise<CambioElemento | null> {
  return prisma.cambios_elementos.findUnique({
    where: { id },
  }) as Promise<CambioElemento | null>;
}

export function createCambioElemento(data: CreateCambioElementoInput): Promise<CambioElemento> {
  const payload = mapCreateCambioInputToPrisma(data);
  return prisma.cambios_elementos.create({
    data: payload,
  }) as Promise<CambioElemento>;
}

export function updateCambioElemento(
  id: number,
  data: UpdateCambioElementoInput
): Promise<CambioElemento> {
  const payload = mapUpdateCambioInputToPrisma(data);
  return prisma.cambios_elementos.update({
    where: { id },
    data: payload,
  }) as Promise<CambioElemento>;
}

export function deleteCambioElemento(id: number): Promise<CambioElemento> {
  return prisma.cambios_elementos.delete({
    where: { id },
  }) as Promise<CambioElemento>;
}

