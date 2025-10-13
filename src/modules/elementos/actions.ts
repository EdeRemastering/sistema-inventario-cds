"use server";

import { revalidatePath } from "next/cache";
import { elementoCreateSchema, elementoUpdateSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createElemento, deleteElemento, updateElemento, getElemento, listElementosWithRelations } from "./services";
import { prisma } from "../../lib/prisma";
import type { ElementoWithRelations } from "./types";

export type LowStockElement = ElementoWithRelations & {
  availableStock: number;
  totalPrestado: number;
};

export async function actionCreateElemento(formData: FormData) {
  const parsed = elementoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }
  await createElemento({
    ...parsed.data,
    marca: parsed.data.marca === "" ? null : parsed.data.marca || null,
    modelo: parsed.data.modelo === "" ? null : parsed.data.modelo || null,
    ubicacion: parsed.data.ubicacion === "" ? null : parsed.data.ubicacion || null,
    codigo_equipo: parsed.data.codigo_equipo === "" ? null : parsed.data.codigo_equipo || null,
    observaciones: parsed.data.observaciones === "" ? null : parsed.data.observaciones || null,
    subcategoria_id: parsed.data.subcategoria_id === "" ? null : parsed.data.subcategoria_id || null,
  });
  revalidatePath("/elementos");
}

export async function actionUpdateElemento(formData: FormData) {
  const parsed = elementoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateElemento(parsed.data.id, {
    ...parsed.data,
    marca: parsed.data.marca === "" ? null : parsed.data.marca || null,
    modelo: parsed.data.modelo === "" ? null : parsed.data.modelo || null,
    ubicacion: parsed.data.ubicacion === "" ? null : parsed.data.ubicacion || null,
    codigo_equipo: parsed.data.codigo_equipo === "" ? null : parsed.data.codigo_equipo || null,
    observaciones: parsed.data.observaciones === "" ? null : parsed.data.observaciones || null,
    subcategoria_id: parsed.data.subcategoria_id === "" ? null : parsed.data.subcategoria_id || null,
  });
  revalidatePath("/elementos");
}

export async function actionDeleteElemento(id: number) {
  await deleteElemento(id);
  revalidatePath("/elementos");
}

export async function actionListElementos(): Promise<ElementoWithRelations[]> {
  return await listElementosWithRelations();
}

export async function actionGetElemento(id: number) {
  return await getElemento(id);
}

export async function actionGetLowStockElementos(): Promise<LowStockElement[]> {
  const elementos = await listElementosWithRelations();
  
  // Filtrar elementos con stock bajo (cantidad < 3)
  const lowStockElements = elementos.filter(elemento => elemento.cantidad < 3);
  
  // Calcular stock disponible y total prestado para cada elemento
  const elementsWithStock = await Promise.all(
    lowStockElements.map(async (elemento) => {
      // Calcular total prestado (movimientos de tipo SALIDA sin devolución)
      const totalPrestado = await prisma.movimientos.aggregate({
        where: {
          elemento_id: elemento.id,
          tipo: 'SALIDA',
          fecha_real_devolucion: null
        },
        _sum: {
          cantidad: true
        }
      });
      
      const availableStock = elemento.cantidad - (totalPrestado._sum.cantidad || 0);
      
      return {
        ...elemento,
        availableStock,
        totalPrestado: totalPrestado._sum.cantidad || 0
      };
    })
  );
  
  return elementsWithStock;
}


