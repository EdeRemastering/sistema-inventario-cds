import type { PrismaClient } from "../generated/prisma";

export const usuariosSeed = [
  { id: 1, username: "admin", password: "admin", nombre: "Administrador del Sistema", rol: "administrador" as const, activo: true },
];

export async function seedUsuarios(prisma: PrismaClient) {
  for (const u of usuariosSeed) {
    await prisma.usuarios.upsert({
      where: { id: u.id },
      update: { username: u.username, password: u.password, nombre: u.nombre, rol: u.rol, activo: u.activo },
      create: { id: u.id, username: u.username, password: u.password, nombre: u.nombre, rol: u.rol, activo: u.activo },
    });
  }
}


