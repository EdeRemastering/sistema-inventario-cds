"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { movimientoCreateSchema, movimientoUpdateSchema } from "./validations";
import { createMovimiento, deleteMovimiento, updateMovimiento } from "./services";
import { logAction } from "../../lib/audit-logger";

export async function actionCreateMovimiento(formData: FormData) {
  const parsed = movimientoCreateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  // Extraer firmas del FormData
  const firma_entrega = formData.get("firma_entrega") as string | null;
  const firma_recibe = formData.get("firma_recibe") as string | null;
  
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
    ...parsed.data,
  });
  
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
  
  await updateMovimiento(parsed.data.id, {
    ...parsed.data,
    firma_entrega: firma_entrega || null,
    firma_recibe: firma_recibe || null,
  });
  revalidatePath("/movimientos");
}

export async function actionDeleteMovimiento(id: number) {
  await deleteMovimiento(id);
  
  // Log de auditoría
  await logAction({
    action: "DELETE",
    entity: "movimiento",
    entityId: id,
    details: `Movimiento eliminado ID: ${id}`,
  });
  
  revalidatePath("/movimientos");
}


