"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ubicacionCreateSchema, ubicacionUpdateSchema } from "./validations";
import { createUbicacion, updateUbicacion, deleteUbicacion } from "./services";
import { logAction } from "../../lib/audit-logger";

export async function actionCreateUbicacion(formData: FormData) {
  const parsed = ubicacionCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const ubicacion = await createUbicacion(parsed.data);
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

