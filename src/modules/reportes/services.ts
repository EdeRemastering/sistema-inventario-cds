import { prisma } from "../../lib/prisma";
import type { InventarioReporteData, MovimientosReporteData, PrestamosActivosReporteData } from "../../lib/report-generator";

/**
 * Obtiene todos los elementos del inventario con sus relaciones para el reporte
 */
export async function getInventarioReporteData(): Promise<InventarioReporteData> {
  const elementos = await prisma.elementos.findMany({
    include: {
      categoria: {
        select: {
          nombre: true
        }
      },
      subcategoria: {
        select: {
          nombre: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  return {
    elementos: elementos.map(elemento => ({
      id: elemento.id,
      serie: elemento.serie,
      marca: elemento.marca,
      modelo: elemento.modelo,
      cantidad: elemento.cantidad,
      ubicacion: elemento.ubicacion,
      estado_funcional: elemento.estado_funcional,
      estado_fisico: elemento.estado_fisico,
      categoria: { nombre: elemento.categoria.nombre },
      subcategoria: elemento.subcategoria ? { nombre: elemento.subcategoria.nombre } : null
    }))
  };
}

/**
 * Obtiene movimientos filtrados por rango de fechas para el reporte
 */
export async function getMovimientosReporteData(
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<MovimientosReporteData> {
  const whereClause: { fecha_movimiento?: { gte: Date; lte: Date } } = {};
  
  if (fechaInicio && fechaFin) {
    whereClause.fecha_movimiento = {
      gte: fechaInicio,
      lte: fechaFin
    };
  }

  const movimientos = await prisma.movimientos.findMany({
    where: whereClause,
    include: {
      elemento: {
        select: {
          serie: true,
          marca: true,
          modelo: true
        }
      }
    },
    orderBy: {
      fecha_movimiento: 'desc'
    }
  });

  return {
    movimientos: movimientos.map(movimiento => ({
      id: movimiento.id,
      numero_ticket: movimiento.numero_ticket,
      fecha_movimiento: movimiento.fecha_movimiento,
      tipo: movimiento.tipo,
      cantidad: movimiento.cantidad,
      elemento: {
        serie: movimiento.elemento.serie,
        marca: movimiento.elemento.marca,
        modelo: movimiento.elemento.modelo
      },
      dependencia_entrega: movimiento.dependencia_entrega,
      funcionario_entrega: movimiento.firma_funcionario_entrega || 'N/A',
      dependencia_recibe: movimiento.dependencia_recibe,
      funcionario_recibe: movimiento.firma_funcionario_recibe || 'N/A',
      fecha_estimada_devolucion: movimiento.fecha_estimada_devolucion,
      fecha_real_devolucion: movimiento.fecha_real_devolucion
    }))
  };
}

/**
 * Obtiene préstamos activos (movimientos sin fecha de devolución real) para el reporte
 */
export async function getPrestamosActivosReporteData(): Promise<PrestamosActivosReporteData> {
  const movimientos = await prisma.movimientos.findMany({
    where: {
      tipo: 'SALIDA',
      fecha_real_devolucion: null
    },
    include: {
      elemento: {
        select: {
          serie: true,
          marca: true,
          modelo: true
        }
      }
    },
    orderBy: {
      fecha_movimiento: 'desc'
    }
  });

  return {
    prestamos: movimientos.map(movimiento => ({
      id: movimiento.id,
      numero_ticket: movimiento.numero_ticket,
      fecha_movimiento: movimiento.fecha_movimiento,
      cantidad: movimiento.cantidad,
      elemento: {
        serie: movimiento.elemento.serie,
        marca: movimiento.elemento.marca,
        modelo: movimiento.elemento.modelo
      },
      dependencia_recibe: movimiento.dependencia_recibe,
      funcionario_recibe: movimiento.firma_funcionario_recibe || 'N/A',
      fecha_estimada_devolucion: movimiento.fecha_estimada_devolucion
    }))
  };
}

/**
 * Obtiene reporte de categorías con estadísticas
 */
export async function getCategoriasReporteData() {
  const categorias = await prisma.categorias.findMany({
    include: {
      _count: {
        select: {
          elementos: true,
          subcategorias: true
        }
      }
    },
    orderBy: {
      nombre: 'asc'
    }
  });

  return categorias.map(categoria => ({
    id: categoria.id,
    nombre: categoria.nombre,
    descripcion: categoria.descripcion || 'N/A',
    estado: categoria.estado,
    total_elementos: categoria._count.elementos,
    total_subcategorias: categoria._count.subcategorias,
    creado_en: categoria.created_at
  }));
}

/**
 * Obtiene reporte de observaciones con información del elemento
 */
export async function getObservacionesReporteData(
  fechaInicio?: Date,
  fechaFin?: Date
) {
  const whereClause: { fecha_observacion?: { gte: Date; lte: Date } } = {};
  
  if (fechaInicio && fechaFin) {
    whereClause.fecha_observacion = {
      gte: fechaInicio,
      lte: fechaFin
    };
  }

  const observaciones = await prisma.observaciones.findMany({
    where: whereClause,
    include: {
      elemento: {
        select: {
          serie: true,
          marca: true,
          modelo: true,
          categoria: {
            select: {
              nombre: true
            }
          }
        }
      }
    },
    orderBy: {
      fecha_observacion: 'desc'
    }
  });

  return observaciones.map(observacion => ({
    id: observacion.id,
    fecha_observacion: observacion.fecha_observacion,
    descripcion: observacion.descripcion,
    elemento_serie: observacion.elemento.serie,
    elemento_marca: observacion.elemento.marca || 'N/A',
    elemento_modelo: observacion.elemento.modelo || 'N/A',
    elemento_categoria: observacion.elemento.categoria.nombre,
    creado_en: observacion.creado_en
  }));
}

/**
 * Obtiene reporte de tickets guardados
 */
export async function getTicketsReporteData(
  fechaInicio?: Date,
  fechaFin?: Date
) {
  const whereClause: { fecha_salida?: { gte: Date; lte: Date } } = {};
  
  if (fechaInicio && fechaFin) {
    whereClause.fecha_salida = {
      gte: fechaInicio,
      lte: fechaFin
    };
  }

  const tickets = await prisma.tickets_guardados.findMany({
    where: whereClause,
    orderBy: {
      fecha_salida: 'desc'
    }
  });

  return tickets.map(ticket => ({
    id: ticket.id,
    numero_ticket: ticket.numero_ticket,
    fecha_salida: ticket.fecha_salida,
    fecha_estimada_devolucion: ticket.fecha_estimada_devolucion,
    elemento: ticket.elemento || 'N/A',
    serie: ticket.serie || 'N/A',
    marca_modelo: ticket.marca_modelo || 'N/A',
    cantidad: ticket.cantidad,
    dependencia_entrega: ticket.dependencia_entrega || 'N/A',
    dependencia_recibe: ticket.dependencia_recibe || 'N/A',
    motivo: ticket.motivo || 'N/A',
    orden_numero: ticket.orden_numero || 'N/A',
    fecha_guardado: ticket.fecha_guardado,
    usuario_guardado: ticket.usuario_guardado || 'N/A'
  }));
}

/**
 * Obtiene estadísticas generales para los reportes
 */
export async function getReporteStats() {
  const [
    totalElementos,
    totalMovimientos,
    totalPrestamosActivos,
    totalCategorias,
    totalObservaciones,
    totalTickets
  ] = await Promise.all([
    prisma.elementos.count(),
    prisma.movimientos.count(),
    prisma.movimientos.count({
      where: {
        tipo: 'SALIDA',
        fecha_real_devolucion: null
      }
    }),
    prisma.categorias.count(),
    prisma.observaciones.count(),
    prisma.tickets_guardados.count()
  ]);

  return {
    totalElementos,
    totalMovimientos,
    totalPrestamosActivos,
    totalCategorias,
    totalObservaciones,
    totalTickets
  };
}
