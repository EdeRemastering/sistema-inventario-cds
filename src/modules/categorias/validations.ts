import { z } from "zod";

export const categoriaCreateSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional().or(z.literal("")),
  estado: z.enum(["activo", "inactivo"]).default("activo"),
});

export const categoriaUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional().or(z.literal("")),
  estado: z.enum(["activo", "inactivo"]).optional(),
});

export type CategoriaCreateSchema = z.infer<typeof categoriaCreateSchema>;
export type CategoriaUpdateSchema = z.infer<typeof categoriaUpdateSchema>;


