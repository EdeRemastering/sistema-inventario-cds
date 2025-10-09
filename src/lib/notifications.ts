import { prisma } from "./prisma";

export type NotificationType = 
  | "stock_bajo" 
  | "prestamo_vencido" 
  | "devolucion_pendiente"
  | "nuevo_movimiento"
  | "sistema";

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  userId?: number;
  relatedId?: number;
  priority: "low" | "medium" | "high" | "urgent";
  email?: boolean;
}

/**
 * Registra una notificación en el sistema
 */
export async function createNotification(data: NotificationData): Promise<void> {
  try {
    await prisma.notifications.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        user_id: data.userId || null,
        related_id: data.relatedId || null,
        priority: data.priority,
        email_sent: data.email || false,
        read: false,
      },
    });

    // Si está habilitado el email, enviarlo
    if (data.email && data.userId) {
      await sendEmailNotification(data);
    }
  } catch (error) {
    console.error("Error creando notificación:", error);
  }
}

/**
 * Envía notificación por email (simulado)
 */
async function sendEmailNotification(data: NotificationData): Promise<void> {
  try {
    // En una implementación real, aquí usarías un servicio de email como SendGrid, Nodemailer, etc.
    console.log("📧 Email enviado:", {
      to: data.userId,
      subject: data.title,
      body: data.message,
      type: data.type,
    });

    // Simular envío de email
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error("Error enviando email:", error);
  }
}

/**
 * Obtiene notificaciones para un usuario
 */
export async function getUserNotifications(userId: number, limit: number = 10) {
  try {
    return await prisma.notifications.findMany({
      where: {
        OR: [
          { user_id: userId },
          { user_id: null }, // Notificaciones globales
        ],
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    return [];
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await prisma.notifications.update({
      where: { id: notificationId },
      data: { read: true },
    });
  } catch (error) {
    console.error("Error marcando notificación como leída:", error);
  }
}

/**
 * Obtiene estadísticas de notificaciones
 */
export async function getNotificationStats() {
  try {
    const [total, unread, highPriority, today] = await Promise.all([
      prisma.notifications.count(),
      prisma.notifications.count({ where: { read: false } }),
      prisma.notifications.count({ where: { priority: "high" } }),
      prisma.notifications.count({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total,
      unread,
      highPriority,
      today,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de notificaciones:", error);
    return {
      total: 0,
      unread: 0,
      highPriority: 0,
      today: 0,
    };
  }
}

/**
 * Notificaciones automáticas para eventos del sistema
 */
export class NotificationService {
  static async notifyStockBajo(elementoId: number, elementoSerie: string): Promise<void> {
    await createNotification({
      type: "stock_bajo",
      title: "Stock Bajo Detectado",
      message: `El elemento ${elementoSerie} tiene stock bajo y requiere atención.`,
      relatedId: elementoId,
      priority: "high",
      email: true,
    });
  }

  static async notifyPrestamoVencido(movimientoId: number, ticket: string): Promise<void> {
    await createNotification({
      type: "prestamo_vencido",
      title: "Préstamo Vencido",
      message: `El préstamo con ticket ${ticket} ha vencido y requiere devolución.`,
      relatedId: movimientoId,
      priority: "urgent",
      email: true,
    });
  }

  static async notifyNuevoMovimiento(movimientoId: number, ticket: string): Promise<void> {
    await createNotification({
      type: "nuevo_movimiento",
      title: "Nuevo Movimiento Registrado",
      message: `Se ha registrado un nuevo movimiento con ticket ${ticket}.`,
      relatedId: movimientoId,
      priority: "medium",
      email: false,
    });
  }

  static async notifyDevolucionPendiente(movimientoId: number, ticket: string): Promise<void> {
    await createNotification({
      type: "devolucion_pendiente",
      title: "Devolución Pendiente",
      message: `El préstamo con ticket ${ticket} tiene una devolución pendiente.`,
      relatedId: movimientoId,
      priority: "medium",
      email: true,
    });
  }
}
