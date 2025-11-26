"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import {
  hojaVidaCreateSchema,
  hojaVidaUpdateSchema,
  cambioElementoCreateSchema,
  cambioElementoUpdateSchema,
} from "./validations";
import {
  createHojaVida,
  updateHojaVida,
  deleteHojaVida,
  createCambioElemento,
  updateCambioElemento,
  deleteCambioElemento,
} from "./services";
import { logAction } from "../../lib/audit-logger";

// Actions para Hojas de Vida
export async function actionCreateHojaVida(formData: FormData) {
  const parsed = hojaVidaCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const hojaVida = await createHojaVida(parsed.data);
  await logAction({
    action: "CREATE",
    entity: "hoja_vida",
    entityId: hojaVida.id,
    details: `Hoja de vida creada para elemento ${parsed.data.elemento_id}`,
  });
  revalidatePath("/hojas-vida");
}

export async function actionUpdateHojaVida(formData: FormData) {
  const parsed = hojaVidaUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  await updateHojaVida(parsed.data.id!, parsed.data);
  await logAction({
    action: "UPDATE",
    entity: "hoja_vida",
    entityId: parsed.data.id,
    details: `Hoja de vida actualizada: ${parsed.data.id}`,
  });
  revalidatePath("/hojas-vida");
}

export async function actionDeleteHojaVida(id: number) {
  await deleteHojaVida(id);
  await logAction({
    action: "DELETE",
    entity: "hoja_vida",
    entityId: id,
    details: `Hoja de vida eliminada: ${id}`,
  });
  revalidatePath("/hojas-vida");
}

// Actions para Cambios de Elementos
export async function actionCreateCambioElemento(formData: FormData) {
  const parsed = cambioElementoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const cambio = await createCambioElemento(parsed.data);
  await logAction({
    action: "CREATE",
    entity: "cambio_elemento",
    entityId: cambio.id,
    details: `Cambio registrado en hoja de vida ${parsed.data.hoja_vida_id}`,
  });
  revalidatePath("/hojas-vida");
}

export async function actionUpdateCambioElemento(formData: FormData) {
  const parsed = cambioElementoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");

  await updateCambioElemento(parsed.data.id!, parsed.data);
  await logAction({
    action: "UPDATE",
    entity: "cambio_elemento",
    entityId: parsed.data.id,
    details: `Cambio actualizado: ${parsed.data.id}`,
  });
  revalidatePath("/hojas-vida");
}

export async function actionDeleteCambioElemento(id: number) {
  await deleteCambioElemento(id);
  await logAction({
    action: "DELETE",
    entity: "cambio_elemento",
    entityId: id,
    details: `Cambio eliminado: ${id}`,
  });
  revalidatePath("/hojas-vida");
}

