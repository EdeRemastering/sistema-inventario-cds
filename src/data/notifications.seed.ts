import type { PrismaClient } from "@prisma/client";

export async function seedNotifications(prisma: PrismaClient) {
  console.log("🌱 Sembrando notificaciones...");
  
  // Obtener algunos usuarios
  const usuarios = await prisma.usuarios.findMany({ take: 3 });
  
  if (usuarios.length === 0) {
    console.log("⚠️  No hay usuarios disponibles para crear notificaciones");
    return;
  }
  
  let count = 0;
  const fechaBase = new Date();
  fechaBase.setDate(fechaBase.getDate() - 7); // Hace una semana
  
  const tiposNotificacion = [
    { type: "mantenimiento", title: "Mantenimiento pendiente", message: "Tienes mantenimientos programados pendientes", priority: "medium" as const },
    { type: "movimiento", title: "Nuevo movimiento", message: "Se ha registrado un nuevo movimiento de inventario", priority: "low" as const },
    { type: "reporte", title: "Reporte generado", message: "Tu reporte ha sido generado exitosamente", priority: "low" as const },
  ];
  
  for (let i = 0; i < usuarios.length; i++) {
    const usuario = usuarios[i];
    const notificacion = tiposNotificacion[i % tiposNotificacion.length];
    
    await prisma.notifications.create({
      data: {
        type: notificacion.type,
        title: notificacion.title,
        message: notificacion.message,
        user_id: usuario.id,
        related_id: null,
        priority: notificacion.priority as "low" | "medium" | "high" | "urgent",
        read: false,
        email_sent: false,
        created_at: new Date(fechaBase.getTime() + i * 24 * 60 * 60 * 1000), // Espaciadas por día
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} notificaciones sembradas correctamente`);
}

