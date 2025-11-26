import { z } from "zod";

export const movimientoCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive(),
  orden_numero: z.string().default(""),
  fecha_movimiento: z.coerce.date(),
  dependencia_entrega: z.string().min(1),
  firma_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().min(1),
  firma_funcionario_recibe: z.string().optional(),
  motivo: z.string().default(""),
  fecha_estimada_devolucion: z.coerce.date(),
  tipo: z.enum(["ENTRADA", "SALIDA", "DEVOLUCION", "TRASLADO"]).default("SALIDA"),
  ubicacion_anterior_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  ubicacion_nueva_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  usuario: z.string().optional().or(z.literal("")),
  numero_ticket: z.string().default(""),
  cargo_funcionario_entrega: z.string().optional(),
  cargo_funcionario_recibe: z.string().optional(),
  observaciones_entrega: z.string().optional(),
});

export const movimientoUpdateSchema = movimientoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const devolucionSchema = z.object({
  id: z.coerce.number().int().positive(),
  fecha_real_devolucion: z.coerce.date(),
  observaciones_devolucion: z.string().optional(),
  devuelto_por: z.string().optional(),
  recibido_por: z.string().optional(),
});


