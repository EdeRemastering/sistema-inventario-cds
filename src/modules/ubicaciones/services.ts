import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type { Ubicacion, CreateUbicacionInput, UpdateUbicacionInput } from "./types";

/**
 * Mapea CreateUbicacionInput a Prisma.ubicacionesUncheckedCreateInput
 */
function mapCreateInputToPrisma(data: CreateUbicacionInput): Prisma.ubicacionesUncheckedCreateInput {
  return {
    codigo: data.codigo,
    nombre: data.nombre,
    sede_id: data.sede_id,
    activo: data.activo ?? true,
  };
}

/**
 * Mapea UpdateUbicacionInput a Prisma.ubicacionesUncheckedUpdateInput
 */
function mapUpdateInputToPrisma(data: UpdateUbicacionInput): Prisma.ubicacionesUncheckedUpdateInput {
  const payload: Prisma.ubicacionesUncheckedUpdateInput = {};

  if (data.codigo !== undefined) payload.codigo = data.codigo;
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.sede_id !== undefined) payload.sede_id = data.sede_id;
  if (data.activo !== undefined) payload.activo = data.activo;

  return payload;
}

export function listUbicaciones(): Promise<Ubicacion[]> {
  return prisma.ubicaciones.findMany({
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
    orderBy: { codigo: "asc" },
  }) as Promise<Ubicacion[]>;
}

export function listUbicacionesActivas(): Promise<Ubicacion[]> {
  return prisma.ubicaciones.findMany({
    where: { activo: true },
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
    orderBy: { codigo: "asc" },
  }) as Promise<Ubicacion[]>;
}

export function getUbicacion(id: number): Promise<Ubicacion | null> {
  return prisma.ubicaciones.findUnique({
    where: { id },
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
  }) as Promise<Ubicacion | null>;
}

export function getUbicacionByCodigo(codigo: string): Promise<Ubicacion | null> {
  return prisma.ubicaciones.findUnique({
    where: { codigo },
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
  }) as Promise<Ubicacion | null>;
}

export function createUbicacion(data: CreateUbicacionInput): Promise<Ubicacion> {
  const payload = mapCreateInputToPrisma(data);
  return prisma.ubicaciones.create({
    data: payload,
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
  }) as Promise<Ubicacion>;
}

export function updateUbicacion(id: number, data: UpdateUbicacionInput): Promise<Ubicacion> {
  const payload = mapUpdateInputToPrisma(data);
  return prisma.ubicaciones.update({
    where: { id },
    data: payload,
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
  }) as Promise<Ubicacion>;
}

export function deleteUbicacion(id: number): Promise<Ubicacion> {
  return prisma.ubicaciones.delete({
    where: { id },
    include: {
      sede: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          municipio: true,
        },
      },
    },
  }) as Promise<Ubicacion>;
}


