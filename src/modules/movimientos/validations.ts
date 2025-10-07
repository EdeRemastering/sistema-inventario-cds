import { z } from "zod";

export const movimientoCreateSchema = z.object({
  elemento_id: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  orden_numero: z.string().min(1),
  fecha_movimiento: z.coerce.date(),
  dependencia_entrega: z.string().min(1),
  funcionario_entrega: z.string().min(1),
  dependencia_recibe: z.string().min(1),
  funcionario_recibe: z.string().min(1),
  motivo: z.string().min(1),
  fecha_estimada_devolucion: z.coerce.date(),
  tipo: z.enum(["SALIDA", "DEVOLUCION"]).default("SALIDA"),
  numero_ticket: z.string().optional(),
});

export const movimientoUpdateSchema = movimientoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});


