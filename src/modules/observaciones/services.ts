import { prisma } from "../../lib/prisma";
import type { Observacion, CreateObservacionInput, UpdateObservacionInput } from "./types";

export function listObservaciones() {
  return prisma.observaciones.findMany({ orderBy: { id: "desc" } });
}

export function createObservacion(data: CreateObservacionInput): Promise<Observacion> {
  return prisma.observaciones.create({ data });
}

export function updateObservacion(id: number, data: UpdateObservacionInput): Promise<Observacion> {
  return prisma.observaciones.update({ where: { id }, data });
}

export function deleteObservacion(id: number): Promise<Observacion> {
  return prisma.observaciones.delete({ where: { id } });
}


