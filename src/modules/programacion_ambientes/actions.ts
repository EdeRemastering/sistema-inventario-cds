"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { createProgramacionAmbiente, updateProgramacionAmbiente, deleteProgramacionAmbiente } from "./services";

const schema = {
  ubicacion_id: (v: unknown) => (typeof v === "string" ? parseInt(v, 10) : Number(v)),
  fecha: (v: unknown) => (v ? new Date(v as string) : new Date()),
  hora_inicio: (v: unknown) => String(v ?? "08:00"),
  hora_fin: (v: unknown) => String(v ?? "09:00"),
  docente_id_q10: (v: unknown) => (v && String(v).trim() ? String(v).trim() : null),
  descripcion: (v: unknown) => (v && String(v).trim() ? String(v).trim() : null),
  ocupado: (v: unknown) => v === true || v === "true",
};

export async function actionCreateProgramacionAmbiente(formData: FormData) {
  const data = formDataToObject(formData);
  await createProgramacionAmbiente({
    ubicacion_id: schema.ubicacion_id(data.ubicacion_id),
    fecha: schema.fecha(data.fecha),
    hora_inicio: schema.hora_inicio(data.hora_inicio),
    hora_fin: schema.hora_fin(data.hora_fin),
    docente_id_q10: schema.docente_id_q10(data.docente_id_q10),
    descripcion: schema.descripcion(data.descripcion),
    ocupado: schema.ocupado(data.ocupado),
  });
  revalidatePath("/programacion-ambientes");
}

export async function actionUpdateProgramacionAmbiente(formData: FormData) {
  const data = formDataToObject(formData);
  const id = parseInt(String(data.id), 10);
  if (!id) throw new Error("ID requerido");
  await updateProgramacionAmbiente(id, {
    ubicacion_id: data.ubicacion_id !== undefined ? schema.ubicacion_id(data.ubicacion_id) : undefined,
    fecha: data.fecha !== undefined ? schema.fecha(data.fecha) : undefined,
    hora_inicio: data.hora_inicio !== undefined ? schema.hora_inicio(data.hora_inicio) : undefined,
    hora_fin: data.hora_fin !== undefined ? schema.hora_fin(data.hora_fin) : undefined,
    docente_id_q10: data.docente_id_q10 !== undefined ? schema.docente_id_q10(data.docente_id_q10) : undefined,
    descripcion: data.descripcion !== undefined ? schema.descripcion(data.descripcion) : undefined,
    ocupado: data.ocupado !== undefined ? schema.ocupado(data.ocupado) : undefined,
  });
  revalidatePath("/programacion-ambientes");
}

export async function actionDeleteProgramacionAmbiente(id: number) {
  await deleteProgramacionAmbiente(id);
  revalidatePath("/programacion-ambientes");
}
