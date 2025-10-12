import { z } from "zod";

export const ticketCreateSchema = z.object({
  numero_ticket: z.string().optional(), // Ahora es opcional, se generará automáticamente
  fecha_salida: z.coerce.date(),
  fecha_estimada_devolucion: z.coerce.date().optional(),
  elemento: z.string().optional(),
  serie: z.string().optional(),
  marca_modelo: z.string().optional(),
  cantidad: z.coerce.number().int().positive().default(1),
  dependencia_entrega: z.string().optional(),
  firma_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().optional(),
  firma_funcionario_recibe: z.string().optional(),
  motivo: z.string().optional(),
  orden_numero: z.string().optional(),
  usuario_guardado: z.string().optional(),
});

export const ticketUpdateSchema = ticketCreateSchema.partial().extend({
  id: z.coerce.number().int().positive(),
});

export const ticketDeleteSchema = z.object({ id: z.number().int().positive() });


