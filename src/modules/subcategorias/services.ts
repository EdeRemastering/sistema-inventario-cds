import { prisma } from "../../lib/prisma";
import { withDatabaseRetry } from "../../lib/db-connection";
import type { Subcategoria } from "./types";

const deletedFilter = { deleted_at: null };

export async function listSubcategorias(): Promise<Subcategoria[]> {
  return withDatabaseRetry(async () => {
    return await prisma.subcategorias.findMany({ where: deletedFilter, orderBy: { id: "desc" } }) as unknown as Promise<Subcategoria[]>;
  });
}

// Solo subcategorías que tienen elementos
export async function listSubcategoriasConElementos(): Promise<Subcategoria[]> {
  return withDatabaseRetry(async () => {
    return await prisma.subcategorias.findMany({
      where: {
        ...deletedFilter,
        elementos: {
          some: {} // Al menos un elemento
        }
      },
      orderBy: { nombre: "asc" }
    }) as unknown as Promise<Subcategoria[]>;
  });
}

export async function getSubcategoria(id: number): Promise<Subcategoria | null> {
  return withDatabaseRetry(async () => {
    return await prisma.subcategorias.findFirst({ where: { id, ...deletedFilter } }) as unknown as Promise<Subcategoria | null>;
  });
}

export type CreateSubcategoriaInput = {
  nombre: string;
  descripcion?: string | null;
  categoria_id: number;
  estado?: "activo" | "inactivo";
};
export async function createSubcategoria(data: CreateSubcategoriaInput): Promise<Subcategoria> {
  return withDatabaseRetry(async () => {
    return await prisma.subcategorias.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        categoria_id: data.categoria_id,
        estado: data.estado ?? "activo",
      },
    });
  });
}

export type UpdateSubcategoriaInput = Partial<Omit<CreateSubcategoriaInput, "categoria_id">> & { categoria_id?: number };
export async function updateSubcategoria(id: number, data: UpdateSubcategoriaInput): Promise<Subcategoria> {
  return withDatabaseRetry(async () => {
    const updateData = {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      categoria_id: data.categoria_id,
      estado: data.estado,
    };
    return await prisma.subcategorias.update({ where: { id }, data: updateData });
  });
}

export async function deleteSubcategoria(id: number, userId?: number): Promise<Subcategoria> {
  return withDatabaseRetry(async () => {
    return await prisma.subcategorias.update({
      where: { id },
      data: { deleted_at: new Date(), deleted_by: userId ?? null },
    });
  });
}


