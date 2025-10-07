import { z } from "zod";

export const observacionCreateSchema = z.object({
  elemento_id: z.number().int().positive(),
  fecha_observacion: z.coerce.date(),
  descripcion: z.string().min(1),
});

export const observacionUpdateSchema = observacionCreateSchema.partial().extend({
  id: z.number().int().positive(),
});


