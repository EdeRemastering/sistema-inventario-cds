import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Usuarios mínimos para presentación: admin, usuario, técnico. */
export const usuariosSeed = [
  { id: 1, username: "admin", password: "admin123", nombre: "Administrador", rol: "administrador" as const, activo: true },
  { id: 2, username: "usuario", password: "user123", nombre: "Usuario General", rol: "usuario" as const, activo: true },
  { id: 3, username: "tecnico", password: "tec123", nombre: "Técnico Mantenimiento", rol: "usuario" as const, activo: true },
];

export async function seedUsuarios(prisma: PrismaClient) {
  console.log("🌱 Sembrando usuarios...");
  for (const user of usuariosSeed) {
    const passwordIsHashed = typeof user.password === "string" && user.password.startsWith("$2");
    const hashedPassword = passwordIsHashed ? user.password : await bcrypt.hash(user.password, 10);
    await prisma.usuarios.upsert({
      where: { id: user.id },
      update: { username: user.username, password: hashedPassword, nombre: user.nombre, rol: user.rol, activo: user.activo },
      create: { id: user.id, username: user.username, password: hashedPassword, nombre: user.nombre, rol: user.rol, activo: user.activo },
    });
  }
  console.log(`✅ ${usuariosSeed.length} usuarios sembrados correctamente`);
}
