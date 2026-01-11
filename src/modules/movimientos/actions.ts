"use server";

import { revalidatePath } from "next/cache";
import { formDataToObject } from "../../utils/form";
import { movimientoCreateSchema, movimientoUpdateSchema } from "./validations";
import { createMovimiento, deleteMovimiento, updateMovimiento } from "./services";
import { logAction } from "../../lib/audit-logger";
import { saveSignature, isValidSignature, deleteSignature } from "../../lib/signature-storage";
import { prisma } from "../../lib/prisma";
import { validateStock } from "../../lib/stock-control";

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
    ubicacion_anterior_id: parsed.data.ubicacion_anterior_id === "" || parsed.data.ubicacion_anterior_id === undefined 
      ? null 
      : (typeof parsed.data.ubicacion_anterior_id === "number" ? parsed.data.ubicacion_anterior_id : Number(parsed.data.ubicacion_anterior_id) || null),
    ubicacion_nueva_id: parsed.data.ubicacion_nueva_id === "" || parsed.data.ubicacion_nueva_id === undefined 
      ? null 
      : (typeof parsed.data.ubicacion_nueva_id === "number" ? parsed.data.ubicacion_nueva_id : Number(parsed.data.ubicacion_nueva_id) || null),
    usuario: parsed.data.usuario === "" ? null : parsed.data.usuario || null,
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
  
  // Convertir ubicaciones de string a number si es necesario
  const ubicacionAnteriorId = parsed.data.ubicacion_anterior_id === "" || parsed.data.ubicacion_anterior_id === undefined
    ? null
    : (typeof parsed.data.ubicacion_anterior_id === "number" 
        ? parsed.data.ubicacion_anterior_id 
        : Number(parsed.data.ubicacion_anterior_id) || null);
  
  const ubicacionNuevaId = parsed.data.ubicacion_nueva_id === "" || parsed.data.ubicacion_nueva_id === undefined
    ? null
    : (typeof parsed.data.ubicacion_nueva_id === "number" 
        ? parsed.data.ubicacion_nueva_id 
        : Number(parsed.data.ubicacion_nueva_id) || null);
  
  await updateMovimiento(parsed.data.id, {
    ...parsed.data,
    firma_funcionario_entrega: firmaEntregaUrl || movimientoActual?.firma_funcionario_entrega || null,
    firma_funcionario_recibe: firmaRecibeUrl || movimientoActual?.firma_funcionario_recibe || null,
    ubicacion_anterior_id: ubicacionAnteriorId,
    ubicacion_nueva_id: ubicacionNuevaId,
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

export async function actionValidateStock(elementoId: number, requestedQuantity: number) {
  try {
    const result = await validateStock(elementoId, requestedQuantity);
    return result;
  } catch (error) {
    console.error("Error en actionValidateStock:", error);
    return {
      isValid: false,
      availableQuantity: 0,
      requestedQuantity,
      message: "Error al validar stock",
    };
  }
}

export async function actionBuscarPrestamoPorTicket(numero_ticket: string) {
  try {
    const { findMovimientoByTicket } = await import("./services");
    const movimiento = await findMovimientoByTicket(numero_ticket);
    
    if (!movimiento) {
      throw new Error("Préstamo no encontrado o ya fue devuelto");
    }

    if (!movimiento.elemento) {
      throw new Error("Elemento del préstamo no encontrado");
    }
    
    return {
      id: movimiento.id,
      numero_ticket: movimiento.numero_ticket,
      fecha_movimiento: movimiento.fecha_movimiento,
      cantidad: movimiento.cantidad,
      elemento: {
        id: movimiento.elemento.id,
        serie: movimiento.elemento.serie,
        marca: movimiento.elemento.marca,
        modelo: movimiento.elemento.modelo,
      },
      dependencia_entrega: movimiento.dependencia_entrega,
      funcionario_entrega: movimiento.firma_funcionario_entrega || "",
      dependencia_recibe: movimiento.dependencia_recibe,
      funcionario_recibe: movimiento.firma_funcionario_recibe || "",
      fecha_estimada_devolucion: movimiento.fecha_estimada_devolucion,
      motivo: movimiento.motivo,
    };
  } catch (error) {
    console.error("Error buscando préstamo:", error);
    throw error instanceof Error ? error : new Error("Error al buscar el préstamo");
  }
}

export async function actionDevolver(formData: FormData) {
  try {
    const { devolucionSchema } = await import("./validations");
    const parsed = devolucionSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) {
      const errorMessage = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Datos inválidos para la devolución: ${errorMessage}`);
    }

    // Extraer firmas del FormData
    const firma_devuelve = formData.get("firma_devuelve") as string | null;
    const firma_recibe_devolucion = formData.get("firma_recibe_devolucion") as string | null;

    // Validar que las firmas estén presentes
    if (!firma_devuelve || !firma_recibe_devolucion) {
      throw new Error("Se requieren ambas firmas para completar la devolución");
    }

    // Verificar que el movimiento existe
    const movimiento = await prisma.movimientos.findUnique({
      where: { id: parsed.data.id },
    });

    if (!movimiento) {
      throw new Error("Movimiento no encontrado");
    }

    if (movimiento.fecha_real_devolucion) {
      throw new Error("Este movimiento ya fue devuelto");
    }

    // Validar firmas
    if (!isValidSignature(firma_devuelve)) {
      throw new Error("La firma de quien devuelve no es válida");
    }

    if (!isValidSignature(firma_recibe_devolucion)) {
      throw new Error("La firma de quien recibe no es válida");
    }

    // Guardar firmas como imágenes
    let firmaDevuelveUrl: string | null = null;
    let firmaRecibeDevolucionUrl: string | null = null;

    try {
      firmaDevuelveUrl = await saveSignature(
        firma_devuelve,
        "movimiento",
        parsed.data.id,
        "devuelve"
      );
    } catch (error) {
      console.error("Error guardando firma de quien devuelve:", error);
      throw new Error("Error al guardar la firma de quien devuelve");
    }

    try {
      firmaRecibeDevolucionUrl = await saveSignature(
        firma_recibe_devolucion,
        "movimiento",
        parsed.data.id,
        "recibe_devolucion"
      );
    } catch (error) {
      console.error("Error guardando firma de quien recibe:", error);
      throw new Error("Error al guardar la firma de quien recibe");
    }

    // Actualizar el movimiento con la devolución
    // El stock se recalcula automáticamente al marcar fecha_real_devolucion
    await updateMovimiento(parsed.data.id, {
      fecha_real_devolucion: parsed.data.fecha_real_devolucion,
      observaciones_devolucion: parsed.data.observaciones_devolucion || null,
      devuelto_por: parsed.data.devuelto_por || null,
      recibido_por: parsed.data.recibido_por || null,
      firma_devuelve: firmaDevuelveUrl,
      firma_recibe_devolucion: firmaRecibeDevolucionUrl,
    });

    // Log de auditoría
    await logAction({
      action: "UPDATE",
      entity: "movimiento",
      entityId: parsed.data.id,
      details: `Devolución registrada para movimiento ${movimiento.numero_ticket}`,
    });

    revalidatePath("/movimientos");
  } catch (error) {
    console.error("Error en actionDevolver:", error);
    // Propagar el error con un mensaje claro
    const errorMessage = error instanceof Error ? error.message : "Error al procesar la devolución";
    throw new Error(errorMessage);
  }
}


