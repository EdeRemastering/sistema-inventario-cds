import { z } from "zod";

export const logCreateSchema = z.object({
  usuario_id: z.number().int().positive(),
  accion: z.string().min(1),
  detalles: z.string().optional(),
  ip: z.string().optional(),
});

export const logDeleteSchema = z.object({ id: z.number().int().positive() });


