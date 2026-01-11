import { prisma } from "../../lib/prisma";
import type { Categoria } from "./types";

export function listCategorias(): Promise<Categoria[]> {
    return prisma.categorias.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<Categoria[]>;
}

// Solo categorías que tienen elementos (directos o via subcategorías)
export async function listCategoriasConElementos(): Promise<Categoria[]> {
    return prisma.categorias.findMany({
        where: {
            elementos: {
                some: {} // Al menos un elemento
            }
        },
        orderBy: { nombre: "asc" }
    }) as unknown as Promise<Categoria[]>;
}

export function getCategoria(id: number): Promise<Categoria | null> {
    return prisma.categorias.findUnique({ where: { id } }) as unknown as Promise<Categoria | null>;
}

export type CreateCategoriaInput = Pick<Categoria, "nombre" | "descripcion" | "estado">;
export function createCategoria(data: CreateCategoriaInput): Promise<Categoria> {
    return prisma.categorias.create({ data: { nombre: data.nombre, descripcion: data.descripcion ?? null, estado: data.estado ?? "activo" } });
}

export type UpdateCategoriaInput = Partial<Pick<Categoria, "nombre" | "descripcion" | "estado">>;
export function updateCategoria(id: number, data: UpdateCategoriaInput): Promise<Categoria> {
    return prisma.categorias.update({ where: { id }, data: data });
}

export function deleteCategoria(id: number): Promise<Categoria> {
    return prisma.categorias.delete({ where: { id } });
}
