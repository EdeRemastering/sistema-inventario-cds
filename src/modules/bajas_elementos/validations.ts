import { z } from "zod";

export const bajaElementoCreateSchema = z.object({
  elemento_id: z.coerce.number().int().positive(),
  fecha_baja: z.coerce.date(),
  motivo: z.string().min(1, "Motivo requerido"),
  evidencia_pdf_url: z.string().url("URL de evidencia PDF requerida"),
  autorizado_por_id: z.coerce.number().int().positive(),
});
