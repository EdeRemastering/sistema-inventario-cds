import { z } from "zod";

// Transformador para convertir string de fecha a Date de forma segura para MySQL
// Usamos Date.UTC para crear la fecha exacta que queremos sin conversiones de timezone
const dateStringToDate = z.string().transform((val) => {
  if (!val) return undefined;
  // Parsear la fecha como YYYY-MM-DD y crear Date en UTC al mediodía
  // Esto asegura que MySQL guarde la fecha correcta
  const [year, month, day] = val.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
});

const optionalDateStringToDate = z.string().optional().transform((val) => {
  if (!val) return undefined;
  const [year, month, day] = val.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
});

export const hojaVidaCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  fecha_dilegenciamiento: dateStringToDate,
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
  fecha_actualizacion: optionalDateStringToDate,
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

