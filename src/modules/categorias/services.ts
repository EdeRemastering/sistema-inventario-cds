import { prisma } from "../../lib/prisma";
import type { Categoria } from "./types";

const deletedFilter = { deleted_at: null };

export function listCategorias(): Promise<Categoria[]> {
    return prisma.categorias.findMany({ where: deletedFilter, orderBy: { id: "desc" } }) as unknown as Promise<Categoria[]>;
}

// Solo categorías que tienen elementos (directos o via subcategorías)
export async function listCategoriasConElementos(): Promise<Categoria[]> {
    return prisma.categorias.findMany({
        where: {
            ...deletedFilter,
            elementos: {
                some: {} // Al menos un elemento
            }
        },
        orderBy: { nombre: "asc" }
    }) as unknown as Promise<Categoria[]>;
}

export function getCategoria(id: number): Promise<Categoria | null> {
    return prisma.categorias.findFirst({ where: { id, ...deletedFilter } }) as unknown as Promise<Categoria | null>;
}

export type CreateCategoriaInput = Pick<Categoria, "nombre" | "descripcion" | "estado">;
export function createCategoria(data: CreateCategoriaInput): Promise<Categoria> {
    return prisma.categorias.create({ data: { nombre: data.nombre, descripcion: data.descripcion ?? null, estado: data.estado ?? "activo" } });
}

export type UpdateCategoriaInput = Partial<Pick<Categoria, "nombre" | "descripcion" | "estado">>;
export function updateCategoria(id: number, data: UpdateCategoriaInput): Promise<Categoria> {
    return prisma.categorias.update({ where: { id }, data: data });
}

export function deleteCategoria(id: number, userId?: number): Promise<Categoria> {
    return prisma.categorias.update({
        where: { id },
        data: { deleted_at: new Date(), deleted_by: userId ?? null },
    });
}
