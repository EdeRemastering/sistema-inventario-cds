import { z } from "zod";

const estadoCorto = z.enum(["B", "D", "I", "FS", "O", "R", "OB"]);

export const elementoCreateSchema = z.object({
  categoria_id: z.number().int().positive(),
  subcategoria_id: z.number().int().positive().optional(),
  cantidad: z.number().int().positive().default(1),
  serie: z.string().min(1),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  ubicacion: z.string().optional(),
  estado_funcional: estadoCorto.default("B"),
  estado_fisico: estadoCorto.default("B"),
  fecha_entrada: z.coerce.date(),
  codigo_equipo: z.string().optional(),
  observaciones: z.string().optional(),
});

export const elementoUpdateSchema = elementoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type ElementoCreateSchema = z.infer<typeof elementoCreateSchema>;
export type ElementoUpdateSchema = z.infer<typeof elementoUpdateSchema>;


