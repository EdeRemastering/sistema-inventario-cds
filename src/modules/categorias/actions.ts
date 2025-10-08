"use server";

import { revalidatePath } from "next/cache";
import { categoriaCreateSchema, categoriaUpdateSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createCategoria, deleteCategoria, updateCategoria } from "./services";

export async function actionCreateCategoria(formData: FormData) {
  const parsed = categoriaCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createCategoria({
    nombre: parsed.data.nombre,
    descripcion: parsed.data.descripcion ?? null,
    estado: parsed.data.estado,
  });
  revalidatePath("/categorias");
}

export async function actionUpdateCategoria(formData: FormData) {
  const parsed = categoriaUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateCategoria(parsed.data.id, parsed.data);
  revalidatePath("/categorias");
}

export async function actionDeleteCategoria(id: number) {
  await deleteCategoria(id);
  revalidatePath("/categorias");
}


