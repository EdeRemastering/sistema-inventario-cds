import type { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";

export const usuariosSeed = [
  { id: 1, username: "admin", password: "admin", nombre: "Administrador del Sistema", rol: "administrador" as const, activo: true },
];

export async function seedUsuarios(prisma: PrismaClient) {
  for (const user of usuariosSeed) {
    const passwordIsHashed = typeof user.password === "string" && user.password.startsWith("$2");
    const hashedPassword = passwordIsHashed ? user.password : await bcrypt.hash(user.password, 10);

    await prisma.usuarios.upsert({
      where: { id: user.id },
      update: { username: user.username, password: hashedPassword, nombre: user.nombre, rol: user.rol, activo: user.activo },
      create: { id: user.id, username: user.username, password: hashedPassword, nombre: user.nombre, rol: user.rol, activo: user.activo },
    });
  }
}


