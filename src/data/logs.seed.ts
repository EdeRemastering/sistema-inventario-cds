import type { PrismaClient } from "../generated/prisma";

export const logsSeed = [
  { id: 1, usuario_id: 1, accion: "INICIO_SESION", detalles: "Inicio de sesión exitoso", ip: "::1", creado_en: new Date("2025-09-19T20:19:43") },
  { id: 2, usuario_id: 1, accion: "INICIO_SESION", detalles: "Inicio de sesión exitoso", ip: "::1", creado_en: new Date("2025-09-19T20:44:52") },
  { id: 3, usuario_id: 1, accion: "INICIO_SESION", detalles: "Inicio de sesión exitoso", ip: "::1", creado_en: new Date("2025-09-19T20:45:27") },
  { id: 4, usuario_id: 1, accion: "INICIO_SESION", detalles: "Inicio de sesión exitoso", ip: "::1", creado_en: new Date("2025-09-19T20:50:47") },
];

export async function seedLogs(prisma: PrismaClient) {
  for (const l of logsSeed) {
    await prisma.logs.upsert({
      where: { id: l.id },
      update: { usuario_id: l.usuario_id, accion: l.accion, detalles: l.detalles, ip: l.ip },
      create: { id: l.id, usuario_id: l.usuario_id, accion: l.accion, detalles: l.detalles, ip: l.ip, creado_en: l.creado_en },
    });
  }
}


