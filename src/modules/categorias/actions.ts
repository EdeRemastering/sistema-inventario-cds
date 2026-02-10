"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
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
  const session = await getServerSession(authOptions);
  const userId = session?.user ? parseInt((session.user as { id?: string }).id ?? "0", 10) : undefined;
  await deleteCategoria(id, isNaN(userId ?? 0) ? undefined : userId);
  revalidatePath("/categorias");
}

// Listado desde cliente sin usar servicios directamente en cliente
export async function actionListCategorias() {
  "use server";
  const list = await (await import("./services")).listCategorias();
  return list;
}


