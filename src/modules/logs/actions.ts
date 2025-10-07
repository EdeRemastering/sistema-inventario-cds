"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { logCreateSchema, logDeleteSchema } from "./validations";
import { createLog, deleteLog } from "./services";

export async function actionCreateLog(formData: FormData) {
  const parsed = logCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createLog(parsed.data);
  revalidatePath("/(main)/logs");
}

export async function actionDeleteLog(formData: FormData) {
  const parsed = logDeleteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await deleteLog(parsed.data.id);
  revalidatePath("/(main)/logs");
}


