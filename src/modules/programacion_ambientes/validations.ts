import { z } from "zod";

const horaHHmm = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:mm inválido (ej. 08:00, 14:30)");

export const programacionAmbienteCreateSchema = z
  .object({
    ubicacion_id: z.coerce.number().int().positive(),
    fecha: z.coerce.date(),
    hora_inicio: horaHHmm.default("08:00"),
    hora_fin: horaHHmm.default("09:00"),
    docente_id_q10: z.string().max(50).optional().or(z.literal("")),
    descripcion: z.string().max(255).optional().or(z.literal("")),
    ocupado: z.coerce.boolean().default(true),
  })
  .refine(
    (data) => {
      const [h1, m1] = data.hora_inicio.split(":").map(Number);
      const [h2, m2] = data.hora_fin.split(":").map(Number);
      const minutosInicio = h1 * 60 + m1;
      const minutosFin = h2 * 60 + m2;
      return minutosFin > minutosInicio;
    },
    { message: "La hora de fin debe ser mayor que la hora de inicio", path: ["hora_fin"] }
  );

export const programacionAmbienteUpdateSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    ubicacion_id: z.coerce.number().int().positive().optional(),
    fecha: z.coerce.date().optional(),
    hora_inicio: horaHHmm.optional(),
    hora_fin: horaHHmm.optional(),
    docente_id_q10: z.string().max(50).optional().or(z.literal("")),
    descripcion: z.string().max(255).optional().or(z.literal("")),
    ocupado: z.coerce.boolean().optional(),
  })
  .refine(
    (data) => {
      const inicio = data.hora_inicio;
      const fin = data.hora_fin;
      if (!inicio || !fin) return true;
      const [h1, m1] = inicio.split(":").map(Number);
      const [h2, m2] = fin.split(":").map(Number);
      return h2 * 60 + m2 > h1 * 60 + m1;
    },
    { message: "La hora de fin debe ser mayor que la hora de inicio", path: ["hora_fin"] }
  );
