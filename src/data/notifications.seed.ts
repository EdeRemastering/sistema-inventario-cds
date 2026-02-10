import type { PrismaClient } from "@prisma/client";

/** Una sola notificación de ejemplo por usuario admin. */
export async function seedNotifications(prisma: PrismaClient) {
  console.log("🌱 Sembrando notificaciones...");
  const usuario = await prisma.usuarios.findFirst({ where: { username: "admin" } });
  if (!usuario) {
    console.log("⚠️  No hay usuario admin para notificación");
    return;
  }
  await prisma.notifications.create({
    data: {
      type: "mantenimiento",
      title: "Mantenimiento pendiente",
      message: "Tienes mantenimientos programados pendientes",
      user_id: usuario.id,
      related_id: null,
      priority: "medium",
      read: false,
      email_sent: false,
      created_at: new Date(),
    },
  });
  console.log("✅ 1 notificación sembrada");
}
