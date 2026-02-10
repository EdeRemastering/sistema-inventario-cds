"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { prestamoCreateSchema, prestamoUpdateSchema } from "./validations";
import { createPrestamo, updatePrestamo, deletePrestamo } from "./services";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { generateUniqueSavedPrestamoNumber } from "../../lib/prestamo-generator";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

type PrestamoWithSignatures = {
  firma_funcionario_entrega: string | null;
  firma_funcionario_recibe: string | null;
  ubicacion_id?: number | null;
};

export async function actionCreatePrestamo(formData: FormData) {
  try {
    const parsed = prestamoCreateSchema.safeParse(formDataToObject(formData));
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

    const numero_ticket = parsed.data.numero_ticket || await generateUniqueSavedPrestamoNumber();

    if (!numero_ticket) {
      throw new Error("Error generando número de préstamo");
    }

    const existing = await prisma.tickets_guardados.findFirst({
      where: { numero_ticket },
      select: { id: true },
    });
    if (existing) {
      throw new Error(`El número de préstamo "${numero_ticket}" ya existe`);
    }

    const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;

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

    const prestamo = await createPrestamo({
      fecha_guardado: new Date(),
      numero_ticket: numero_ticket,
      fecha_salida: parsed.data.fecha_salida,
      fecha_estimada_devolucion: parsed.data.fecha_estimada_devolucion ?? null,
      ubicacion_id: ubicacionId,
      dependencia_entrega: "Coordinación de Logística",
      persona_entrega_nombre: currentUser.nombre ?? null,
      persona_entrega_apellido: currentUser.apellido ?? null,
      firma_funcionario_entrega: currentUser.firma_url ?? null,
      dependencia_recibe: parsed.data.dependencia_recibe ?? null,
      persona_recibe_nombre: parsed.data.persona_recibe_nombre ?? null,
      persona_recibe_apellido: parsed.data.persona_recibe_apellido ?? null,
      firma_funcionario_recibe: null,
      motivo: parsed.data.motivo ?? null,
      orden_numero: parsed.data.orden_numero ?? null,
      usuario_guardado: currentUser.username ?? parsed.data.usuario_guardado ?? null,
    });

    for (const elemento of elementosUbicacion) {
      await prisma.ticket_elementos.create({
        data: {
          ticket_id: prestamo.id,
          elemento_id: elemento.id,
          cantidad: elemento.cantidad,
          elemento_nombre: `${elemento.categoria.nombre}${elemento.subcategoria ? ` - ${elemento.subcategoria.nombre}` : ""}`,
          serie: elemento.serie,
          marca_modelo: `${elemento.marca || ""} ${elemento.modelo || ""}`.trim() || null,
        },
      });
    }

    let firmaRecibeUrl = null;

    if (firma_recibe && isValidSignature(firma_recibe)) {
      try {
        firmaRecibeUrl = await saveSignature(firma_recibe, "ticket", prestamo.id, "recibe");
      } catch (error) {
        console.error("Error guardando firma de recibe:", error);
        throw new Error("Error al guardar la firma de quien recibe");
      }
    }

    if (firmaRecibeUrl) {
      await updatePrestamo(prestamo.id, {
        firma_funcionario_recibe: firmaRecibeUrl,
      });
    }

    revalidatePath("/prestamos");
  } catch (error) {
    console.error("Error en actionCreatePrestamo:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al crear préstamo";
    throw new Error(errorMessage);
  }
}

export async function actionUpdatePrestamo(formData: FormData) {
  const parsed = prestamoUpdateSchema.safeParse(formDataToObject(formData));
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

  const firma_recibe = formData.get("firma_funcionario_recibe") as string | null;

  const prestamoActual = await prisma.tickets_guardados.findUnique({
    where: { id: parsed.data.id },
    select: {
      firma_funcionario_entrega: true,
      firma_funcionario_recibe: true,
      ubicacion_id: true,
    },
  }) as PrestamoWithSignatures | null;

  let firmaRecibeUrl = null;

  if (firma_recibe && isValidSignature(firma_recibe)) {
    firmaRecibeUrl = await saveSignature(firma_recibe, "ticket", parsed.data.id, "recibe");
    if (prestamoActual?.firma_funcionario_recibe) {
      await deleteSignature(prestamoActual.firma_funcionario_recibe);
    }
  }

  const newUbicacionId = parsed.data.ubicacion_id ?? prestamoActual?.ubicacion_id ?? null;
  if (parsed.data.ubicacion_id !== undefined && parsed.data.ubicacion_id !== prestamoActual?.ubicacion_id) {
    await prisma.ticket_elementos.deleteMany({ where: { ticket_id: parsed.data.id } });
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
  await updatePrestamo(parsed.data.id, {
    ...payload,
    ubicacion_id: newUbicacionId,
    dependencia_entrega: "Coordinación de Logística",
    persona_entrega_nombre: currentUser.nombre ?? null,
    persona_entrega_apellido: currentUser.apellido ?? null,
    firma_funcionario_entrega: currentUser.firma_url ?? prestamoActual?.firma_funcionario_entrega ?? null,
    firma_funcionario_recibe: firmaRecibeUrl || prestamoActual?.firma_funcionario_recibe || null,
    usuario_guardado: currentUser.username ?? payload.usuario_guardado ?? null,
  });
  revalidatePath("/prestamos");
}

export async function actionDeletePrestamo(id: number) {
  const prestamo = await prisma.tickets_guardados.findUnique({
    where: { id },
    select: { firma_funcionario_entrega: true, firma_funcionario_recibe: true },
  }) as PrestamoWithSignatures | null;

  await deletePrestamo(id);

  if (prestamo) {
    if (prestamo.firma_funcionario_entrega) {
      await deleteSignature(prestamo.firma_funcionario_entrega);
    }
    if (prestamo.firma_funcionario_recibe) {
      await deleteSignature(prestamo.firma_funcionario_recibe);
    }
  }

  revalidatePath("/prestamos");
}

export async function actionMarkPrestamoAsReturned(id: number, firmaEntrega?: string, firmaRecibe?: string) {
  try {
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

    if (!firmaRecibe) {
      throw new Error("Se requiere la firma del solicitante para marcar el préstamo como devuelto");
    }

    if (!isValidSignature(firmaRecibe)) {
      throw new Error("La firma del solicitante no es válida. Asegúrate de firmar.");
    }

    const firmaEntregaUrl = currentUser.firma_url ?? null;
    const firmaRecibeUrl = await saveSignature(firmaRecibe, "ticket", id, "recibe");

    await prisma.tickets_guardados.update({
      where: { id },
      data: {
        motivo: "Préstamo devuelto - " + new Date().toISOString(),
        firma_funcionario_entrega: firmaEntregaUrl,
        firma_funcionario_recibe: firmaRecibeUrl,
      },
    });

    revalidatePath("/prestamos");
  } catch (error) {
    console.error("Error marcando préstamo como devuelto:", error);
    if (error instanceof Error) throw error;
    throw new Error("Error desconocido al marcar préstamo como devuelto");
  }
}

export async function actionMarkPrestamoAsCompleted(id: number) {
  try {
    await prisma.tickets_guardados.update({
      where: { id },
      data: {
        motivo: "Préstamo completado por el sistema - " + new Date().toISOString(),
      },
    });

    revalidatePath("/prestamos");
  } catch (error) {
    console.error("Error completando préstamo:", error);
    throw new Error("Error al completar préstamo");
  }
}
