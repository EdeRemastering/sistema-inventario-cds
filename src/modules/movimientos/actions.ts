"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { movimientoCreateSchema, movimientoUpdateSchema } from "./validations";
import { createMovimiento, deleteMovimiento, updateMovimiento } from "./services";

export async function actionCreateMovimiento(formData: FormData) {
  const parsed = movimientoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createMovimiento({
    cargo_funcionario_entrega: null,
    cargo_funcionario_recibe: null,
    fecha_real_devolucion: null,
    observaciones_entrega: null,
    observaciones_devolucion: null,
    firma_recepcion: null,
    firma_entrega: null,
    firma_recibe: null,
    codigo_equipo: null,
    serial_equipo: null,
    hora_entrega: null,
    hora_devolucion: null,
    numero_ticket: parsed.data.numero_ticket ?? "",
    firma_devuelve: null,
    firma_recibe_devolucion: null,
    devuelto_por: null,
    recibido_por: null,
    ...parsed.data,
  });
  revalidatePath("/movimientos");
}

export async function actionUpdateMovimiento(formData: FormData) {
  const parsed = movimientoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await updateMovimiento(parsed.data.id, parsed.data);
  revalidatePath("/movimientos");
}

export async function actionDeleteMovimiento(id: number) {
  await deleteMovimiento(id);
  revalidatePath("/movimientos");
}


