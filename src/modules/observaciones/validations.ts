import { z } from "zod";

export const observacionCreateSchema = z
  .object({
    elemento_id: z.number().int().positive(),
    fecha_observacion: z.coerce.date(),
    descripcion: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => data.fecha_observacion <= new Date(),
    { message: "La fecha de observación no puede ser futura", path: ["fecha_observacion"] }
  );

export const observacionUpdateSchema = observacionCreateSchema.partial().extend({
  id: z.number().int().positive(),
});


