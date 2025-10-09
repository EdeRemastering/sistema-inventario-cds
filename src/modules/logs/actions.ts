"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { logCreateSchema } from "./validations";
import { createLog, deleteLog } from "./services";

export async function actionCreateLog(formData: FormData) {
  const parsed = logCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createLog(parsed.data);
  revalidatePath("/logs");
}

export async function actionDeleteLog(id: number) {
  await deleteLog(id);
  revalidatePath("/logs");
}


