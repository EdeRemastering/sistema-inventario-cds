import { z } from "zod";

const estadoCorto = z.enum(["B", "D", "I", "FS", "O", "R", "OB"]);

export const elementoCreateSchema = z.object({
  categoria_id: z.coerce.number().int().positive(),
  subcategoria_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  cantidad: z.coerce.number().int().positive().default(1),
  serie: z.string().min(1),
  marca: z.string().optional().or(z.literal("")),
  modelo: z.string().optional().or(z.literal("")),
  ubicacion: z.string().optional().or(z.literal("")), // Mantener para compatibilidad
  ubicacion_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  estado_funcional: estadoCorto.default("B"),
  estado_fisico: estadoCorto.default("B"),
  fecha_entrada: z.coerce.date().default(new Date()),
  fecha_salida: z.coerce.date().optional().or(z.literal("")),
  codigo_equipo: z.string().optional().or(z.literal("")),
  especificaciones: z.record(z.string(), z.any()).optional(),
  observaciones: z.string().optional().or(z.literal("")),
  activo: z.coerce.boolean().default(true),
});

export const elementoUpdateSchema = elementoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type ElementoCreateSchema = z.infer<typeof elementoCreateSchema>;
export type ElementoUpdateSchema = z.infer<typeof elementoUpdateSchema>;


