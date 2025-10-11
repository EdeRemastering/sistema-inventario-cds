"use server";

import { prisma } from "../../lib/prisma";

/**
 * Limpia el historial de reportes, manteniendo solo los últimos 50 registros
 */
export async function actionCleanupReportes() {
  try {
    // Obtener todos los reportes ordenados por fecha
    const reportes = await prisma.reportes_generados.findMany({
      orderBy: { fecha_generacion: 'desc' },
      select: { id: true }
    });

    // Si hay más de 50, eliminar los más antiguos
    if (reportes.length > 50) {
      const idsToDelete = reportes.slice(50).map(r => r.id);
      
      await prisma.reportes_generados.deleteMany({
        where: { id: { in: idsToDelete } }
      });

      return { 
        success: true, 
        message: `Se eliminaron ${idsToDelete.length} registros antiguos del historial` 
      };
    }

    return { 
      success: true, 
      message: "El historial está limpio, no se necesitan eliminaciones" 
    };

  } catch (error) {
    console.error("Error limpiando historial:", error);
    return { 
      success: false, 
      message: "Error al limpiar el historial de reportes" 
    };
  }
}


