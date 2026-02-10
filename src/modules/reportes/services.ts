import { prisma } from "../../lib/prisma";
import type { InventarioReporteData, MovimientosReporteData, PrestamosActivosReporteData, CategoriasReporteData, ObservacionesReporteData, TicketsReporteData } from "../../lib/report-generator";

/**
 * Obtiene todos los elementos del inventario con sus relaciones para el reporte
 */
export async function getInventarioReporteData(): Promise<InventarioReporteData> {
  const elementos = await prisma.elementos.findMany({
    include: {
      categoria: { select: { nombre: true } },
      subcategoria: { select: { nombre: true } },
      ubicacion_rel: { select: { codigo: true, nombre: true, sede: { select: { nombre: true } } } },
    },
    orderBy: { id: "asc" },
  });

  return {
    elementos: elementos.map((e) => ({
      id: e.id,
      serie: e.serie,
      marca: e.marca,
      modelo: e.modelo,
      cantidad: e.cantidad,
      ubicacion:
        e.ubicacion_rel
          ? `${e.ubicacion_rel.codigo} - ${e.ubicacion_rel.nombre}${e.ubicacion_rel.sede ? ` (${e.ubicacion_rel.sede.nombre})` : ""}`
          : e.ubicacion ?? "",
      estado_funcional: e.estado_funcional,
      estado_fisico: e.estado_fisico,
      categoria: { nombre: e.categoria.nombre },
      subcategoria: e.subcategoria ? { nombre: e.subcategoria.nombre } : null,
    })),
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
    where: { tipo: "SALIDA", fecha_real_devolucion: null },
    include: {
      elemento: { select: { serie: true, marca: true, modelo: true } },
    },
    orderBy: { fecha_movimiento: "desc" },
  });

  const ticketsActivos = await prisma.tickets_guardados.findMany({
    where: { fecha_devolucion_real: null },
    include: {
      ticket_elementos: {
        include: { elemento: { select: { serie: true, marca: true, modelo: true } } },
      },
    },
    orderBy: { fecha_salida: "desc" },
  });

  const prestamosMov = movimientos.map((m) => ({
    id: m.id,
    numero_ticket: m.numero_ticket,
    fecha_movimiento: m.fecha_movimiento,
    cantidad: m.cantidad,
    elemento: {
      serie: m.elemento.serie,
      marca: m.elemento.marca,
      modelo: m.elemento.modelo,
    },
    dependencia_recibe: m.dependencia_recibe,
    funcionario_recibe: m.firma_funcionario_recibe || "N/A",
    fecha_estimada_devolucion: m.fecha_estimada_devolucion,
  }));

  const prestamosTickets = ticketsActivos.flatMap((t) =>
    (t.ticket_elementos ?? []).map((te) => ({
      id: t.id,
      numero_ticket: t.numero_ticket,
      fecha_movimiento: t.fecha_salida,
      cantidad: te.cantidad,
      elemento: {
        serie: te.elemento?.serie ?? "",
        marca: te.elemento?.marca ?? null,
        modelo: te.elemento?.modelo ?? null,
      },
      dependencia_recibe: t.dependencia_recibe || "N/A",
      funcionario_recibe: t.responsable_nombre || t.persona_recibe_nombre
        ? `${t.persona_recibe_nombre ?? ""} ${t.persona_recibe_apellido ?? ""}`.trim() || t.responsable_nombre || "N/A"
        : "N/A",
      fecha_estimada_devolucion: t.fecha_estimada_devolucion,
    }))
  );

  return {
    prestamos: [...prestamosMov, ...prestamosTickets],
  };
}

/**
 * Obtiene reporte de categorías con estadísticas
 */
export async function getCategoriasReporteData(): Promise<CategoriasReporteData> {
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

  return {
    categorias: categorias.map(categoria => ({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || 'N/A',
      estado: categoria.estado,
      total_elementos: categoria._count.elementos,
      total_subcategorias: categoria._count.subcategorias,
      creado_en: categoria.created_at
    }))
  };
}

/**
 * Obtiene reporte de observaciones con información del elemento
 */
export async function getObservacionesReporteData(
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<ObservacionesReporteData> {
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

  return {
    observaciones: observaciones.map(observacion => ({
      id: observacion.id,
      fecha_observacion: observacion.fecha_observacion,
      descripcion: observacion.descripcion,
      elemento_serie: observacion.elemento.serie,
      elemento_marca: observacion.elemento.marca || 'N/A',
      elemento_modelo: observacion.elemento.modelo || 'N/A',
      elemento_categoria: observacion.elemento.categoria.nombre,
      creado_en: observacion.creado_en
    }))
  };
}

/**
 * Obtiene reporte de tickets guardados
 */
export async function getTicketsReporteData(
  fechaInicio?: Date,
  fechaFin?: Date
): Promise<TicketsReporteData> {
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

  return {
    tickets: tickets.map(ticket => ({
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
    }))
  };
}

/**
 * Obtiene estadísticas para la página de reportes (solo tickets)
 */
export async function getReporteStats() {
  const totalTickets = await prisma.tickets_guardados.count();
  return { totalTickets };
}
