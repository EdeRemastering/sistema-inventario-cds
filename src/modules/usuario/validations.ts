import { z } from "zod";

export const createUsuarioSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  nombre: z.string().min(1),
  apellido: z.string().optional().or(z.literal("")),
  // Firma como data URL (base64) desde el formulario; se convertirá a URL y se guardará en firma_url (opcional)
  firma: z.string().optional().or(z.literal("")),
  rol: z.enum(["administrador", "usuario"]).default("usuario"),
  activo: z.boolean().optional(),
});

export const updateUsuarioSchema = z.object({
  id: z.number().int().positive(),
  password: z.string().min(6).optional().or(z.literal("")),
  nombre: z.string().min(1).optional(),
  apellido: z.string().optional().or(z.literal("")),
  firma: z.string().optional().or(z.literal("")),
  rol: z.enum(["administrador", "usuario"]).optional(),
  activo: z.boolean().optional(),
});

export type CreateUsuarioSchema = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioSchema = z.infer<typeof updateUsuarioSchema>;


