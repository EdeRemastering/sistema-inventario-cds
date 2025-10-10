"use server";

import { prisma } from "../../lib/prisma";
import { withDatabaseRetry } from "../../lib/db-connection";

export async function getMovimientosDataAction() {
  return withDatabaseRetry(async () => {
    const now = new Date();
    const last6Months = new Date();
    last6Months.setMonth(now.getMonth() - 6);

    // Obtener movimientos de los últimos 6 meses agrupados por mes
    const movimientos = await prisma.movimientos.findMany({
      where: {
        fecha_movimiento: {
          gte: last6Months
        }
      },
      select: {
        fecha_movimiento: true,
        tipo: true
      }
    });

    // Agrupar por mes
    const movimientosPorMes: { [key: string]: { movimientos: number; prestamos: number; devoluciones: number } } = {};
    
    movimientos.forEach(movimiento => {
      const mes = movimiento.fecha_movimiento.toLocaleDateString('es-ES', { month: 'short' });
      if (!movimientosPorMes[mes]) {
        movimientosPorMes[mes] = { movimientos: 0, prestamos: 0, devoluciones: 0 };
      }
      movimientosPorMes[mes].movimientos++;
      if (movimiento.tipo === 'SALIDA') {
        movimientosPorMes[mes].prestamos++;
      } else {
        movimientosPorMes[mes].devoluciones++;
      }
    });

    return Object.entries(movimientosPorMes).map(([name, data]) => ({
      name,
      movimientos: data.movimientos,
      prestamos: data.prestamos,
      devoluciones: data.devoluciones
    }));
  });
}

export async function getDashboardStatsAction() {
  return withDatabaseRetry(async () => {
    const [
      totalElementos,
      totalCategorias,
      totalMovimientos,
      movimientosPendientes
    ] = await Promise.all([
      prisma.elementos.count(),
      prisma.categorias.count(),
      prisma.movimientos.count(),
      prisma.movimientos.count({
        where: {
          tipo: 'SALIDA',
          fecha_real_devolucion: null
        }
      })
    ]);

    return {
      totalElementos,
      totalCategorias,
      totalMovimientos,
      movimientosPendientes
    };
  });
}

export async function getRecentActivityAction() {
  return withDatabaseRetry(async () => {
    const [movimientos, elementos, categorias] = await Promise.all([
      prisma.movimientos.findMany({
        take: 10,
        orderBy: { fecha_movimiento: 'desc' },
        select: {
          id: true,
          fecha_movimiento: true,
          tipo: true,
          numero_ticket: true,
          elemento: {
            select: {
              serie: true,
              categoria: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      }),
      prisma.elementos.findMany({
        take: 5,
        orderBy: { creado_en: 'desc' },
        select: {
          id: true,
          serie: true,
          creado_en: true,
          categoria: {
            select: {
              nombre: true
            }
          }
        }
      }),
      prisma.categorias.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          nombre: true,
          created_at: true
        }
      })
    ]);

    const actividades: Array<{
      id: string;
      tipo: string;
      descripcion: string;
      fecha: Date;
    }> = [];

    // Agregar movimientos como actividades
    movimientos.forEach(mov => {
      actividades.push({
        id: `mov-${mov.id}`,
        tipo: mov.tipo === 'SALIDA' ? 'prestamo' : 'devolucion',
        descripcion: `${mov.tipo === 'SALIDA' ? 'Préstamo' : 'Devolución'} - ${mov.elemento.serie} (${mov.elemento.categoria.nombre}) - Ticket: ${mov.numero_ticket}`,
        fecha: mov.fecha_movimiento
      });
    });

    // Agregar elementos como actividades
    elementos.forEach(elem => {
      actividades.push({
        id: `elem-${elem.id}`,
        tipo: 'elemento',
        descripcion: `Nuevo elemento: ${elem.serie} (${elem.categoria.nombre})`,
        fecha: elem.creado_en
      });
    });

    // Agregar categorías como actividades
    categorias.forEach(cat => {
      actividades.push({
        id: `cat-${cat.id}`,
        tipo: 'categoria',
        descripcion: `Nueva categoría: ${cat.nombre}`,
        fecha: cat.created_at
      });
    });

    // Ordenar por fecha y tomar los 5 más recientes
    return actividades
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 5);
  });
}

export async function getCategoriasDataAction() {
  return withDatabaseRetry(async () => {
    // Obtener elementos agrupados por categoría
    const categorias = await prisma.categorias.findMany({
      include: {
        elementos: true
      }
    });

    return categorias.map(categoria => ({
      name: categoria.nombre,
      elementos: categoria.elementos.length,
      value: categoria.elementos.length
    }));
  });
}

export async function getEstadosDataAction() {
  return withDatabaseRetry(async () => {
    const now = new Date();
    
    const [elementosEnStock, elementosPrestados, elementosFueraServicio, elementosEnMantenimiento] = await Promise.all([
      // En stock: elementos con cantidad > 0
      prisma.elementos.count({
        where: {
          cantidad: {
            gt: 0
          }
        }
      }),
      
      // Prestados: movimientos activos
      prisma.movimientos.count({
        where: {
          tipo: 'SALIDA',
          fecha_estimada_devolucion: {
            gte: now
          }
        }
      }),
      
      // Fuera de servicio: elementos con estado específico
      prisma.elementos.count({
        where: {
          estado_funcional: 'MALO'
        }
      }),
      
      // En mantenimiento: elementos con estado específico
      prisma.elementos.count({
        where: {
          estado_funcional: 'EN_REPARACION'
        }
      })
    ]);

    return [
      {
        name: "En Stock",
        elementos: elementosEnStock,
        value: elementosEnStock,
      },
      {
        name: "Prestados",
        elementos: elementosPrestados,
        value: elementosPrestados,
      },
      {
        name: "Fuera de Servicio",
        elementos: elementosFueraServicio,
        value: elementosFueraServicio,
      },
      {
        name: "En Mantenimiento",
        elementos: elementosEnMantenimiento,
        value: elementosEnMantenimiento,
      },
    ];
  });
}
