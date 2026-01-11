"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { sedeCreateSchema, sedeUpdateSchema } from "./validations";
import { createSede, updateSede, deleteSede } from "./services";
import { logAction } from "../../lib/audit-logger";

export async function actionCreateSede(formData: FormData) {
  const parsed = sedeCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const createData = {
    ...parsed.data,
    municipio: parsed.data.municipio ?? null,
  };

  const sede = await createSede(createData);
  await logAction({
    action: "CREATE",
    entity: "sede",
    entityId: sede.id,
    details: `Sede creada: ${parsed.data.nombre}`,
  });
  revalidatePath("/sedes");
}

export async function actionUpdateSede(formData: FormData) {
  const parsed = sedeUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const updateData = {
    ...parsed.data,
    municipio: parsed.data.municipio ?? null,
  };
  
  await updateSede(parsed.data.id!, updateData);
  await logAction({
    action: "UPDATE",
    entity: "sede",
    entityId: parsed.data.id,
    details: `Sede actualizada: ${parsed.data.id}`,
  });
  revalidatePath("/sedes");
}

export async function actionDeleteSede(id: number) {
  await deleteSede(id);
  await logAction({
    action: "DELETE",
    entity: "sede",
    entityId: id,
    details: `Sede eliminada: ${id}`,
  });
  revalidatePath("/sedes");
}

