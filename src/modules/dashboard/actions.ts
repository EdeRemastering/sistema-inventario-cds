"use server";

import { prisma } from "../../lib/prisma";
import { withDatabaseRetry } from "../../lib/db-connection";

export async function getMovimientosDataAction() {
  return withDatabaseRetry(async () => {
    const now = new Date();
    const last6Months = new Date();
    last6Months.setMonth(now.getMonth() - 6);

    // Movimientos quedó deprecado: el préstamo vive en Tickets.
    // Agrupamos tickets por mes (fecha_salida) y consideramos "devoluciones"
    // como tickets cerrados (por ejemplo: motivo contiene "devuelto"/"completado").
    const tickets = await prisma.tickets_guardados.findMany({
      where: {
        fecha_salida: {
          gte: last6Months
        }
      },
      select: {
        fecha_salida: true,
        motivo: true
      }
    });

    // Agrupar por mes
    const movimientosPorMes: { [key: string]: { movimientos: number; prestamos: number; devoluciones: number } } = {};
    
    tickets.forEach(ticket => {
      const mes = ticket.fecha_salida.toLocaleDateString('es-ES', { month: 'short' });
      if (!movimientosPorMes[mes]) {
        movimientosPorMes[mes] = { movimientos: 0, prestamos: 0, devoluciones: 0 };
      }
      movimientosPorMes[mes].movimientos++;
      movimientosPorMes[mes].prestamos++;

      const motivo = (ticket.motivo ?? "").toLowerCase();
      const cerrrado =
        motivo.includes("devuelto") || motivo.includes("completado") || motivo.includes("entregado");
      if (cerrrado) movimientosPorMes[mes].devoluciones++;
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
      // Movimientos quedó deprecado: usamos Tickets como "transacciones de préstamo".
      prisma.tickets_guardados.count(),
      prisma.tickets_guardados.count({
        where: {
          NOT: [
            { motivo: { contains: "devuelto" } },
            { motivo: { contains: "completado" } },
            { motivo: { contains: "entregado" } },
          ],
        },
      }),
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
    const [tickets, elementos, categorias] = await Promise.all([
      // Movimientos quedó deprecado: actividad reciente basada en tickets.
      prisma.tickets_guardados.findMany({
        take: 10,
        orderBy: { fecha_salida: "desc" },
        select: {
          id: true,
          numero_ticket: true,
          fecha_salida: true,
          fecha_estimada_devolucion: true,
          dependencia_entrega: true,
          dependencia_recibe: true,
          motivo: true,
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

    // Agregar tickets como actividades (préstamo / devolución)
    tickets.forEach((t) => {
      const motivo = (t.motivo ?? "").toLowerCase();
      const cerrado =
        motivo.includes("devuelto") || motivo.includes("completado") || motivo.includes("entregado");

      actividades.push({
        id: `prestamo-${t.id}`,
        tipo: cerrado ? "devolucion" : "prestamo",
        descripcion: `${cerrado ? "Devolución" : "Préstamo"}: ${t.numero_ticket} (${t.dependencia_entrega} → ${t.dependencia_recibe})`,
        fecha: t.fecha_salida,
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
      
      // Prestados: tickets activos (movimientos quedó deprecado)
      prisma.tickets_guardados.count({
        where: {
          fecha_estimada_devolucion: {
            gte: now
          }
        }
      }),
      
      // Fuera de servicio: elementos con estado específico (usando 'I' para inactivo)
      prisma.elementos.count({
        where: {
          estado_funcional: 'I'
        }
      }),
      
      // En mantenimiento: elementos con estado específico (usando 'R' para reparación)
      prisma.elementos.count({
        where: {
          estado_funcional: 'R'
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
