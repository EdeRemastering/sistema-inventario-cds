import { z } from "zod";

export const prestamoCreateSchema = z.object({
  numero_ticket: z.string().optional(),
  fecha_salida: z.coerce.date(),
  fecha_estimada_devolucion: z.coerce.date().optional(),
  ubicacion_id: z.coerce.number().int().positive(),
  elemento: z.string().optional(),
  serie: z.string().optional(),
  marca_modelo: z.string().optional(),
  cantidad: z.coerce.number().int().positive().default(1),
  dependencia_entrega: z.string().optional(),
  persona_entrega_nombre: z.string().optional(),
  persona_entrega_apellido: z.string().optional(),
  firma_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().optional(),
  persona_recibe_nombre: z.string().optional(),
  persona_recibe_apellido: z.string().optional(),
  firma_funcionario_recibe: z.string().optional(),
  motivo: z.string().optional(),
  orden_numero: z.string().optional(),
  usuario_guardado: z.string().optional(),
});

export const prestamoUpdateSchema = prestamoCreateSchema.partial().extend({
  id: z.coerce.number().int().positive(),
});

export const prestamoDeleteSchema = z.object({ id: z.number().int().positive() });
