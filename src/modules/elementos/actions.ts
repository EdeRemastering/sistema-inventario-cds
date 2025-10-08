"use server";

import { revalidatePath } from "next/cache";
import { elementoCreateSchema, elementoUpdateSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createElemento, deleteElemento, updateElemento } from "./services";

export async function actionCreateElemento(formData: FormData) {
  const parsed = elementoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createElemento({
    ...parsed.data,
    marca: parsed.data.marca ?? null,
    modelo: parsed.data.modelo ?? null,
    ubicacion: parsed.data.ubicacion ?? null,
    codigo_equipo: parsed.data.codigo_equipo ?? null,
    observaciones: parsed.data.observaciones ?? null,
    subcategoria_id: parsed.data.subcategoria_id ?? null,
  });
  revalidatePath("/elementos");
}

export async function actionUpdateElemento(formData: FormData) {
  const parsed = elementoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateElemento(parsed.data.id, parsed.data);
  revalidatePath("/elementos");
}

export async function actionDeleteElemento(id: number) {
  await deleteElemento(id);
  revalidatePath("/elementos");
}


