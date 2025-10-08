"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ticketCreateSchema, ticketUpdateSchema, ticketDeleteSchema } from "./validations";
import { createTicket, updateTicket, deleteTicket } from "./services";

export async function actionCreateTicket(formData: FormData) {
  const parsed = ticketCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  await createTicket({
    fecha_guardado: new Date(),
    numero_ticket: parsed.data.numero_ticket,
    fecha_salida: parsed.data.fecha_salida,
    fecha_estimada_devolucion: parsed.data.fecha_estimada_devolucion ?? null,
    elemento: parsed.data.elemento ?? null,
    serie: parsed.data.serie ?? null,
    marca_modelo: parsed.data.marca_modelo ?? null,
    cantidad: parsed.data.cantidad,
    dependencia_entrega: parsed.data.dependencia_entrega ?? null,
    funcionario_entrega: parsed.data.funcionario_entrega ?? null,
    dependencia_recibe: parsed.data.dependencia_recibe ?? null,
    funcionario_recibe: parsed.data.funcionario_recibe ?? null,
    motivo: parsed.data.motivo ?? null,
    orden_numero: parsed.data.orden_numero ?? null,
    usuario_guardado: parsed.data.usuario_guardado ?? null,
  });
  revalidatePath("/tickets");
}

export async function actionUpdateTicket(formData: FormData) {
  const parsed = ticketUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }
  await updateTicket(parsed.data.id, parsed.data);
  revalidatePath("/tickets");
}

export async function actionDeleteTicket(id: number) {
  await deleteTicket(id);
  revalidatePath("/tickets");
}


