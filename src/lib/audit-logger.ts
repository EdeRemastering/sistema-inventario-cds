import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export type LogAction = 
  | "CREATE" 
  | "UPDATE" 
  | "DELETE" 
  | "LOGIN" 
  | "LOGOUT" 
  | "VIEW" 
  | "EXPORT"
  | "PRESTAMO"
  | "DEVOLUCION";

export type LogEntity = 
  | "elemento"
  | "categoria"
  | "subcategoria"
  | "ubicacion"
  | "movimiento"
  | "usuario"
  | "observacion"
  | "reporte"
  | "ticket"
  | "sistema"
  | "sede"
  | "hoja_vida"
  | "cambio_elemento"
  | "mantenimiento_programado"
  | "mantenimiento_realizado";

export interface AuditLogData {
  action: LogAction;
  entity: LogEntity;
  entityId?: number;
  details?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Registra automáticamente una acción en el log de auditoría
 */
export async function logAction(data: AuditLogData): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.warn("No se pudo obtener la sesión del usuario para el log");
      return;
    }

    // Para el sistema actual, usamos el nombre del usuario como identificador
    // En una implementación completa, deberíamos tener el ID del usuario en la sesión
    const usuario = await prisma.usuarios.findFirst({
      where: { nombre: session.user.name || session.user.email || 'Sistema' }
    });

    if (!usuario) {
      console.warn("Usuario no encontrado en la base de datos");
      return;
    }

    await prisma.logs.create({
      data: {
        usuario_id: usuario.id,
        accion: `${data.action}_${data.entity.toUpperCase()}`,
        detalles: data.details || `${data.action} ${data.entity}${data.entityId ? ` ID: ${data.entityId}` : ''}`,
        ip: data.ip || null,
      },
    });
  } catch (error) {
    console.error("Error registrando acción en log:", error);
  }
}

/**
 * Middleware para logging automático de acciones
 */
export function withAuditLog<T extends unknown[]>(
  action: LogAction,
  entity: LogEntity,
  handler: (...args: T) => Promise<unknown>
) {
  return async (...args: T) => {
    try {
      const result = await handler(...args);
      
      // Log exitoso
      await logAction({
        action,
        entity,
        details: `Operación ${action} en ${entity} ejecutada exitosamente`,
      });
      
      return result;
    } catch (error) {
      // Log de error
      await logAction({
        action,
        entity,
        details: `Error en operación ${action} en ${entity}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      });
      
      throw error;
    }
  };
}

/**
 * Obtiene logs de auditoría con filtros
 */
export async function getAuditLogs(filters?: {
  usuarioId?: number;
  action?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  limit?: number;
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    
    if (filters?.usuarioId) {
      where.usuario_id = filters.usuarioId;
    }
    
    if (filters?.action) {
      where.accion = {
        contains: filters.action,
      };
    }
    
    if (filters?.fechaInicio || filters?.fechaFin) {
      where.creado_en = {};
      
      if (filters.fechaInicio) {
        where.creado_en.gte = filters.fechaInicio;
      }
      
      if (filters.fechaFin) {
        where.creado_en.lte = filters.fechaFin;
      }
    }

    const logs = await prisma.logs.findMany({
      where,
      include: {
        usuario: {
          select: {
            nombre: true,
            username: true,
          },
        },
      },
      orderBy: {
        creado_en: 'desc',
      },
      take: filters?.limit || 100,
    });

    return logs;
  } catch (error) {
    console.error("Error obteniendo logs de auditoría:", error);
    return [];
  }
}

/**
 * Obtiene estadísticas de actividad
 */
export async function getActivityStats() {
  try {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioSemana = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logsEsteMes,
      logsEstaSemana,
      usuariosActivos,
      accionesRecientes,
    ] = await Promise.all([
      prisma.logs.count(),
      prisma.logs.count({
        where: {
          creado_en: { gte: inicioMes },
        },
      }),
      prisma.logs.count({
        where: {
          creado_en: { gte: inicioSemana },
        },
      }),
      prisma.logs.groupBy({
        by: ['usuario_id'],
        where: {
          creado_en: { gte: inicioSemana },
        },
        _count: {
          usuario_id: true,
        },
      }),
      prisma.logs.findMany({
        take: 10,
        orderBy: { creado_en: 'desc' },
        include: {
          usuario: {
            select: {
              nombre: true,
              username: true,
            },
          },
        },
      }),
    ]);

    return {
      totalLogs,
      logsEsteMes,
      logsEstaSemana,
      usuariosActivos: usuariosActivos.length,
      accionesRecientes,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de actividad:", error);
    return {
      totalLogs: 0,
      logsEsteMes: 0,
      logsEstaSemana: 0,
      usuariosActivos: 0,
      accionesRecientes: [],
    };
  }
}
