import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type { Elemento, CreateElementoInput, UpdateElementoInput, ElementoWithRelations } from "./types";

export function listElementos(): Promise<Elemento[]> {
  return prisma.elementos.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<Elemento[]>;
}

export function listElementosWithRelations(): Promise<ElementoWithRelations[]> {
  return prisma.elementos.findMany({ 
    include: {
      categoria: true,
      subcategoria: true,
      ubicacion_rel: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
          sede: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
              municipio: true,
            },
          },
        },
      },
    },
    orderBy: { id: "desc" } 
  }) as unknown as Promise<ElementoWithRelations[]>;
}

export function getElemento(id: number): Promise<Elemento | null> {
  return prisma.elementos.findUnique({ where: { id } }) as unknown as Promise<Elemento | null>;
}

export function createElemento(data: CreateElementoInput): Promise<Elemento> {
  const payload: Prisma.elementosUncheckedCreateInput = {
    categoria_id: data.categoria_id,
    subcategoria_id: data.subcategoria_id ?? null,
    cantidad: data.cantidad,
    serie: data.serie,
    marca: data.marca ?? null,
    modelo: data.modelo ?? null,
    ubicacion: data.ubicacion ?? null, // Mantener para compatibilidad
    ubicacion_id: data.ubicacion_id ?? null,
    estado_funcional: data.estado_funcional,
    estado_fisico: data.estado_fisico,
    fecha_entrada: data.fecha_entrada,
    fecha_salida: data.fecha_salida ?? null,
    codigo_equipo: data.codigo_equipo ?? null,
    especificaciones: data.especificaciones ? (data.especificaciones as Prisma.InputJsonValue) : Prisma.JsonNull,
    observaciones: data.observaciones ?? null,
    activo: data.activo ?? true,
  };
  return prisma.elementos.create({ data: payload }) as unknown as Promise<Elemento>;
}

export function updateElemento(id: number, data: UpdateElementoInput): Promise<Elemento> {
  const payload: Prisma.elementosUncheckedUpdateInput = {};
  
  if (data.categoria_id !== undefined) payload.categoria_id = data.categoria_id;
  if (data.subcategoria_id !== undefined) {
    payload.subcategoria_id = (typeof data.subcategoria_id === "string" && data.subcategoria_id === "") 
      ? null 
      : (typeof data.subcategoria_id === "number" ? data.subcategoria_id : null);
  }
  if (data.cantidad !== undefined) payload.cantidad = data.cantidad;
  if (data.serie !== undefined) payload.serie = data.serie;
  if (data.marca !== undefined) payload.marca = (typeof data.marca === "string" && data.marca === "") ? null : data.marca || null;
  if (data.modelo !== undefined) payload.modelo = (typeof data.modelo === "string" && data.modelo === "") ? null : data.modelo || null;
  if (data.ubicacion !== undefined) payload.ubicacion = (typeof data.ubicacion === "string" && data.ubicacion === "") ? null : data.ubicacion || null;
  if (data.ubicacion_id !== undefined) {
    payload.ubicacion_id = (typeof data.ubicacion_id === "string" && data.ubicacion_id === "") 
      ? null 
      : (typeof data.ubicacion_id === "number" ? data.ubicacion_id : null);
  }
  if (data.estado_funcional !== undefined) payload.estado_funcional = data.estado_funcional;
  if (data.estado_fisico !== undefined) payload.estado_fisico = data.estado_fisico;
  if (data.fecha_entrada !== undefined) payload.fecha_entrada = data.fecha_entrada;
  if (data.fecha_salida !== undefined) {
    payload.fecha_salida = (typeof data.fecha_salida === "string" && data.fecha_salida === "") 
      ? null 
      : (data.fecha_salida instanceof Date ? data.fecha_salida : null);
  }
  if (data.codigo_equipo !== undefined) payload.codigo_equipo = (typeof data.codigo_equipo === "string" && data.codigo_equipo === "") ? null : data.codigo_equipo || null;
  if (data.especificaciones !== undefined) {
    payload.especificaciones = data.especificaciones 
      ? (data.especificaciones as Prisma.InputJsonValue) 
      : Prisma.JsonNull;
  }
  if (data.observaciones !== undefined) payload.observaciones = (typeof data.observaciones === "string" && data.observaciones === "") ? null : data.observaciones || null;
  if (data.activo !== undefined) payload.activo = data.activo;
  
  return prisma.elementos.update({ where: { id }, data: payload }) as unknown as Promise<Elemento>;
}

export function deleteElemento(id: number): Promise<Elemento> {
  return prisma.elementos.delete({ where: { id } }) as unknown as Promise<Elemento>;
}


