"use server";

import { revalidatePath } from "next/cache";
import { createUsuarioSchema, updateUsuarioSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createUsuario, deleteUsuario, updateUsuario } from "./services";

export async function actionCreateUsuario(formData: FormData) {
  const parsed = createUsuarioSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createUsuario(parsed.data);
  revalidatePath("/usuarios");
}

export async function actionUpdateUsuario(formData: FormData) {
  const parsed = updateUsuarioSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateUsuario(parsed.data);
  revalidatePath("/usuarios");
}

export async function actionDeleteUsuario(id: number) {
  await deleteUsuario(id);
  revalidatePath("/usuarios");
}

