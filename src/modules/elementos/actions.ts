"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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
    ubicacion_id: parsed.data.ubicacion_id === "" ? null : parsed.data.ubicacion_id || null,
    fecha_salida: parsed.data.fecha_salida === "" ? null : parsed.data.fecha_salida || null,
    codigo_equipo: parsed.data.codigo_equipo === "" ? null : parsed.data.codigo_equipo || null,
    especificaciones: parsed.data.especificaciones || null,
    observaciones: parsed.data.observaciones === "" ? null : parsed.data.observaciones || null,
    subcategoria_id: parsed.data.subcategoria_id === "" ? null : parsed.data.subcategoria_id || null,
    activo: parsed.data.activo ?? true,
  });
  revalidateTag("elementos");
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
    ubicacion_id: parsed.data.ubicacion_id === "" ? null : parsed.data.ubicacion_id || null,
    fecha_salida: parsed.data.fecha_salida === "" ? null : parsed.data.fecha_salida || null,
    codigo_equipo: parsed.data.codigo_equipo === "" ? null : parsed.data.codigo_equipo || null,
    especificaciones: parsed.data.especificaciones || null,
    observaciones: parsed.data.observaciones === "" ? null : parsed.data.observaciones || null,
    subcategoria_id: parsed.data.subcategoria_id === "" ? null : parsed.data.subcategoria_id || null,
    activo: parsed.data.activo,
  });
  revalidateTag("elementos");
  revalidatePath("/elementos");
}

export async function actionDeleteElemento(id: number) {
  await deleteElemento(id);
  revalidateTag("elementos");
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
  
  if (lowStockElements.length === 0) {
    return [];
  }
  
  // Obtener IDs de elementos con stock bajo
  const elementoIds = lowStockElements.map(e => e.id);
  
  // Una sola consulta agrupada para obtener todos los préstamos pendientes
  const prestadosPorElemento = await prisma.movimientos.groupBy({
    by: ['elemento_id'],
    where: {
      elemento_id: { in: elementoIds },
      tipo: 'SALIDA',
      fecha_real_devolucion: null
    },
    _sum: {
      cantidad: true
    }
  });
  
  // Crear un mapa para acceso rápido
  const prestadosMap = new Map(
    prestadosPorElemento.map(p => [p.elemento_id, p._sum.cantidad || 0])
  );
  
  // Calcular stock disponible para cada elemento
  const elementsWithStock = lowStockElements.map((elemento) => {
    const totalPrestado = prestadosMap.get(elemento.id) || 0;
    const availableStock = elemento.cantidad - totalPrestado;
    
    return {
      ...elemento,
      availableStock,
      totalPrestado
    };
  });
  
  return elementsWithStock;
}


