import { z } from "zod";

export const reporteCreateSchema = z.object({
  tipo_reporte: z.string().min(1),
  nombre_archivo: z.string().min(1),
  // contenido_pdf será tratado aparte (Buffer) si aplica
});

export const reporteDeleteSchema = z.object({ id: z.number().int().positive() });


