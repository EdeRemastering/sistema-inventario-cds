import { z } from "zod";

export const mantenimientoProgramadoCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  frecuencia: z.enum(["DIARIO", "SEMANAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]),
  año: z.coerce.number().int().min(2020).max(2100),
  enero_semana1: z.coerce.boolean().default(false),
  enero_semana2: z.coerce.boolean().default(false),
  enero_semana3: z.coerce.boolean().default(false),
  enero_semana4: z.coerce.boolean().default(false),
  febrero_semana1: z.coerce.boolean().default(false),
  febrero_semana2: z.coerce.boolean().default(false),
  febrero_semana3: z.coerce.boolean().default(false),
  febrero_semana4: z.coerce.boolean().default(false),
  marzo_semana1: z.coerce.boolean().default(false),
  marzo_semana2: z.coerce.boolean().default(false),
  marzo_semana3: z.coerce.boolean().default(false),
  marzo_semana4: z.coerce.boolean().default(false),
  abril_semana1: z.coerce.boolean().default(false),
  abril_semana2: z.coerce.boolean().default(false),
  abril_semana3: z.coerce.boolean().default(false),
  abril_semana4: z.coerce.boolean().default(false),
  mayo_semana1: z.coerce.boolean().default(false),
  mayo_semana2: z.coerce.boolean().default(false),
  mayo_semana3: z.coerce.boolean().default(false),
  mayo_semana4: z.coerce.boolean().default(false),
  junio_semana1: z.coerce.boolean().default(false),
  junio_semana2: z.coerce.boolean().default(false),
  junio_semana3: z.coerce.boolean().default(false),
  junio_semana4: z.coerce.boolean().default(false),
  julio_semana1: z.coerce.boolean().default(false),
  julio_semana2: z.coerce.boolean().default(false),
  julio_semana3: z.coerce.boolean().default(false),
  julio_semana4: z.coerce.boolean().default(false),
  agosto_semana1: z.coerce.boolean().default(false),
  agosto_semana2: z.coerce.boolean().default(false),
  agosto_semana3: z.coerce.boolean().default(false),
  agosto_semana4: z.coerce.boolean().default(false),
  septiembre_semana1: z.coerce.boolean().default(false),
  septiembre_semana2: z.coerce.boolean().default(false),
  septiembre_semana3: z.coerce.boolean().default(false),
  septiembre_semana4: z.coerce.boolean().default(false),
  octubre_semana1: z.coerce.boolean().default(false),
  octubre_semana2: z.coerce.boolean().default(false),
  octubre_semana3: z.coerce.boolean().default(false),
  octubre_semana4: z.coerce.boolean().default(false),
  noviembre_semana1: z.coerce.boolean().default(false),
  noviembre_semana2: z.coerce.boolean().default(false),
  noviembre_semana3: z.coerce.boolean().default(false),
  noviembre_semana4: z.coerce.boolean().default(false),
  diciembre_semana1: z.coerce.boolean().default(false),
  diciembre_semana2: z.coerce.boolean().default(false),
  diciembre_semana3: z.coerce.boolean().default(false),
  diciembre_semana4: z.coerce.boolean().default(false),
  estado: z.enum(["PENDIENTE", "REALIZADO", "APLAZADO", "CANCELADO"]).default("PENDIENTE"),
  observaciones: z.string().optional(),
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
  responsable: z.string().min(1, "Responsable requerido").max(100),
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

