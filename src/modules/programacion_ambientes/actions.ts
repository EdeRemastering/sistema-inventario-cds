"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { createProgramacionAmbiente, updateProgramacionAmbiente, deleteProgramacionAmbiente } from "./services";
import { programacionAmbienteCreateSchema, programacionAmbienteUpdateSchema } from "./validations";

export async function actionCreateProgramacionAmbiente(formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = programacionAmbienteCreateSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ");
    throw new Error(msg || "Datos inválidos");
  }
  const data = parsed.data;
  await createProgramacionAmbiente({
    ubicacion_id: data.ubicacion_id,
    fecha: data.fecha,
    hora_inicio: data.hora_inicio,
    hora_fin: data.hora_fin,
    docente_id_q10: data.docente_id_q10 || null,
    descripcion: data.descripcion || null,
    ocupado: data.ocupado,
  });
  revalidatePath("/programacion-ambientes");
}

export async function actionUpdateProgramacionAmbiente(formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = programacionAmbienteUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ");
    throw new Error(msg || "Datos inválidos");
  }
  const { id, ...rest } = parsed.data;
  await updateProgramacionAmbiente(id, rest);
  revalidatePath("/programacion-ambientes");
}

export async function actionDeleteProgramacionAmbiente(id: number) {
  await deleteProgramacionAmbiente(id);
  revalidatePath("/programacion-ambientes");
}
