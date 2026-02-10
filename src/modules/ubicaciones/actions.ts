"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ubicacionCreateSchema, ubicacionUpdateSchema } from "./validations";
import { createUbicacion, updateUbicacion, deleteUbicacion } from "./services";
import { logAction } from "../../lib/audit-logger";
import { prisma } from "../../lib/prisma";

export async function actionCreateUbicacion(formData: FormData) {
  const parsed = ubicacionCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  // Validación amigable de unicidad del código (además del @unique en DB)
  const existing = await prisma.ubicaciones.findUnique({
    where: { codigo: parsed.data.codigo },
    select: { id: true },
  });
  if (existing) {
    throw new Error(`Ya existe una ubicación con el código "${parsed.data.codigo}"`);
  }

  const ubicacion = await createUbicacion({
    ...parsed.data,
    capacidad: parsed.data.capacidad ?? null,
  });
  await logAction({
    action: "CREATE",
    entity: "ubicacion",
    entityId: ubicacion.id,
    details: `Ubicación creada: ${parsed.data.codigo}`,
  });
  revalidatePath("/ubicaciones");
}

export async function actionUpdateUbicacion(formData: FormData) {
  const parsed = ubicacionUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  if (parsed.data.codigo) {
    const existing = await prisma.ubicaciones.findUnique({
      where: { codigo: parsed.data.codigo },
      select: { id: true },
    });
    if (existing && existing.id !== parsed.data.id) {
      throw new Error(`Ya existe una ubicación con el código "${parsed.data.codigo}"`);
    }
  }

  await updateUbicacion(parsed.data.id!, parsed.data);
  await logAction({
    action: "UPDATE",
    entity: "ubicacion",
    entityId: parsed.data.id,
    details: `Ubicación actualizada: ${parsed.data.id}`,
  });
  revalidatePath("/ubicaciones");
}

export async function actionDeleteUbicacion(id: number) {
  await deleteUbicacion(id);
  await logAction({
    action: "DELETE",
    entity: "ubicacion",
    entityId: id,
    details: `Ubicación eliminada: ${id}`,
  });
  revalidatePath("/ubicaciones");
}

