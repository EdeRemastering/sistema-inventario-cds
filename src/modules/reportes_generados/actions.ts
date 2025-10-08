"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { reporteCreateSchema, reporteDeleteSchema } from "./validations";
import { createReporte, deleteReporte } from "./services";

export async function actionCreateReporte(formData: FormData) {
  const parsed = reporteCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createReporte(parsed.data);
  revalidatePath("/reportes");
}

export async function actionDeleteReporte(id: number) {
  await deleteReporte(id);
  revalidatePath("/reportes");
}


