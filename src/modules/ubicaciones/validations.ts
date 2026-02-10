import { z } from "zod";

export const ubicacionCreateSchema = z.object({
  codigo: z.string().min(1, "Código requerido").max(20),
  nombre: z.string().min(1, "Nombre requerido").max(100),
  sede_id: z.coerce.number().int().positive("Sede requerida"),
  activo: z.coerce.boolean().default(true),
  capacidad: z.coerce.number().int().min(0).optional().nullable(),
  ancho_metros: z.coerce.number().min(0).optional().nullable(),
  largo_metros: z.coerce.number().min(0).optional().nullable(),
});

export const ubicacionUpdateSchema = ubicacionCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type UbicacionCreateSchema = z.infer<typeof ubicacionCreateSchema>;
export type UbicacionUpdateSchema = z.infer<typeof ubicacionUpdateSchema>;


