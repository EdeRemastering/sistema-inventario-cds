import { prisma } from "../../lib/prisma";
import type { Observacion, CreateObservacionInput, UpdateObservacionInput } from "./types";

export function listObservaciones(): Promise<Observacion[]> {
  return prisma.observaciones.findMany({ orderBy: { id: "desc" } }) as Promise<Observacion[]>;
}

export function createObservacion(data: CreateObservacionInput): Promise<Observacion> {
  return prisma.observaciones.create({ data }) as Promise<Observacion>;
}

export function updateObservacion(id: number, data: UpdateObservacionInput): Promise<Observacion> {
  return prisma.observaciones.update({ where: { id }, data }) as Promise<Observacion>;
}

export function deleteObservacion(id: number): Promise<Observacion> {
  return prisma.observaciones.delete({ where: { id } }) as Promise<Observacion>;
}


