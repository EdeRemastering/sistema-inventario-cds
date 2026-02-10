"use server";

import { revalidatePath } from "next/cache";
import { elementoCreateSchema, elementoUpdateSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createElemento, deleteElemento, updateElemento, getElemento, listElementosWithRelations } from "./services";
import { createHojaVida } from "../hojas_vida/services";
import { prisma } from "../../lib/prisma";
import type { ElementoWithRelations } from "./types";
import { deleteImageFromR2 } from "../../lib/image-storage";

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

  // Validación amigable: evitar duplicidad de código_equipo si viene informado
  const codigoEquipo =
    parsed.data.codigo_equipo === "" ? null : parsed.data.codigo_equipo || null;
  if (codigoEquipo) {
    const existing = await prisma.elementos.findFirst({
      where: { codigo_equipo: codigoEquipo },
      select: { id: true },
    });
    if (existing) {
      throw new Error(`Ya existe un elemento con el código "${codigoEquipo}"`);
    }
  }

  const elemento = await createElemento({
    ...parsed.data,
    marca: parsed.data.marca === "" ? null : parsed.data.marca || null,
    modelo: parsed.data.modelo === "" ? null : parsed.data.modelo || null,
    ubicacion: parsed.data.ubicacion === "" ? null : parsed.data.ubicacion || null,
    ubicacion_id: parsed.data.ubicacion_id === "" ? null : parsed.data.ubicacion_id || null,
    imagen_url: parsed.data.imagen_url === "" ? null : parsed.data.imagen_url || null,
    fecha_salida: parsed.data.fecha_salida === "" ? null : parsed.data.fecha_salida || null,
    codigo_equipo: codigoEquipo,
    especificaciones: parsed.data.especificaciones || null,
    observaciones: parsed.data.observaciones === "" ? null : parsed.data.observaciones || null,
    subcategoria_id: parsed.data.subcategoria_id === "" ? null : parsed.data.subcategoria_id || null,
    activo: parsed.data.activo ?? true,
  });

  // Crear automáticamente una hoja de vida por elemento (1:1)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  await createHojaVida({
    elemento_id: elemento.id,
    fecha_dilegenciamiento: hoy,
    tipo_elemento: "EQUIPO",
    area_ubicacion: null,
    responsable: null,
    especificaciones_tecnicas: null,
    descripcion: null,
    requerimientos_funcionamiento: null,
    requerimientos_seguridad: null,
    rutina_mantenimiento: null,
    fecha_actualizacion: null,
    activo: true,
  });

  revalidatePath("/elementos");
  revalidatePath("/hojas-vida");
}

export async function actionUpdateElemento(formData: FormData) {
  const parsed = elementoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const codigoEquipo =
    parsed.data.codigo_equipo === "" ? null : parsed.data.codigo_equipo || null;
  if (codigoEquipo) {
    const existing = await prisma.elementos.findFirst({
      where: {
        codigo_equipo: codigoEquipo,
        NOT: { id: parsed.data.id },
      },
      select: { id: true },
    });
    if (existing) {
      throw new Error(`Ya existe un elemento con el código "${codigoEquipo}"`);
    }
  }

  // Si cambia la imagen, borrar la anterior en R2
  if (parsed.data.imagen_url !== undefined) {
    const current = (await prisma.elementos.findUnique({
      where: { id: parsed.data.id },
      select: { imagen_url: true } as any,
    } as any)) as { imagen_url?: string | null } | null;
    const nextUrl = parsed.data.imagen_url === "" ? null : parsed.data.imagen_url || null;
    if (current?.imagen_url && current.imagen_url !== nextUrl) {
      await deleteImageFromR2(current.imagen_url);
    }
  }

  await updateElemento(parsed.data.id, {
    ...parsed.data,
    marca: parsed.data.marca === "" ? null : parsed.data.marca || null,
    modelo: parsed.data.modelo === "" ? null : parsed.data.modelo || null,
    ubicacion: parsed.data.ubicacion === "" ? null : parsed.data.ubicacion || null,
    ubicacion_id: parsed.data.ubicacion_id === "" ? null : parsed.data.ubicacion_id || null,
    imagen_url: parsed.data.imagen_url === "" ? null : parsed.data.imagen_url || null,
    fecha_salida: parsed.data.fecha_salida === "" ? null : parsed.data.fecha_salida || null,
    codigo_equipo: codigoEquipo,
    especificaciones: parsed.data.especificaciones || null,
    observaciones: parsed.data.observaciones === "" ? null : parsed.data.observaciones || null,
    subcategoria_id: parsed.data.subcategoria_id === "" ? null : parsed.data.subcategoria_id || null,
    activo: parsed.data.activo,
  });
  revalidatePath("/elementos");
}

export async function actionDeleteElemento(id: number) {
  const current = (await prisma.elementos.findUnique({
    where: { id },
    select: { imagen_url: true } as any,
  } as any)) as { imagen_url?: string | null } | null;
  await deleteElemento(id);
  if (current?.imagen_url) {
    await deleteImageFromR2(current.imagen_url);
  }
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


