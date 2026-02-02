"use server";

import { revalidatePath } from "next/cache";
import { createUsuarioSchema, updateUsuarioSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { createUsuario, deleteUsuario, updateUsuario } from "./services";
import { prisma } from "../../lib/prisma";
import { isValidSignature, saveSignature, deleteSignature } from "../../lib/signature-storage";

export async function actionCreateUsuario(formData: FormData) {
  const parsed = createUsuarioSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const firma = formData.get("firma") as string | null;
  if (!firma || !isValidSignature(firma)) {
    throw new Error("Firma inválida o vacía");
  }

  // Crear usuario primero (necesitamos ID para nombrar archivo de firma)
  const usuario = await createUsuario({
    username: parsed.data.username,
    password: parsed.data.password,
    nombre: parsed.data.nombre,
    apellido: parsed.data.apellido,
    rol: parsed.data.rol,
    activo: parsed.data.activo,
  });

  const firmaUrl = await saveSignature(firma, "usuario", usuario.id, "perfil");
  await updateUsuario({ id: usuario.id, firma_url: firmaUrl });

  revalidatePath("/usuarios");
}

export async function actionUpdateUsuario(formData: FormData) {
  const parsed = updateUsuarioSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const firma = formData.get("firma") as string | null;

  if (firma && isValidSignature(firma)) {
    const usuarioActual = await prisma.usuarios.findUnique({
      where: { id: parsed.data.id },
      select: { firma_url: true },
    });
    const firmaUrl = await saveSignature(firma, "usuario", parsed.data.id, "perfil");
    await updateUsuario({
      ...parsed.data,
      firma_url: firmaUrl,
    });

    if (usuarioActual?.firma_url) {
      await deleteSignature(usuarioActual.firma_url);
    }
  } else {
    await updateUsuario(parsed.data);
  }

  revalidatePath("/usuarios");
}

export async function actionDeleteUsuario(id: number) {
  await deleteUsuario(id);
  revalidatePath("/usuarios");
}

