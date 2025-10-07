import { prisma } from "../../lib/prisma";
import type { Subcategoria } from "./types";

export function listSubcategorias(): Promise<Subcategoria[]> {
  return prisma.subcategorias.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<Subcategoria[]>;
}

export function getSubcategoria(id: number): Promise<Subcategoria | null> {
  return prisma.subcategorias.findUnique({ where: { id } }) as unknown as Promise<Subcategoria | null>;
}

export type CreateSubcategoriaInput = {
  nombre: string;
  descripcion?: string | null;
  categoria_id: number;
  estado?: "activo" | "inactivo";
};
export function createSubcategoria(data: CreateSubcategoriaInput): Promise<Subcategoria> {
  return prisma.subcategorias.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      categoria_id: data.categoria_id,
      estado: data.estado ?? "activo",
    },
  });
}

export type UpdateSubcategoriaInput = Partial<Omit<CreateSubcategoriaInput, "categoria_id">> & { categoria_id?: number };
export function updateSubcategoria(id: number, data: UpdateSubcategoriaInput): Promise<Subcategoria> {
  const updateData = {
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    categoria_id: data.categoria_id,
    estado: data.estado,
  };
  return prisma.subcategorias.update({ where: { id }, data: updateData });
}

export function deleteSubcategoria(id: number): Promise<Subcategoria> {
  return prisma.subcategorias.delete({ where: { id } });
}


