import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type { Sede, CreateSedeInput, UpdateSedeInput } from "./types";

/**
 * Mapea CreateSedeInput a Prisma.sedesUncheckedCreateInput
 */
function mapCreateInputToPrisma(data: CreateSedeInput): Prisma.sedesUncheckedCreateInput {
  return {
    nombre: data.nombre,
    ciudad: data.ciudad,
    municipio: data.municipio ?? null,
    activo: data.activo ?? true,
  };
}

/**
 * Mapea UpdateSedeInput a Prisma.sedesUncheckedUpdateInput
 */
function mapUpdateInputToPrisma(data: UpdateSedeInput): Prisma.sedesUncheckedUpdateInput {
  const payload: Prisma.sedesUncheckedUpdateInput = {};

  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.ciudad !== undefined) payload.ciudad = data.ciudad;
  if (data.municipio !== undefined) payload.municipio = data.municipio ?? null;
  if (data.activo !== undefined) payload.activo = data.activo;

  return payload;
}

export function listSedes(): Promise<Sede[]> {
  return prisma.sedes.findMany({
    orderBy: { nombre: "asc" },
  }) as Promise<Sede[]>;
}

export function listSedesActivas(): Promise<Sede[]> {
  return prisma.sedes.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  }) as Promise<Sede[]>;
}

// Solo sedes que tienen ubicaciones con elementos
export function listSedesConElementos(): Promise<Sede[]> {
  return prisma.sedes.findMany({
    where: {
      activo: true,
      ubicaciones: {
        some: {
          elementos: {
            some: {} // Al menos un elemento
          }
        }
      }
    },
    orderBy: { nombre: "asc" },
  }) as Promise<Sede[]>;
}

export function getSede(id: number): Promise<Sede | null> {
  return prisma.sedes.findUnique({ where: { id } }) as Promise<Sede | null>;
}

export function createSede(data: CreateSedeInput): Promise<Sede> {
  const payload = mapCreateInputToPrisma(data);
  return prisma.sedes.create({
    data: payload,
  }) as Promise<Sede>;
}

export function updateSede(id: number, data: UpdateSedeInput): Promise<Sede> {
  const payload = mapUpdateInputToPrisma(data);
  return prisma.sedes.update({
    where: { id },
    data: payload,
  }) as Promise<Sede>;
}

export function deleteSede(id: number): Promise<Sede> {
  return prisma.sedes.delete({ where: { id } }) as Promise<Sede>;
}

