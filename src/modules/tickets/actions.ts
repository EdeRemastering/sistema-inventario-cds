import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  createTicket, 
  updateTicket, 
  deleteTicket
} from "./services";
import { ticketCreateSchema, ticketUpdateSchema } from "./validations";
import { formDataToObject } from "../../utils/form";
import { generateUniqueTicketNumber } from "../../lib/ticket-generator";
import { saveSignature, isValidSignature } from "../../lib/signature-storage";

export async function actionCreateTicket(formData: FormData) {
  // Procesar los datos del formulario manualmente
  const data: Record<string, unknown> = {};
  
  // Campos básicos
  data.numero_ticket = formData.get("numero_ticket") as string || undefined;
  data.orden_numero = formData.get("orden_numero") as string;
  data.fecha_movimiento = new Date(formData.get("fecha_movimiento") as string);
  data.dependencia_entrega = formData.get("dependencia_entrega") as string;
  data.cargo_funcionario_entrega = formData.get("cargo_funcionario_entrega") as string || undefined;
  data.dependencia_recibe = formData.get("dependencia_recibe") as string;
  data.cargo_funcionario_recibe = formData.get("cargo_funcionario_recibe") as string || undefined;
  data.motivo = formData.get("motivo") as string;
  data.fecha_estimada_devolucion = new Date(formData.get("fecha_estimada_devolucion") as string);
  
  // Campos opcionales
  const fecha_real = formData.get("fecha_real_devolucion") as string;
  if (fecha_real) data.fecha_real_devolucion = new Date(fecha_real);
  
  const obs_entrega = formData.get("observaciones_entrega") as string;
  if (obs_entrega) data.observaciones_entrega = obs_entrega;
  
  const obs_devolucion = formData.get("observaciones_devolucion") as string;
  if (obs_devolucion) data.observaciones_devolucion = obs_devolucion;
  
  const firma_recepcion = formData.get("firma_recepcion") as string;
  if (firma_recepcion) data.firma_recepcion = firma_recepcion;
  
  data.tipo = (formData.get("tipo") as string) || "SALIDA";
  
  const firma_entrega = formData.get("firma_entrega") as string;
  if (firma_entrega) data.firma_entrega = firma_entrega;
  
  const firma_recibe = formData.get("firma_recibe") as string;
  if (firma_recibe) data.firma_recibe = firma_recibe;
  
  const hora_entrega = formData.get("hora_entrega") as string;
  if (hora_entrega) data.hora_entrega = new Date(hora_entrega);
  
  const hora_devolucion = formData.get("hora_devolucion") as string;
  if (hora_devolucion) data.hora_devolucion = new Date(hora_devolucion);
  
  const firma_devuelve = formData.get("firma_devuelve") as string;
  if (firma_devuelve) data.firma_devuelve = firma_devuelve;
  
  const firma_recibe_devolucion = formData.get("firma_recibe_devolucion") as string;
  if (firma_recibe_devolucion) data.firma_recibe_devolucion = firma_recibe_devolucion;
  
  const devuelto_por = formData.get("devuelto_por") as string;
  if (devuelto_por) data.devuelto_por = devuelto_por;
  
  const recibido_por = formData.get("recibido_por") as string;
  if (recibido_por) data.recibido_por = recibido_por;
  
  // Procesar elementos
  const elementos: { elemento_id: number; cantidad: number }[] = [];
  let index = 0;
  while (formData.get(`elementos[${index}].elemento_id`)) {
    const elemento_id = parseInt(formData.get(`elementos[${index}].elemento_id`) as string);
    const cantidad = parseInt(formData.get(`elementos[${index}].cantidad`) as string);
    elementos.push({ elemento_id, cantidad });
    index++;
  }
  
  data.elementos = elementos;
  
  // Validar datos
  const parsed = ticketCreateSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Validation errors:", parsed.error);
    throw new Error("Datos inválidos");
  }
  
  // Generar número de ticket automáticamente si no se proporciona
  const numero_ticket = parsed.data.numero_ticket || await generateUniqueTicketNumber();
  
  if (!numero_ticket) {
    throw new Error("Error generando número de ticket");
  }
  
  // Extraer firmas del FormData
  const firma_entrega_form = formData.get("firma_funcionario_entrega") as string | null;
  const firma_recibe_form = formData.get("firma_funcionario_recibe") as string | null;
  
  // Crear el ticket primero para obtener el ID
  const ticket = await createTicket({
    numero_ticket: numero_ticket,
    orden_numero: parsed.data.orden_numero,
    fecha_movimiento: parsed.data.fecha_movimiento,
    dependencia_entrega: parsed.data.dependencia_entrega,
    firma_funcionario_entrega: null, // Se actualizará después
    cargo_funcionario_entrega: parsed.data.cargo_funcionario_entrega ?? null,
    dependencia_recibe: parsed.data.dependencia_recibe,
    firma_funcionario_recibe: null, // Se actualizará después
    cargo_funcionario_recibe: parsed.data.cargo_funcionario_recibe ?? null,
    motivo: parsed.data.motivo,
    fecha_estimada_devolucion: parsed.data.fecha_estimada_devolucion,
    fecha_real_devolucion: parsed.data.fecha_real_devolucion ?? null,
    observaciones_entrega: parsed.data.observaciones_entrega ?? null,
    observaciones_devolucion: parsed.data.observaciones_devolucion ?? null,
    firma_recepcion: parsed.data.firma_recepcion ?? null,
    tipo: parsed.data.tipo,
    firma_entrega: parsed.data.firma_entrega ?? null,
    firma_recibe: parsed.data.firma_recibe ?? null,
    hora_entrega: parsed.data.hora_entrega ?? null,
    hora_devolucion: parsed.data.hora_devolucion ?? null,
    firma_devuelve: parsed.data.firma_devuelve ?? null,
    firma_recibe_devolucion: parsed.data.firma_recibe_devolucion ?? null,
    devuelto_por: parsed.data.devuelto_por ?? null,
    recibido_por: parsed.data.recibido_por ?? null,
    elementos: parsed.data.elementos,
  });
  
  // Guardar firmas como imágenes si son válidas
  let firmaEntregaUrl = null;
  let firmaRecibeUrl = null;
  
  if (firma_entrega_form && isValidSignature(firma_entrega_form)) {
    firmaEntregaUrl = await saveSignature(firma_entrega_form, "ticket", ticket.id, "entrega");
  }
  
  if (firma_recibe_form && isValidSignature(firma_recibe_form)) {
    firmaRecibeUrl = await saveSignature(firma_recibe_form, "ticket", ticket.id, "recibe");
  }
  
  // Actualizar el ticket con las URLs de las firmas
  if (firmaEntregaUrl || firmaRecibeUrl) {
    await updateTicket(ticket.id, {
      firma_funcionario_entrega: firmaEntregaUrl,
      firma_funcionario_recibe: firmaRecibeUrl,
    });
  }
  
  revalidatePath("/tickets");
  redirect("/tickets");
}

export async function actionUpdateTicket(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) throw new Error("ID inválido");
  
  const parsed = ticketUpdateSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new Error("Datos inválidos");
  
  await updateTicket(id, parsed.data);
  
  revalidatePath("/tickets");
  redirect("/tickets");
}

export async function actionDeleteTicket(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) throw new Error("ID inválido");
  
  await deleteTicket(id);
  
  revalidatePath("/tickets");
  redirect("/tickets");
}
