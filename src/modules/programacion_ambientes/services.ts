import { prisma } from "../../lib/prisma";
import type { ProgramacionAmbiente, CreateProgramacionAmbienteInput, UpdateProgramacionAmbienteInput } from "./types";

export function listProgramacionAmbientes(filters?: {
  ubicacion_id?: number;
  fecha?: Date;
  fechaDesde?: Date;
  fechaHasta?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (filters?.ubicacion_id) where.ubicacion_id = filters.ubicacion_id;
  if (filters?.fecha) {
    const d = filters.fecha;
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    where.fecha = { gte: start, lte: end };
  }
  if (filters?.fechaDesde && filters?.fechaHasta) {
    where.fecha = { gte: filters.fechaDesde, lte: filters.fechaHasta };
  }

  return prisma.programacion_ambientes.findMany({
    where,
    include: {
      ubicacion: {
        select: { id: true, codigo: true, nombre: true, sede: { select: { nombre: true } } },
      },
    },
    orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
  }) as Promise<ProgramacionAmbiente[]>;
}

export function createProgramacionAmbiente(data: CreateProgramacionAmbienteInput) {
  return prisma.programacion_ambientes.create({
    data: {
      ubicacion_id: data.ubicacion_id,
      fecha: data.fecha,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      docente_id_q10: data.docente_id_q10 ?? null,
      descripcion: data.descripcion ?? null,
      ocupado: data.ocupado ?? true,
    },
    include: {
      ubicacion: { select: { id: true, codigo: true, nombre: true, sede: { select: { nombre: true } } } },
    },
  }) as Promise<ProgramacionAmbiente>;
}

export function updateProgramacionAmbiente(id: number, data: UpdateProgramacionAmbienteInput) {
  const payload: Record<string, unknown> = {};
  if (data.ubicacion_id !== undefined) payload.ubicacion_id = data.ubicacion_id;
  if (data.fecha !== undefined) payload.fecha = data.fecha;
  if (data.hora_inicio !== undefined) payload.hora_inicio = data.hora_inicio;
  if (data.hora_fin !== undefined) payload.hora_fin = data.hora_fin;
  if (data.docente_id_q10 !== undefined) payload.docente_id_q10 = data.docente_id_q10 ?? null;
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion ?? null;
  if (data.ocupado !== undefined) payload.ocupado = data.ocupado;

  return prisma.programacion_ambientes.update({
    where: { id },
    data: payload,
    include: {
      ubicacion: { select: { id: true, codigo: true, nombre: true, sede: { select: { nombre: true } } } },
    },
  }) as Promise<ProgramacionAmbiente>;
}

export function deleteProgramacionAmbiente(id: number) {
  return prisma.programacion_ambientes.delete({ where: { id } });
}
