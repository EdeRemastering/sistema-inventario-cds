import { z } from "zod";

export const mantenimientoProgramadoCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  fecha_mantenimiento: z.coerce.date(),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "PREDICTIVO"]),
  descripcion: z.string().min(1, "Descripción requerida"),
  averias_encontradas: z.string().optional(),
  repuestos_utilizados: z.string().optional(),
  responsable: z.string().max(100).optional().or(z.literal("")),
  costo: z.coerce.number().nonnegative().optional().or(z.literal("")),
  estado: z.enum(["PENDIENTE", "REALIZADO", "APLAZADO", "CANCELADO"]).default("PENDIENTE"),
  observaciones: z.string().optional(),
  creado_por: z.string().optional(),
});

export const mantenimientoProgramadoUpdateSchema = mantenimientoProgramadoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const mantenimientoRealizadoCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  programacion_id: z.coerce.number().int().positive().optional().or(z.literal("")),
  fecha_mantenimiento: z.coerce.date(),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "PREDICTIVO"]),
  descripcion: z.string().min(1, "Descripción requerida"),
  averias_encontradas: z.string().optional(),
  repuestos_utilizados: z.string().optional(),
  responsable: z.string().max(100).optional().or(z.literal("")),
  costo: z.coerce.number().nonnegative().optional().or(z.literal("")),
  creado_por: z.string().optional(),
});

export const mantenimientoRealizadoUpdateSchema = mantenimientoRealizadoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type MantenimientoProgramadoCreateSchema = z.infer<typeof mantenimientoProgramadoCreateSchema>;
export type MantenimientoProgramadoUpdateSchema = z.infer<typeof mantenimientoProgramadoUpdateSchema>;
export type MantenimientoRealizadoCreateSchema = z.infer<typeof mantenimientoRealizadoCreateSchema>;
export type MantenimientoRealizadoUpdateSchema = z.infer<typeof mantenimientoRealizadoUpdateSchema>;
