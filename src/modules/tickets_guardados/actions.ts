"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ticketCreateSchema, ticketUpdateSchema, ticketDeleteSchema } from "./validations";
import { createTicket, updateTicket, deleteTicket } from "./services";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { prisma } from "../../lib/prisma";

export async function actionCreateTicket(formData: FormData) {
  const parsed = ticketCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  // Extraer firmas del FormData
  const firma_entrega = formData.get("firma_funcionario_entrega") as string | null;
  const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;
  
  // Crear el ticket primero para obtener el ID
  const ticket = await createTicket({
    fecha_guardado: new Date(),
    numero_ticket: parsed.data.numero_ticket,
    fecha_salida: parsed.data.fecha_salida,
    fecha_estimada_devolucion: parsed.data.fecha_estimada_devolucion ?? null,
    elemento: parsed.data.elemento ?? null,
    serie: parsed.data.serie ?? null,
    marca_modelo: parsed.data.marca_modelo ?? null,
    cantidad: parsed.data.cantidad,
    dependencia_entrega: parsed.data.dependencia_entrega ?? null,
    firma_funcionario_entrega: null, // Se actualizará después
    dependencia_recibe: parsed.data.dependencia_recibe ?? null,
    firma_funcionario_recibe: null, // Se actualizará después
    motivo: parsed.data.motivo ?? null,
    orden_numero: parsed.data.orden_numero ?? null,
    usuario_guardado: parsed.data.usuario_guardado ?? null,
  });
  
  // Guardar firmas como imágenes si son válidas
  let firmaEntregaUrl = null;
  let firmaRecibeUrl = null;
  
  if (firma_entrega && isValidSignature(firma_entrega)) {
    firmaEntregaUrl = await saveSignature(firma_entrega, "ticket", ticket.id, "entrega");
  }
  
  if (firma_recibe && isValidSignature(firma_recibe)) {
    firmaRecibeUrl = await saveSignature(firma_recibe, "ticket", ticket.id, "recibe");
  }
  
  // Actualizar el ticket con las URLs de las firmas
  if (firmaEntregaUrl || firmaRecibeUrl) {
    await updateTicket(ticket.id, {
      firma_funcionario_entrega: firmaEntregaUrl,
      firma_funcionario_recibe: firmaRecibeUrl,
    });
  }
  
  revalidatePath("/tickets");
}

export async function actionUpdateTicket(formData: FormData) {
  const parsed = ticketUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }
  
  // Extraer firmas del FormData
  const firma_entrega = formData.get("firma_funcionario_entrega") as string | null;
  const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;
  
  // Obtener el ticket actual para acceder a las firmas existentes
  const ticketActual = await prisma.tickets_guardados.findUnique({
    where: { id: parsed.data.id },
    select: { firma_funcionario_entrega: true, firma_funcionario_recibe: true }
  });

  // Guardar nuevas firmas si son válidas
  let firmaEntregaUrl = null;
  let firmaRecibeUrl = null;
  
  if (firma_entrega && isValidSignature(firma_entrega)) {
    firmaEntregaUrl = await saveSignature(firma_entrega, "ticket", parsed.data.id, "entrega");
    // Eliminar la firma anterior si existe
    if (ticketActual?.firma_funcionario_entrega) {
      await deleteSignature(ticketActual.firma_funcionario_entrega);
    }
  }
  
  if (firma_recibe && isValidSignature(firma_recibe)) {
    firmaRecibeUrl = await saveSignature(firma_recibe, "ticket", parsed.data.id, "recibe");
    // Eliminar la firma anterior si existe
    if (ticketActual?.firma_funcionario_recibe) {
      await deleteSignature(ticketActual.firma_funcionario_recibe);
    }
  }
  
  await updateTicket(parsed.data.id, {
    ...parsed.data,
    firma_funcionario_entrega: firmaEntregaUrl || ticketActual?.firma_funcionario_entrega || null,
    firma_funcionario_recibe: firmaRecibeUrl || ticketActual?.firma_funcionario_recibe || null,
  });
  revalidatePath("/tickets");
}

export async function actionDeleteTicket(id: number) {
  // Obtener el ticket para acceder a las firmas antes de eliminarlo
  const ticket = await prisma.tickets_guardados.findUnique({
    where: { id },
    select: { firma_funcionario_entrega: true, firma_funcionario_recibe: true }
  });

  await deleteTicket(id);

  // Eliminar las firmas del sistema de archivos
  if (ticket) {
    if (ticket.firma_funcionario_entrega) {
      await deleteSignature(ticket.firma_funcionario_entrega);
    }
    if (ticket.firma_funcionario_recibe) {
      await deleteSignature(ticket.firma_funcionario_recibe);
    }
  }

  revalidatePath("/tickets");
}


