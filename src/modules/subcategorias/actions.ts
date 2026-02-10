"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { subcategoriaCreateSchema, subcategoriaUpdateSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createSubcategoria, deleteSubcategoria, updateSubcategoria } from "./services";

export async function actionCreateSubcategoria(formData: FormData) {
  const parsed = subcategoriaCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createSubcategoria(parsed.data);
  revalidatePath("/subcategorias");
}

export async function actionUpdateSubcategoria(formData: FormData) {
  const parsed = subcategoriaUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateSubcategoria(parsed.data.id, parsed.data);        
  revalidatePath("/subcategorias");
}

export async function actionDeleteSubcategoria(id: number) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? parseInt((session.user as { id?: string }).id ?? "0", 10) : undefined;
  await deleteSubcategoria(id, isNaN(userId ?? 0) ? undefined : userId);
  revalidatePath("/subcategorias");
}


