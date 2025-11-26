import { z } from "zod";

export const hojaVidaCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  fecha_dilegenciamiento: z.coerce.date(),
  tipo_elemento: z.enum(["EQUIPO", "RECURSO_DIDACTICO"]),
  area_ubicacion: z.string().max(100).optional().or(z.literal("")),
  responsable: z.string().max(100).optional().or(z.literal("")),
  especificaciones_tecnicas: z.record(z.unknown()).optional(),
  descripcion: z.string().optional(),
  requerimientos_funcionamiento: z.string().optional(),
  requerimientos_seguridad: z.string().optional(),
  rutina_mantenimiento: z
    .enum(["DIARIO", "SEMANAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"])
    .optional()
    .or(z.literal("")),
  fecha_actualizacion: z.coerce.date().optional(),
  activo: z.coerce.boolean().default(true),
});

export const hojaVidaUpdateSchema = hojaVidaCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export const cambioElementoCreateSchema = z.object({
  hoja_vida_id: z.coerce.number().int().positive(),
  fecha_cambio: z.coerce.date(),
  descripcion_cambio: z.string().min(1, "Descripción requerida"),
  tipo_cambio: z.enum(["ACTUALIZACION", "REPARACION", "MEJORA", "REEMPLAZO"]),
  usuario: z.string().max(50).optional().or(z.literal("")),
});

export const cambioElementoUpdateSchema = cambioElementoCreateSchema.partial().extend({
  id: z.number().int().positive(),
});

export type HojaVidaCreateSchema = z.infer<typeof hojaVidaCreateSchema>;
export type HojaVidaUpdateSchema = z.infer<typeof hojaVidaUpdateSchema>;
export type CambioElementoCreateSchema = z.infer<typeof cambioElementoCreateSchema>;
export type CambioElementoUpdateSchema = z.infer<typeof cambioElementoUpdateSchema>;

