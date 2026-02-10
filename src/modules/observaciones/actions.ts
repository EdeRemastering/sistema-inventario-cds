"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { observacionCreateSchema, observacionUpdateSchema } from "./validations";
import { createObservacion, deleteObservacion, updateObservacion } from "./services";

export async function actionCreateObservacion(formData: FormData) {
  const parsed = observacionCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  const descripcion =
    parsed.data.descripcion && String(parsed.data.descripcion).trim() !== ""
      ? String(parsed.data.descripcion).trim()
      : "";
  await createObservacion({
    ...parsed.data,
    descripcion,
  });
  revalidatePath("/observaciones");
  revalidatePath("/hojas-vida");
}

export async function actionUpdateObservacion(formData: FormData) {
  const parsed = observacionUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateObservacion(parsed.data.id, parsed.data);
  revalidatePath("/observaciones");
  revalidatePath("/hojas-vida");
}

export async function actionDeleteObservacion(id: number) {
  await deleteObservacion(id);
  revalidatePath("/observaciones");
  revalidatePath("/hojas-vida");
}


