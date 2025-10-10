"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { movimientoCreateSchema, movimientoUpdateSchema } from "./validations";
import { createMovimiento, deleteMovimiento, updateMovimiento } from "./services";
import { logAction } from "../../lib/audit-logger";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { prisma } from "../../lib/prisma";

export async function actionCreateMovimiento(formData: FormData) {
  const parsed = movimientoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  // Extraer firmas del FormData
  const firma_entrega = formData.get("firma_entrega") as string | null;
  const firma_recibe = formData.get("firma_recibe") as string | null;
  
  // Crear el movimiento primero para obtener el ID
  const movimiento = await createMovimiento({
    cargo_funcionario_entrega: parsed.data.cargo_funcionario_entrega || null,
    cargo_funcionario_recibe: parsed.data.cargo_funcionario_recibe || null,
    fecha_real_devolucion: null,
    observaciones_entrega: parsed.data.observaciones_entrega || null,
    observaciones_devolucion: null,
    firma_recepcion: null,
    firma_entrega: firma_entrega || null,
    firma_recibe: firma_recibe || null,
    codigo_equipo: null,
    serial_equipo: null,
    hora_entrega: null,
    hora_devolucion: null,
    firma_devuelve: null,
    firma_recibe_devolucion: null,
    devuelto_por: null,
    recibido_por: null,
    firma_funcionario_entrega: null, // Se actualizará después
    firma_funcionario_recibe: null, // Se actualizará después
    ...parsed.data,
  });
  
  // Guardar firmas como imágenes si son válidas
  let firmaEntregaUrl = null;
  let firmaRecibeUrl = null;
  
  if (firma_entrega && isValidSignature(firma_entrega)) {
    firmaEntregaUrl = await saveSignature(firma_entrega, "movimiento", movimiento.id, "entrega");
  }
  
  if (firma_recibe && isValidSignature(firma_recibe)) {
    firmaRecibeUrl = await saveSignature(firma_recibe, "movimiento", movimiento.id, "recibe");
  }
  
  // Actualizar el movimiento con las URLs de las firmas
  if (firmaEntregaUrl || firmaRecibeUrl) {
    await updateMovimiento(movimiento.id, {
      firma_funcionario_entrega: firmaEntregaUrl,
      firma_funcionario_recibe: firmaRecibeUrl,
    });
  }
  
  // Log de auditoría
  await logAction({
    action: "CREATE",
    entity: "movimiento",
    entityId: movimiento.id,
    details: `Movimiento creado: ${movimiento.numero_ticket} - ${parsed.data.tipo}`,
  });

  revalidatePath("/movimientos");
}

export async function actionUpdateMovimiento(formData: FormData) {
  const parsed = movimientoUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  // Extraer firmas del FormData
  const firma_entrega = formData.get("firma_entrega") as string | null;
  const firma_recibe = formData.get("firma_recibe") as string | null;
  
  // Obtener el movimiento actual para acceder a las firmas existentes
  const movimientoActual = await prisma.movimientos.findUnique({
    where: { id: parsed.data.id },
    select: { firma_funcionario_entrega: true, firma_funcionario_recibe: true }
  });

  // Guardar nuevas firmas si son válidas
  let firmaEntregaUrl = null;
  let firmaRecibeUrl = null;
  
  if (firma_entrega && isValidSignature(firma_entrega)) {
    firmaEntregaUrl = await saveSignature(firma_entrega, "movimiento", parsed.data.id, "entrega");
    // Eliminar la firma anterior si existe
    if (movimientoActual?.firma_funcionario_entrega) {
      await deleteSignature(movimientoActual.firma_funcionario_entrega);
    }
  }
  
  if (firma_recibe && isValidSignature(firma_recibe)) {
    firmaRecibeUrl = await saveSignature(firma_recibe, "movimiento", parsed.data.id, "recibe");
    // Eliminar la firma anterior si existe
    if (movimientoActual?.firma_funcionario_recibe) {
      await deleteSignature(movimientoActual.firma_funcionario_recibe);
    }
  }
  
  await updateMovimiento(parsed.data.id, {
    ...parsed.data,
    firma_funcionario_entrega: firmaEntregaUrl || movimientoActual?.firma_funcionario_entrega || null,
    firma_funcionario_recibe: firmaRecibeUrl || movimientoActual?.firma_funcionario_recibe || null,
  });
  revalidatePath("/movimientos");
}

export async function actionDeleteMovimiento(id: number) {
  // Obtener el movimiento para acceder a las firmas antes de eliminarlo
  const movimiento = await prisma.movimientos.findUnique({
    where: { id },
    select: { firma_funcionario_entrega: true, firma_funcionario_recibe: true }
  });

  await deleteMovimiento(id);

  // Eliminar las firmas del sistema de archivos
  if (movimiento) {
    if (movimiento.firma_funcionario_entrega) {
      await deleteSignature(movimiento.firma_funcionario_entrega);
    }
    if (movimiento.firma_funcionario_recibe) {
      await deleteSignature(movimiento.firma_funcionario_recibe);
    }
  }

  // Log de auditoría
  await logAction({
    action: "DELETE",
    entity: "movimiento",
    entityId: id,
    details: `Movimiento eliminado ID: ${id}`,
  });

  revalidatePath("/movimientos");
}


