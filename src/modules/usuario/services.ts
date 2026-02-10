import { prisma } from "../../lib/prisma";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "./types";
import bcrypt from "bcryptjs";

export async function listUsuarios() {
  return prisma.usuarios.findMany({ orderBy: { id: "desc" } });
}

export async function getUsuarioById(id: number) {
  return prisma.usuarios.findUnique({ where: { id } });
}

export async function createUsuario(input: CreateUsuarioInput) {
  const hashed = await bcrypt.hash(input.password, 10);
  return prisma.usuarios.create({
    data: {
      username: input.username,
      password: hashed,
      nombre: input.nombre,
      apellido: input.apellido ?? null,
      firma_url: input.firma_url ?? null,
      rol: input.rol ?? "usuario",
      activo: input.activo ?? true,
    },
  });
}

export async function updateUsuario(input: UpdateUsuarioInput) {
  const data: Partial<{
    password: string;
    nombre: string;
    apellido: string | null;
    firma_url: string | null;
    rol: "administrador" | "usuario" | "autorizador" | undefined;
    activo: boolean | undefined;
  }> = {};
  if (input.password) data.password = await bcrypt.hash(input.password, 10);
  if (input.nombre !== undefined) data.nombre = input.nombre;
  if (input.apellido !== undefined) data.apellido = input.apellido ?? null;
  if (input.firma_url !== undefined) data.firma_url = input.firma_url ?? null;
  if (input.rol !== undefined) data.rol = input.rol;
  if (input.activo !== undefined) data.activo = input.activo;
  return prisma.usuarios.update({ where: { id: input.id }, data });
}

export async function deleteUsuario(id: number) {
  return prisma.usuarios.delete({ where: { id } });
}


