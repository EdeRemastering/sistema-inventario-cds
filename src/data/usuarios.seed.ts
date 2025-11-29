import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const usuariosSeed = [
  { id: 1, username: "admin", password: "admin123", nombre: "Administrador General", rol: "administrador" as const, activo: true },
  { id: 2, username: "apartado", password: "apart123", nombre: "Coordinador Apartadó", rol: "administrador" as const, activo: true },
  { id: 3, username: "chigorodo", password: "chigo123", nombre: "Coordinador Chigorodó", rol: "administrador" as const, activo: true },
  { id: 4, username: "turbo", password: "turbo123", nombre: "Coordinador Turbo", rol: "administrador" as const, activo: true },
  { id: 5, username: "necocli", password: "neco123", nombre: "Coordinador Necoclí", rol: "usuario" as const, activo: true },
  { id: 6, username: "arboletes", password: "arbo123", nombre: "Coordinador Arboletes", rol: "usuario" as const, activo: true },
  { id: 7, username: "sanpedro", password: "sanp123", nombre: "Coordinador San Pedro", rol: "usuario" as const, activo: true },
  { id: 8, username: "lorica", password: "lori123", nombre: "Coordinador Lorica", rol: "usuario" as const, activo: true },
  { id: 9, username: "usuario", password: "user123", nombre: "Usuario General", rol: "usuario" as const, activo: true },
  { id: 10, username: "tecnico", password: "tec123", nombre: "Técnico de Mantenimiento", rol: "usuario" as const, activo: true },
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


