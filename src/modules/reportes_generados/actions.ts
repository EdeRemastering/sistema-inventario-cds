"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { reporteCreateSchema } from "./validations";
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

export async function actionCreateReporteGenerado(data: {
  tipo_reporte: string;
  nombre_archivo: string;
  contenido_pdf?: Uint8Array;
  generado_por?: string;
}) {
  try {
    await createReporte(data);
    revalidatePath("/reportes");
    return { success: true, message: "Reporte guardado en historial" };
  } catch (error) {
    console.error("Error creating reporte generado:", error);
    return { success: false, message: "Error al guardar el reporte en historial" };
  }
}


