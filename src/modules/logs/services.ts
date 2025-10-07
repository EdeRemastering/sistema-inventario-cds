import { prisma } from "../../lib/prisma";
import type { Log, CreateLogInput } from "./types";

export function listLogs(): Promise<Log[]> {
  return prisma.logs.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<Log[]>;
}

export function createLog(data: CreateLogInput): Promise<Log> {
  return prisma.logs.create({ data: { accion: data.accion, detalles: data.detalles ?? null, ip: data.ip ?? null, usuario_id: data.usuario_id } });
}

export function deleteLog(id: number): Promise<Log> {
  return prisma.logs.delete({ where: { id } });
}


