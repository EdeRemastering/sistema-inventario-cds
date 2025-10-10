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
  tipo: z.enum(["SALIDA", "DEVOLUCION"]).default("SALIDA"),
  numero_ticket: z.string().default(""),
  cargo_funcionario_entrega: z.string().optional(),
  cargo_funcionario_recibe: z.string().optional(),
  observaciones_entrega: z.string().optional(),
});

export const movimientoUpdateSchema = movimientoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});


