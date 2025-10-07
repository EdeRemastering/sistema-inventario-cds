import type { PrismaClient } from "../generated/prisma";

export const usuariosSeed = [
  { id: 1, username: "admin", password: "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", nombre: "Administrador del Sistema", rol: "administrador" as const, activo: true },
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


