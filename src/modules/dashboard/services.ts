import { prisma } from "../../lib/prisma";

export interface DashboardStats {
  totalElementos: number;
  totalCategorias: number;
  totalUsuarios: number;
  totalTickets: number;
  elementosEnStock: number;
  ticketsActivos: number;
  ticketsPendientes: number;
  reportesGenerados: number;
  elementosMesAnterior: number;
  categoriasMesAnterior: number;
  usuariosMesAnterior: number;
  ticketsSemanaAnterior: number;
}

export interface ActividadReciente {
  id: number;
  tipo: string;
  descripcion: string;
  fecha: Date;
  usuario?: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0);
  const inicioSemanaAnterior = new Date(now);
  inicioSemanaAnterior.setDate(now.getDate() - 7);

  const [
    totalElementos,
    totalCategorias,
    totalUsuarios,
    totalTickets,
    elementosEnStock,
    ticketsActivos,
    ticketsPendientes,
    reportesGenerados,
    elementosMesAnterior,
    categoriasMesAnterior,
    usuariosMesAnterior,
    ticketsSemanaAnterior,
  ] = await Promise.all([
    // Totales
    prisma.elementos.count(),
    prisma.categorias.count(),
    prisma.usuarios.count(),
    prisma.tickets_guardados.count(),
    
    // Estados específicos
    prisma.elementos.count({
      where: {
        cantidad: {
          gt: 0
        }
      }
    }),
    // Tickets activos: tickets cuyo motivo no indique cierre (devuelto / completado / entregado)
    prisma.tickets_guardados.count({
      where: {
        NOT: [
          { motivo: { contains: "devuelto" } },
          { motivo: { contains: "completado" } },
          { motivo: { contains: "entregado" } },
        ],
      }
    }),
    prisma.tickets_guardados.count({
      where: {
        fecha_estimada_devolucion: {
          gte: now
        }
      }
    }),
    prisma.reportes_generados.count(),
    
    // Comparaciones temporales
    prisma.elementos.count({
      where: {
        creado_en: {
          gte: inicioMesAnterior,
          lte: finMesAnterior
        }
      }
    }),
    prisma.categorias.count({
      where: {
        created_at: {
          gte: inicioMesAnterior,
          lte: finMesAnterior
        }
      }
    }),
    prisma.usuarios.count({
      where: {
        creado_en: {
          gte: inicioMesAnterior,
          lte: finMesAnterior
        }
      }
    }),
    prisma.tickets_guardados.count({
      where: {
        fecha_salida: {
          gte: inicioSemanaAnterior
        }
      }
    }),
  ]);

  return {
    totalElementos,
    totalCategorias,
    totalUsuarios,
    totalTickets,
    elementosEnStock,
    ticketsActivos,
    ticketsPendientes,
    reportesGenerados,
    elementosMesAnterior,
    categoriasMesAnterior,
    usuariosMesAnterior,
    ticketsSemanaAnterior,
  };
}

export async function getActividadReciente(): Promise<ActividadReciente[]> {
  const actividades: ActividadReciente[] = [];

  // Obtener elementos recientes
  const elementosRecientes = await prisma.elementos.findMany({
    take: 3,
    orderBy: { creado_en: 'desc' },
    include: {
      categoria: true
    }
  });

  elementosRecientes.forEach(elemento => {
    actividades.push({
      id: elemento.id,
      tipo: 'elemento',
      descripcion: `Nuevo elemento agregado: ${elemento.serie}`,
      fecha: elemento.creado_en,
    });
  });

  // Obtener tickets recientes (préstamos)
  const ticketsRecientes = await prisma.tickets_guardados.findMany({
    take: 3,
    orderBy: { fecha_salida: "desc" },
  });

  ticketsRecientes.forEach((ticket) => {
    actividades.push({
      id: ticket.id,
      tipo: "ticket",
      descripcion: `Ticket (préstamo): ${ticket.numero_ticket}`,
      fecha: ticket.fecha_salida,
    });
  });

  // Obtener usuarios recientes
  const usuariosRecientes = await prisma.usuarios.findMany({
    take: 2,
    orderBy: { creado_en: 'desc' }
  });

  usuariosRecientes.forEach(usuario => {
    actividades.push({
      id: usuario.id,
      tipo: 'usuario',
      descripcion: `Usuario registrado: ${usuario.nombre}`,
      fecha: usuario.creado_en,
      usuario: usuario.nombre,
    });
  });

  // Ordenar por fecha y tomar los 5 más recientes
  return actividades
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, 5);
}

export async function getMovimientosData() {
  const now = new Date();
  const last6Months = new Date();
  last6Months.setMonth(now.getMonth() - 6);

  // Movimientos quedó deprecado: usamos tickets como "transacciones de préstamo"
  const tickets = await prisma.tickets_guardados.findMany({
    where: {
      fecha_salida: {
        gte: last6Months
      }
    },
    select: {
      fecha_salida: true,
      motivo: true,
    }
  });

  // Agrupar por mes
  const movimientosPorMes: { [key: string]: { movimientos: number; prestamos: number; devoluciones: number } } = {};
  
  tickets.forEach((ticket) => {
    const mes = ticket.fecha_salida.toLocaleDateString("es-ES", { month: "short" });
    if (!movimientosPorMes[mes]) {
      movimientosPorMes[mes] = { movimientos: 0, prestamos: 0, devoluciones: 0 };
    }
    movimientosPorMes[mes].movimientos++;
    movimientosPorMes[mes].prestamos++;

    const motivo = (ticket.motivo ?? "").toLowerCase();
    const cerrado =
      motivo.includes("devuelto") || motivo.includes("completado") || motivo.includes("entregado");
    if (cerrado) movimientosPorMes[mes].devoluciones++;
  });

  return Object.entries(movimientosPorMes).map(([name, data]) => ({
    name,
    movimientos: data.movimientos,
    prestamos: data.prestamos,
    devoluciones: data.devoluciones
  }));
}

export async function getCategoriasData() {
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
}

export async function getEstadosData() {
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
}