"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { formDataToObject } from "../../utils/form";
import { authOptions } from "@/lib/auth";
import { bajaElementoCreateSchema } from "./validations";
import { createBajaElemento, getUsuariosAutorizadores } from "./services";
import { logAction } from "../../lib/audit-logger";

export async function actionCreateBajaElemento(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("No autorizado");

  const user = session.user as { id?: string; rol?: string };
  const userId = parseInt(String(user.id), 10);
  const rol = user.rol;

  const parsed = bajaElementoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  const { autorizado_por_id } = parsed.data;

  // Verificar que el autorizador tenga rol autorizador o administrador
  const { prisma } = await import("../../lib/prisma");
  const usuariosPuedenAutorizar = await prisma.usuarios.findMany({
    where: { rol: { in: ["administrador", "autorizador"] as const }, activo: true },
    select: { id: true },
  });
  const puedeAutorizar = usuariosPuedenAutorizar.some((u) => u.id === autorizado_por_id);

  if (!puedeAutorizar) {
    throw new Error("El usuario autorizador debe tener rol Autorizador o Administrador");
  }

  // Solo administrador o autorizador pueden crear bajas (el que autoriza puede ser distinto al que solicita)
  if (rol !== "administrador" && rol !== "autorizador") {
    throw new Error("Solo administrador o autorizador pueden dar de baja elementos");
  }

  await createBajaElemento({
    ...parsed.data,
    autorizado_por_id,
    creado_por_id: userId,
  });

  await logAction({
    action: "CREATE",
    entity: "baja_elemento",
    entityId: parsed.data.elemento_id,
    details: `Baja registrada para elemento ${parsed.data.elemento_id}`,
  });

  revalidatePath("/elementos");
  revalidatePath("/bajas");
}

export async function actionGetAutorizadores() {
  return getUsuariosAutorizadores();
}
