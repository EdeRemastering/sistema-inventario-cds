import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { Elemento, CreateElementoInput, UpdateElementoInput, ElementoWithRelations } from "./types";

// Tipo ligero para la lista (solo campos necesarios)
export type ElementoListItem = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  categoria: { id: number; nombre: string };
  subcategoria: { id: number; nombre: string } | null;
  ubicacion_rel: {
    id: number;
    codigo: string;
    nombre: string;
    sede: { id: number; nombre: string; ciudad: string; municipio: string | null } | null;
  } | null;
};

export function listElementos(): Promise<Elemento[]> {
  return prisma.elementos.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<Elemento[]>;
}

// Tipo para respuesta paginada
export type PaginatedElementos = {
  data: ElementoListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// Función base para obtener elementos paginados
async function fetchElementosPaginated(
  page: number = 1,
  pageSize: number = 50,
  search?: string
): Promise<PaginatedElementos> {
  const skip = (page - 1) * pageSize;
  
  // Condición de búsqueda
  const whereClause = search ? {
    OR: [
      { serie: { contains: search } },
      { marca: { contains: search } },
      { modelo: { contains: search } },
    ]
  } : {};

  // Ejecutar consultas en paralelo
  const [data, total] = await Promise.all([
    prisma.elementos.findMany({
      where: whereClause,
      select: {
        id: true,
        serie: true,
        marca: true,
        modelo: true,
        cantidad: true,
        categoria_id: true,
        subcategoria_id: true,
        ubicacion_id: true,
        categoria: {
          select: { id: true, nombre: true }
        },
        subcategoria: {
          select: { id: true, nombre: true }
        },
        ubicacion_rel: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            sede: {
              select: { id: true, nombre: true, ciudad: true, municipio: true }
            }
          }
        }
      },
      orderBy: { id: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.elementos.count({ where: whereClause })
  ]);

  return {
    data: data as unknown as ElementoListItem[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

// Versión paginada (sin caché para datos frescos con paginación)
export async function listElementosPaginated(
  page: number = 1,
  pageSize: number = 50,
  search?: string
): Promise<PaginatedElementos> {
  return fetchElementosPaginated(page, pageSize, search);
}

// Versión simple para compatibilidad (limitada a 100 elementos)
async function fetchElementosForList(): Promise<ElementoListItem[]> {
  return prisma.elementos.findMany({
    select: {
      id: true,
      serie: true,
      marca: true,
      modelo: true,
      cantidad: true,
      categoria_id: true,
      subcategoria_id: true,
      ubicacion_id: true,
      categoria: {
        select: { id: true, nombre: true }
      },
      subcategoria: {
        select: { id: true, nombre: true }
      },
      ubicacion_rel: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
          sede: {
            select: { id: true, nombre: true, ciudad: true, municipio: true }
          }
        }
      }
    },
    orderBy: { id: "desc" },
    take: 100 // Limitar a 100 para carga inicial rápida
  }) as unknown as Promise<ElementoListItem[]>;
}

// Versión optimizada con caché
export const listElementosForList = unstable_cache(
  fetchElementosForList,
  ["elementos-list"],
  { revalidate: 60, tags: ["elementos"] }
);

// Versión completa con todas las relaciones (para cuando se necesiten todos los datos)
export function listElementosWithRelations(): Promise<ElementoWithRelations[]> {
  return prisma.elementos.findMany({ 
    select: {
      id: true,
      categoria_id: true,
      subcategoria_id: true,
      cantidad: true,
      serie: true,
      marca: true,
      modelo: true,
      ubicacion: true,
      ubicacion_id: true,
      estado_funcional: true,
      estado_fisico: true,
      fecha_entrada: true,
      fecha_salida: true,
      codigo_equipo: true,
      especificaciones: true,
      observaciones: true,
      activo: true,
      creado_en: true,
      actualizado_en: true,
      categoria: {
        select: { id: true, nombre: true, descripcion: true, estado: true, created_at: true, updated_at: true }
      },
      subcategoria: {
        select: { id: true, nombre: true, descripcion: true, categoria_id: true, estado: true, created_at: true, updated_at: true }
      },
      ubicacion_rel: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
          sede: {
            select: { id: true, nombre: true, ciudad: true, municipio: true }
          }
        }
      }
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


