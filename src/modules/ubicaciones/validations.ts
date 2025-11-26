import { z } from "zod";

export const ubicacionCreateSchema = z.object({
  codigo: z.string().min(1, "Código requerido").max(20),
  nombre: z.string().min(1, "Nombre requerido").max(100),
  sede_id: z.coerce.number().int().positive("Sede requerida"),
  activo: z.coerce.boolean().default(true),
});

export const ubicacionUpdateSchema = ubicacionCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type UbicacionCreateSchema = z.infer<typeof ubicacionCreateSchema>;
export type UbicacionUpdateSchema = z.infer<typeof ubicacionUpdateSchema>;


