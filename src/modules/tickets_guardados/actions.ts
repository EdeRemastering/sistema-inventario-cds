"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { ticketCreateSchema, ticketUpdateSchema } from "./validations";
import { createTicket, updateTicket, deleteTicket } from "./services";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { generateUniqueSavedTicketNumber } from "../../lib/ticket-generator";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

// Tipos temporales para evitar errores de Prisma
type TicketWithSignatures = {
  firma_funcionario_entrega: string | null;
  firma_funcionario_recibe: string | null;
  ubicacion_id?: number | null;
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
  try {
    const parsed = ticketCreateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      console.error("Error de validación:", parsed.error);
      throw new Error("Datos inválidos: " + JSON.stringify(parsed.error.issues));
    }

    const session = await getServerSession(authOptions);
    const currentUserId = Number(session?.user?.id ?? NaN);
    if (!Number.isFinite(currentUserId)) {
      throw new Error("No autorizado");
    }
    const currentUser = await prisma.usuarios.findUnique({
      where: { id: currentUserId },
      select: { username: true, nombre: true, apellido: true, firma_url: true },
    });
    if (!currentUser) {
      throw new Error("Usuario no encontrado");
    }
    
    // Generar número de ticket automáticamente si no se proporciona
    const numero_ticket = parsed.data.numero_ticket || await generateUniqueSavedTicketNumber();
    
    if (!numero_ticket) {
      throw new Error("Error generando número de ticket");
    }

    // Validación amigable de unicidad (además del @unique en DB)
    const existing = await prisma.tickets_guardados.findFirst({
      where: { numero_ticket },
      select: { id: true },
    });
    if (existing) {
      throw new Error(`El número de ticket "${numero_ticket}" ya existe`);
    }
    
    const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;

    // Obtener ubicación y elementos asociados (ahora se presta la ubicación)
    const ubicacionId = parsed.data.ubicacion_id;
    const ubicacion = await prisma.ubicaciones.findUnique({
      where: { id: ubicacionId },
      select: { id: true },
    });
    if (!ubicacion) {
      throw new Error("Ubicación no encontrada");
    }

    const elementosUbicacion = await prisma.elementos.findMany({
      where: { ubicacion_id: ubicacionId, activo: true },
      select: {
        id: true,
        cantidad: true,
        serie: true,
        marca: true,
        modelo: true,
        categoria: { select: { nombre: true } },
        subcategoria: { select: { nombre: true } },
      },
      orderBy: { id: "asc" },
    });
    
    // Crear el ticket primero para obtener el ID
    const ticket = await createTicket({
      fecha_guardado: new Date(),
      numero_ticket: numero_ticket,
      fecha_salida: parsed.data.fecha_salida,
      fecha_estimada_devolucion: parsed.data.fecha_estimada_devolucion ?? null,
      ubicacion_id: ubicacionId,
      // "Resuelve" (coordinación logística): se autocompleta desde el usuario logueado
      dependencia_entrega: "Coordinación de Logística",
      persona_entrega_nombre: currentUser.nombre ?? null,
      persona_entrega_apellido: currentUser.apellido ?? null,
      firma_funcionario_entrega: currentUser.firma_url ?? null,
      dependencia_recibe: parsed.data.dependencia_recibe ?? null,
      persona_recibe_nombre: parsed.data.persona_recibe_nombre ?? null,
      persona_recibe_apellido: parsed.data.persona_recibe_apellido ?? null,
      firma_funcionario_recibe: null, // Se actualizará después
      motivo: parsed.data.motivo ?? null,
      orden_numero: parsed.data.orden_numero ?? null,
      usuario_guardado: currentUser.username ?? parsed.data.usuario_guardado ?? null,
    });
    
    // Crear snapshot de elementos pertenecientes a la ubicación
    for (const elemento of elementosUbicacion) {
      await prisma.ticket_elementos.create({
        data: {
          ticket_id: ticket.id,
          elemento_id: elemento.id,
          cantidad: elemento.cantidad,
          elemento_nombre: `${elemento.categoria.nombre}${elemento.subcategoria ? ` - ${elemento.subcategoria.nombre}` : ""}`,
          serie: elemento.serie,
          marca_modelo: `${elemento.marca || ""} ${elemento.modelo || ""}`.trim() || null,
        },
      });
    }
    
    // Guardar firmas como imágenes si son válidas
    let firmaRecibeUrl = null;
    
    if (firma_recibe && isValidSignature(firma_recibe)) {
      try {
        firmaRecibeUrl = await saveSignature(firma_recibe, "ticket", ticket.id, "recibe");
      } catch (error) {
        console.error("Error guardando firma de recibe:", error);
        throw new Error("Error al guardar la firma de quien recibe");
      }
    }
    
    // Actualizar el ticket con las URLs de las firmas
    if (firmaRecibeUrl) {
      await updateTicket(ticket.id, {
        firma_funcionario_recibe: firmaRecibeUrl,
      });
    }
    
    revalidatePath("/tickets");
  } catch (error) {
    console.error("Error en actionCreateTicket:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear ticket";
    throw new Error(errorMessage);
  }
}

export async function actionUpdateTicket(formData: FormData) {
  const parsed = ticketUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    throw new Error("Datos inválidos");
  }

  const session = await getServerSession(authOptions);
  const currentUserId = Number(session?.user?.id ?? NaN);
  if (!Number.isFinite(currentUserId)) {
    throw new Error("No autorizado");
  }
  const currentUser = await prisma.usuarios.findUnique({
    where: { id: currentUserId },
    select: { username: true, nombre: true, apellido: true, firma_url: true },
  });
  if (!currentUser) {
    throw new Error("Usuario no encontrado");
  }
  
  // Extraer firmas del FormData
  const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;
  
  // Obtener el ticket actual para acceder a las firmas existentes
  const ticketActual = await prisma.tickets_guardados.findUnique({
    where: { id: parsed.data.id },
    select: {
      firma_funcionario_entrega: true,
      firma_funcionario_recibe: true,
      ubicacion_id: true,
    }
  }) as TicketWithSignatures | null;

  // Guardar nuevas firmas si son válidas
  let firmaRecibeUrl = null;
  
  if (firma_recibe && isValidSignature(firma_recibe)) {
    firmaRecibeUrl = await saveSignature(firma_recibe, "ticket", parsed.data.id, "recibe");
    // Eliminar la firma anterior si existe
    if (ticketActual?.firma_funcionario_recibe) {
      await deleteSignature(ticketActual.firma_funcionario_recibe);
    }
  }
  
  // Si cambió la ubicación, refrescar snapshot de elementos
  const newUbicacionId = parsed.data.ubicacion_id ?? ticketActual?.ubicacion_id ?? null;
  if (parsed.data.ubicacion_id !== undefined && parsed.data.ubicacion_id !== ticketActual?.ubicacion_id) {
    // Limpiar snapshot anterior
    await prisma.ticket_elementos.deleteMany({ where: { ticket_id: parsed.data.id } });
    // Crear snapshot nuevo
    const elementosUbicacion = await prisma.elementos.findMany({
      where: { ubicacion_id: parsed.data.ubicacion_id, activo: true },
      select: {
        id: true,
        cantidad: true,
        serie: true,
        marca: true,
        modelo: true,
        categoria: { select: { nombre: true } },
        subcategoria: { select: { nombre: true } },
      },
      orderBy: { id: "asc" },
    });
    for (const elemento of elementosUbicacion) {
      await prisma.ticket_elementos.create({
        data: {
          ticket_id: parsed.data.id,
          elemento_id: elemento.id,
          cantidad: elemento.cantidad,
          elemento_nombre: `${elemento.categoria.nombre}${elemento.subcategoria ? ` - ${elemento.subcategoria.nombre}` : ""}`,
          serie: elemento.serie,
          marca_modelo: `${elemento.marca || ""} ${elemento.modelo || ""}`.trim() || null,
        },
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...payload } = parsed.data;
  await updateTicket(parsed.data.id, {
    ...payload,
    ubicacion_id: newUbicacionId,
    // Resuelve (auto): siempre se alinea al usuario logueado
    dependencia_entrega: "Coordinación de Logística",
    persona_entrega_nombre: currentUser.nombre ?? null,
    persona_entrega_apellido: currentUser.apellido ?? null,
    firma_funcionario_entrega: currentUser.firma_url ?? ticketActual?.firma_funcionario_entrega ?? null,
    firma_funcionario_recibe: firmaRecibeUrl || ticketActual?.firma_funcionario_recibe || null,
    usuario_guardado: currentUser.username ?? payload.usuario_guardado ?? null,
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
    console.log("=== Iniciando actionMarkTicketAsReturned ===");
    console.log("Ticket ID:", id);
    console.log("Firma Entrega recibida:", firmaEntrega ? "Sí" : "No");
    console.log("Firma Recibe recibida:", firmaRecibe ? "Sí" : "No");
    
    const session = await getServerSession(authOptions);
    const currentUserId = Number(session?.user?.id ?? NaN);
    if (!Number.isFinite(currentUserId)) {
      throw new Error("No autorizado");
    }
    const currentUser = await prisma.usuarios.findUnique({
      where: { id: currentUserId },
      select: { firma_url: true },
    });
    if (!currentUser) throw new Error("Usuario no encontrado");

    // Verificar firma del solicitante (requerida). La firma del coordinador se toma del perfil.
    if (!firmaRecibe) {
      throw new Error("Se requiere la firma del solicitante para marcar el ticket como entregado");
    }

    // Validar que las firmas sean válidas
    console.log("Validando firma de recibe...");
    const isValidFirmaRecibe = isValidSignature(firmaRecibe);
    console.log("Firma de recibe válida:", isValidFirmaRecibe);
    
    if (!isValidFirmaRecibe) {
      throw new Error("La firma del solicitante no es válida. Asegúrate de firmar.");
    }

    // Guardar las firmas como archivos
    let firmaRecibeUrl: string;
    
    const firmaEntregaUrl = currentUser.firma_url ?? null;
    
    try {
      firmaRecibeUrl = await saveSignature(firmaRecibe, "ticket", id, "recibe");
    } catch (error) {
      console.error("Error guardando firma de recibe:", error);
      throw new Error("Error al guardar la firma de quien recibe");
    }

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

    // Nota: ya no registramos devoluciones por elemento aquí.
    // El ticket representa el préstamo de una ubicación (ambiente).

    console.log("Revalidando rutas...");
    revalidatePath("/tickets");
    
    console.log("=== Proceso completado exitosamente ===");
  } catch (error) {
    console.error("=== Error marcando ticket como devuelto ===");
    console.error("Error completo:", error);
    
    // Re-lanzar el error original para mantener el mensaje específico
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al marcar ticket como devuelto");
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


