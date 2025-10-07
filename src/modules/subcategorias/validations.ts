import { z } from "zod";

export const subcategoriaCreateSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  categoria_id: z.number().int().positive(),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export const subcategoriaUpdateSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  categoria_id: z.number().int().positive().optional(),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

export type SubcategoriaCreateSchema = z.infer<typeof subcategoriaCreateSchema>;
export type SubcategoriaUpdateSchema = z.infer<typeof subcategoriaUpdateSchema>;


