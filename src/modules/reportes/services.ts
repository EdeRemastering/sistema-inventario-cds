import { prisma } from "../../lib/prisma";
import type { InventarioReporteData, MovimientosReporteData, PrestamosActivosReporteData, CategoriasReporteData, ObservacionesReporteData, TicketsReporteData } from "../../lib/report-generator";

type InventarioFilters = {
  ubicacionId?: number;
  categoriaId?: number;
  fechaEntradaInicio?: Date;
  fechaEntradaFin?: Date;
};

/**
 * Obtiene todos los elementos del inventario con sus relaciones para el reporte
 */
export async function getInventarioReporteData(filters?: InventarioFilters): Promise<InventarioReporteData> {
  const where: Record<string, unknown> = { deleted_at: null };

  if (filters?.ubicacionId) where.ubicacion_id = filters.ubicacionId;
  if (filters?.categoriaId) where.categoria_id = filters.categoriaId;
  if (filters?.fechaEntradaInicio || filters?.fechaEntradaFin) {
    where.fecha_entrada = {};
    if (filters.fechaEntradaInicio) (where.fecha_entrada as Record<string, Date>).gte = filters.fechaEntradaInicio;
    if (filters.fechaEntradaFin) (where.fecha_entrada as Record<string, Date>).lte = filters.fechaEntradaFin;
  }

  const elementos = await prisma.elementos.findMany({
    where,
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
 * Obtiene movimientos filtrados por rango de fechas y ubicación para el reporte
 */
export async function getMovimientosReporteData(
  fechaInicio?: Date,
  fechaFin?: Date,
  ubicacionId?: number
): Promise<MovimientosReporteData> {
  const andClauses: Record<string, unknown>[] = [];
  if (fechaInicio || fechaFin) {
    const fechaFilter: Record<string, Date> = {};
    if (fechaInicio) fechaFilter.gte = fechaInicio;
    if (fechaFin) fechaFilter.lte = fechaFin;
    andClauses.push({ fecha_movimiento: fechaFilter });
  }
  if (ubicacionId) {
    andClauses.push({
      OR: [
        { ubicacion_anterior_id: ubicacionId },
        { ubicacion_nueva_id: ubicacionId },
      ],
    });
  }
  const whereClause = andClauses.length > 0 ? { AND: andClauses } : {};

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
export async function getPrestamosActivosReporteData(ubicacionId?: number): Promise<PrestamosActivosReporteData> {
  const movimientosWhere = ubicacionId
    ? {
        tipo: "SALIDA" as const,
        fecha_real_devolucion: null,
        OR: [
          { ubicacion_anterior_id: ubicacionId },
          { ubicacion_nueva_id: ubicacionId },
        ],
      }
    : { tipo: "SALIDA" as const, fecha_real_devolucion: null };
  const movimientos = await prisma.movimientos.findMany({
    where: movimientosWhere,
    include: {
      elemento: { select: { serie: true, marca: true, modelo: true } },
    },
    orderBy: { fecha_movimiento: "desc" },
  });

  const whereTickets: Record<string, unknown> = { fecha_devolucion_real: null };
  if (ubicacionId) whereTickets.ubicacion_id = ubicacionId;
  const ticketsActivos = await prisma.tickets_guardados.findMany({
    where: whereTickets,
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
      funcionario_recibe: (t as { persona_recibe_nombre?: string; persona_recibe_apellido?: string; responsable_nombre?: string }).persona_recibe_nombre
        ? `${(t as { persona_recibe_nombre: string; persona_recibe_apellido?: string }).persona_recibe_nombre} ${(t as { persona_recibe_apellido?: string }).persona_recibe_apellido ?? ""}`.trim()
        : (t as { responsable_nombre?: string }).responsable_nombre || "N/A",
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
export async function getCategoriasReporteData(categoriaId?: number): Promise<CategoriasReporteData> {
  const categorias = await prisma.categorias.findMany({
    where: categoriaId ? { id: categoriaId } : undefined,
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
  fechaFin?: Date,
  categoriaId?: number
): Promise<ObservacionesReporteData> {
  const whereClause: Record<string, unknown> = {};

  if (fechaInicio || fechaFin) {
    whereClause.fecha_observacion = {};
    if (fechaInicio) (whereClause.fecha_observacion as Record<string, Date>).gte = fechaInicio;
    if (fechaFin) (whereClause.fecha_observacion as Record<string, Date>).lte = fechaFin;
  }
  if (categoriaId) {
    whereClause.elemento = { categoria_id: categoriaId };
  }

  const observaciones = await prisma.observaciones.findMany({
    where: Object.keys(whereClause).length ? whereClause : undefined,
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
  fechaFin?: Date,
  ubicacionId?: number
): Promise<TicketsReporteData> {
  const whereClause: Record<string, unknown> = {};

  if (fechaInicio || fechaFin) {
    whereClause.fecha_salida = {};
    if (fechaInicio) (whereClause.fecha_salida as Record<string, Date>).gte = fechaInicio;
    if (fechaFin) (whereClause.fecha_salida as Record<string, Date>).lte = fechaFin;
  }
  if (ubicacionId) whereClause.ubicacion_id = ubicacionId;

  const tickets = await prisma.tickets_guardados.findMany({
    where: Object.keys(whereClause).length ? whereClause : undefined,
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
