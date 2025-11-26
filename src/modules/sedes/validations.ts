import { z } from "zod";

export const sedeCreateSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(100),
  ciudad: z.string().min(1, "Ciudad requerida").max(100),
  municipio: z.string().max(100).optional().or(z.literal("")),
  activo: z.coerce.boolean().default(true),
});

export const sedeUpdateSchema = sedeCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type SedeCreateSchema = z.infer<typeof sedeCreateSchema>;
export type SedeUpdateSchema = z.infer<typeof sedeUpdateSchema>;

