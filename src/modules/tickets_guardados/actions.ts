"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ticketCreateSchema, ticketUpdateSchema } from "./validations";
import { createTicket, updateTicket, deleteTicket } from "./services";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { prisma } from "../../lib/prisma";

// Tipos temporales para evitar errores de Prisma
type TicketWithSignatures = {
  firma_funcionario_entrega: string | null;
  firma_funcionario_recibe: string | null;
};

type FullTicket = {
  id: number;
  numero_ticket: string;
  fecha_salida: Date;
  fecha_estimada_devolucion: Date | null;
  elemento: string | null;
  serie: string | null;
  marca_modelo: string | null;
  cantidad: number;
  dependencia_entrega: string | null;
  firma_funcionario_entrega: string | null;
  dependencia_recibe: string | null;
  firma_funcionario_recibe: string | null;
  motivo: string | null;
  orden_numero: string | null;
  fecha_guardado: Date | null;
  usuario_guardado: string | null;
};

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
  }) as TicketWithSignatures | null;

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
  }) as TicketWithSignatures | null;

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

/**
 * Marca un ticket como entregado
 */
export async function actionMarkTicketAsReturned(id: number) {
  try {
    // Los tickets_guardados no tienen fecha_real_devolucion, 
    // solo se actualiza el motivo para indicar que fue devuelto
    await prisma.tickets_guardados.update({
      where: { id },
      data: {
        motivo: "Ticket devuelto - " + new Date().toISOString(),
      },
    });

    // Crear movimiento de devolución
    const ticket = await prisma.tickets_guardados.findUnique({
      where: { id },
    }) as FullTicket | null;

    if (ticket && ticket.elemento) {
      // Buscar el elemento por serie para obtener el ID
      const elemento = await prisma.elementos.findFirst({
        where: { serie: ticket.serie || undefined }
      });
      
      if (elemento) {
        await prisma.movimientos.create({
          data: {
            elemento_id: elemento.id,
          cantidad: ticket.cantidad,
          orden_numero: ticket.orden_numero || "",
          fecha_movimiento: new Date(),
          dependencia_entrega: ticket.dependencia_recibe || "",
          firma_funcionario_entrega: ticket.firma_funcionario_recibe,
          cargo_funcionario_entrega: "",
          dependencia_recibe: ticket.dependencia_entrega || "",
          firma_funcionario_recibe: ticket.firma_funcionario_entrega,
          cargo_funcionario_recibe: "",
          motivo: `Devolución de ticket ${ticket.numero_ticket}`,
          fecha_estimada_devolucion: new Date(),
          fecha_real_devolucion: new Date(),
          observaciones_entrega: "Devolución completada",
          observaciones_devolucion: "Elemento devuelto en buen estado",
          tipo: "DEVOLUCION",
          codigo_equipo: "",
          serial_equipo: ticket.serie || "",
          hora_entrega: new Date(),
          hora_devolucion: new Date(),
          numero_ticket: `DEV-${ticket.numero_ticket}`,
          firma_entrega: ticket.firma_funcionario_recibe,
          firma_recibe: ticket.firma_funcionario_entrega,
          firma_devuelve: ticket.firma_funcionario_recibe,
          firma_recibe_devolucion: ticket.firma_funcionario_entrega,
          devuelto_por: "Sistema",
          recibido_por: "Sistema",
        },
      });
      }
    }

    revalidatePath("/tickets");
    revalidatePath("/movimientos");
  } catch (error) {
    console.error("Error marcando ticket como devuelto:", error);
    throw new Error("Error al marcar ticket como devuelto");
  }
}

/**
 * Marca un ticket como completado
 */
export async function actionMarkTicketAsCompleted(id: number) {
  try {
    await prisma.tickets_guardados.update({
      where: { id },
      data: {
        motivo: "Ticket completado por el sistema - " + new Date().toISOString(),
      },
    });

    revalidatePath("/tickets");
  } catch (error) {
    console.error("Error completando ticket:", error);
    throw new Error("Error al completar ticket");
  }
}


