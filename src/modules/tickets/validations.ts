import { z } from "zod";

export const ticketElementoSchema = z.object({
  elemento_id: z.number().int().positive("ID de elemento requerido"),
  cantidad: z.number().int().positive("Cantidad debe ser mayor a 0"),
});

export const ticketCreateSchema = z.object({
  numero_ticket: z.string().optional(),
  orden_numero: z.string().min(1, "Número de orden requerido"),
  fecha_movimiento: z.date({
    message: "Fecha de movimiento requerida",
  }),
  dependencia_entrega: z.string().min(1, "Dependencia de entrega requerida"),
  firma_funcionario_entrega: z.string().optional(),
  cargo_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().min(1, "Dependencia que recibe requerida"),
  firma_funcionario_recibe: z.string().optional(),
  cargo_funcionario_recibe: z.string().optional(),
  motivo: z.string().min(1, "Motivo requerido"),
  fecha_estimada_devolucion: z.date({
    message: "Fecha estimada de devolución requerida",
  }),
  fecha_real_devolucion: z.date().optional(),
  observaciones_entrega: z.string().optional(),
  observaciones_devolucion: z.string().optional(),
  firma_recepcion: z.string().optional(),
  tipo: z.enum(["SALIDA", "DEVOLUCION"]),
  firma_entrega: z.string().optional(),
  firma_recibe: z.string().optional(),
  hora_entrega: z.date().optional(),
  hora_devolucion: z.date().optional(),
  firma_devuelve: z.string().optional(),
  firma_recibe_devolucion: z.string().optional(),
  devuelto_por: z.string().optional(),
  recibido_por: z.string().optional(),
  elementos: z.array(ticketElementoSchema).min(1, "Debe seleccionar al menos un elemento"),
});

export const ticketUpdateSchema = ticketCreateSchema.partial();

export type TicketCreateData = z.infer<typeof ticketCreateSchema>;
export type TicketUpdateData = z.infer<typeof ticketUpdateSchema>;
export type TicketElementoData = z.infer<typeof ticketElementoSchema>;
