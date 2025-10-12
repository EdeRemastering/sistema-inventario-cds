import { prisma } from "../../lib/prisma";
import type { Elemento, CreateElementoInput, UpdateElementoInput } from "./types";

export function listElementos(): Promise<Elemento[]> {
  return prisma.elementos.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<Elemento[]>;
}

export function listElementosWithRelations() {
  return prisma.elementos.findMany({
    select: {
      id: true,
      serie: true,
      marca: true,
      modelo: true,
      categoria: {
        select: {
          nombre: true,
        },
      },
      subcategoria: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });
}

export function getElemento(id: number): Promise<Elemento | null> {
  return prisma.elementos.findUnique({ where: { id } }) as unknown as Promise<Elemento | null>;
}

export function createElemento(data: CreateElementoInput): Promise<Elemento> {
  const payload = {
    categoria_id: data.categoria_id,
    subcategoria_id: data.subcategoria_id ?? null,
    cantidad: data.cantidad,
    serie: data.serie,
    marca: data.marca ?? null,
    modelo: data.modelo ?? null,
    ubicacion: data.ubicacion ?? null,
    estado_funcional: data.estado_funcional,
    estado_fisico: data.estado_fisico,
    fecha_entrada: data.fecha_entrada,
    codigo_equipo: data.codigo_equipo ?? null,
    observaciones: data.observaciones ?? null,
  };
  return prisma.elementos.create({ data: payload });
}

export function updateElemento(id: number, data: UpdateElementoInput): Promise<Elemento> {
  const payload = {
    categoria_id: data.categoria_id,
    subcategoria_id: data.subcategoria_id ?? null,
    cantidad: data.cantidad,
    serie: data.serie,
    marca: data.marca ?? null,
    modelo: data.modelo ?? null,
    ubicacion: data.ubicacion ?? null,
    estado_funcional: data.estado_funcional,
    estado_fisico: data.estado_fisico,
    fecha_entrada: data.fecha_entrada,
    codigo_equipo: data.codigo_equipo ?? null,
    observaciones: data.observaciones ?? null,
  };
  return prisma.elementos.update({ where: { id }, data: payload });
}

export function deleteElemento(id: number): Promise<Elemento> {
  return prisma.elementos.delete({ where: { id } });
}


