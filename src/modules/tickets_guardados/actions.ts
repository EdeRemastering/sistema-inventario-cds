"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ticketCreateSchema, ticketUpdateSchema } from "./validations";
import { createTicket, updateTicket, deleteTicket } from "./services";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { generateUniqueSavedTicketNumber } from "../../lib/ticket-generator";
import { prisma } from "../../lib/prisma";

// Tipos temporales para evitar errores de Prisma
type TicketWithSignatures = {
  firma_funcionario_entrega: string | null;
  firma_funcionario_recibe: string | null;
};

// type FullTicket = {
//   id: number;
//   numero_ticket: string;
//   fecha_salida: Date;
//   fecha_estimada_devolucion: Date | null;
//   elemento: string | null;
//   serie: string | null;
//   marca_modelo: string | null;
//   cantidad: number;
//   dependencia_entrega: string | null;
//   firma_funcionario_entrega: string | null;
//   dependencia_recibe: string | null;
//   firma_funcionario_recibe: string | null;
//   motivo: string | null;
//   orden_numero: string | null;
//   fecha_guardado: Date | null;
//   usuario_guardado: string | null;
// };

export async function actionCreateTicket(formData: FormData) {
  const parsed = ticketCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  // Generar número de ticket automáticamente si no se proporciona
  const numero_ticket = parsed.data.numero_ticket || await generateUniqueSavedTicketNumber();
  
  if (!numero_ticket) {
    throw new Error("Error generando número de ticket");
  }
  
  // Extraer firmas del FormData
  const firma_entrega = formData.get("firma_funcionario_entrega") as string | null;
  const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;
  
  // Extraer elementos del FormData
  const elementosData = formData.get("elementos") as string | null;
  let elementos = [];
  
  if (elementosData) {
    try {
      elementos = JSON.parse(elementosData);
    } catch (error) {
      console.error("Error parsing elementos:", error);
      throw new Error("Error procesando elementos del ticket");
    }
  }
  
  if (elementos.length === 0) {
    throw new Error("Debe agregar al menos un elemento al ticket");
  }
  
  // Crear el ticket primero para obtener el ID
  const ticket = await createTicket({
    fecha_guardado: new Date(),
    numero_ticket: numero_ticket,
    fecha_salida: parsed.data.fecha_salida,
    fecha_estimada_devolucion: parsed.data.fecha_estimada_devolucion ?? null,
    dependencia_entrega: parsed.data.dependencia_entrega ?? null,
    persona_entrega_nombre: parsed.data.persona_entrega_nombre ?? null,
    persona_entrega_apellido: parsed.data.persona_entrega_apellido ?? null,
    firma_funcionario_entrega: null, // Se actualizará después
    dependencia_recibe: parsed.data.dependencia_recibe ?? null,
    persona_recibe_nombre: parsed.data.persona_recibe_nombre ?? null,
    persona_recibe_apellido: parsed.data.persona_recibe_apellido ?? null,
    firma_funcionario_recibe: null, // Se actualizará después
    motivo: parsed.data.motivo ?? null,
    orden_numero: parsed.data.orden_numero ?? null,
    usuario_guardado: parsed.data.usuario_guardado ?? null,
  });
  
  // Crear los elementos del ticket
  for (const elemento of elementos) {
    await prisma.ticket_elementos.create({
      data: {
        ticket_id: ticket.id,
        elemento_id: elemento.elemento_id,
        cantidad: elemento.cantidad,
        elemento_nombre: elemento.elemento_nombre,
        serie: elemento.serie,
        marca_modelo: elemento.marca_modelo,
      },
    });
  }
  
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
export async function actionMarkTicketAsReturned(id: number, firmaEntrega?: string, firmaRecibe?: string) {
  try {
    // Verificar que se proporcionen las firmas requeridas
    if (!firmaEntrega || !firmaRecibe) {
      throw new Error("Se requieren las firmas de entrega y recepción para marcar el ticket como entregado");
    }

    // Validar que las firmas sean válidas
    if (!isValidSignature(firmaEntrega) || !isValidSignature(firmaRecibe)) {
      throw new Error("Las firmas proporcionadas no son válidas");
    }

    // Guardar las firmas como archivos
    const firmaEntregaUrl = await saveSignature(firmaEntrega, "ticket", id, "entrega");
    const firmaRecibeUrl = await saveSignature(firmaRecibe, "ticket", id, "recibe");

    // Los tickets_guardados no tienen fecha_real_devolucion, 
    // solo se actualiza el motivo para indicar que fue devuelto
    await prisma.tickets_guardados.update({
      where: { id },
      data: {
        motivo: "Ticket devuelto - " + new Date().toISOString(),
        firma_funcionario_entrega: firmaEntregaUrl,
        firma_funcionario_recibe: firmaRecibeUrl,
      },
    });

    // Obtener el ticket con sus elementos
    const ticket = await prisma.tickets_guardados.findUnique({
      where: { id },
      include: {
        ticket_elementos: {
          include: {
            elemento: true,
          },
        },
      },
    });

    if (ticket) {
      // Para tickets nuevos con múltiples elementos
      if (ticket.ticket_elementos && ticket.ticket_elementos.length > 0) {
        for (const ticketElemento of ticket.ticket_elementos) {
          await prisma.movimientos.create({
            data: {
              elemento_id: ticketElemento.elemento_id,
              cantidad: ticketElemento.cantidad,
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
              serial_equipo: ticketElemento.serie || "",
              hora_entrega: new Date(),
              hora_devolucion: new Date(),
              numero_ticket: `DEV-${ticket.numero_ticket}-${ticketElemento.elemento_id}`,
              firma_entrega: ticket.firma_funcionario_recibe,
              firma_recibe: ticket.firma_funcionario_entrega,
              firma_devuelve: ticket.firma_funcionario_recibe,
              firma_recibe_devolucion: ticket.firma_funcionario_entrega,
              devuelto_por: "Sistema",
              recibido_por: "Sistema",
            },
          });
        }
      } else {
        // Para tickets antiguos (compatibilidad)
        // Buscar el elemento por serie para obtener el ID
        const elemento = await prisma.elementos.findFirst({
          where: { serie: (ticket as Record<string, unknown>).serie as string || undefined }
        });
        
        if (elemento) {
          await prisma.movimientos.create({
            data: {
              elemento_id: elemento.id,
              cantidad: (ticket as Record<string, unknown>).cantidad as number || 1,
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
              serial_equipo: (ticket as Record<string, unknown>).serie as string || "",
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


