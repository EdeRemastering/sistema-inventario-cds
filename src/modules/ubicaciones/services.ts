import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type { Ubicacion, CreateUbicacionInput, UpdateUbicacionInput } from "./types";

function toNumber(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  }
  if (typeof (val as { toNumber?: () => number }).toNumber === "function") {
    return (val as { toNumber: () => number }).toNumber();
  }
  return null;
}

function mapToUbicacion(raw: Record<string, unknown>): Ubicacion {
  return {
    ...raw,
    ancho_metros: toNumber(raw.ancho_metros),
    largo_metros: toNumber(raw.largo_metros),
  } as Ubicacion;
}

/**
 * Mapea CreateUbicacionInput a Prisma.ubicacionesUncheckedCreateInput
 */
function mapCreateInputToPrisma(data: CreateUbicacionInput): Prisma.ubicacionesUncheckedCreateInput {
  return {
    codigo: data.codigo,
    nombre: data.nombre,
    sede_id: data.sede_id,
    activo: data.activo ?? true,
    capacidad: data.capacidad ?? null,
    ancho_metros: data.ancho_metros ?? null,
    largo_metros: data.largo_metros ?? null,
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
  if (data.capacidad !== undefined) payload.capacidad = data.capacidad ?? null;
  if (data.ancho_metros !== undefined) payload.ancho_metros = data.ancho_metros ?? null;
  if (data.largo_metros !== undefined) payload.largo_metros = data.largo_metros ?? null;

  return payload;
}

export async function listUbicaciones(): Promise<Ubicacion[]> {
  const rows = await prisma.ubicaciones.findMany({
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
  });
  return rows.map((r) => mapToUbicacion(r as unknown as Record<string, unknown>));
}

export async function listUbicacionesActivas(): Promise<Ubicacion[]> {
  const rows = await prisma.ubicaciones.findMany({
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
  });
  return rows.map((r) => mapToUbicacion(r as unknown as Record<string, unknown>));
}

// Solo ubicaciones que tienen elementos
export async function listUbicacionesConElementos(): Promise<Ubicacion[]> {
  const rows = await prisma.ubicaciones.findMany({
    where: {
      activo: true,
      elementos: {
        some: {} // Al menos un elemento
      }
    },
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
  });
  return rows.map((r) => mapToUbicacion(r as unknown as Record<string, unknown>));
}

export async function getUbicacion(id: number): Promise<Ubicacion | null> {
  const row = await prisma.ubicaciones.findUnique({
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
  });
  return row ? mapToUbicacion(row as unknown as Record<string, unknown>) : null;
}

export async function getUbicacionByCodigo(codigo: string): Promise<Ubicacion | null> {
  const row = await prisma.ubicaciones.findUnique({
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
  });
  return row ? mapToUbicacion(row as unknown as Record<string, unknown>) : null;
}

export async function createUbicacion(data: CreateUbicacionInput): Promise<Ubicacion> {
  const payload = mapCreateInputToPrisma(data);
  const row = await prisma.ubicaciones.create({
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
  });
  return mapToUbicacion(row as unknown as Record<string, unknown>);
}

export async function updateUbicacion(id: number, data: UpdateUbicacionInput): Promise<Ubicacion> {
  const payload = mapUpdateInputToPrisma(data);
  const row = await prisma.ubicaciones.update({
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
  });
  return mapToUbicacion(row as unknown as Record<string, unknown>);
}

export async function deleteUbicacion(id: number): Promise<Ubicacion> {
  const row = await prisma.ubicaciones.delete({
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
  });
  return mapToUbicacion(row as unknown as Record<string, unknown>);
}


