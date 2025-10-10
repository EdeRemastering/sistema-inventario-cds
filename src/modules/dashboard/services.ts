import { prisma } from "../../lib/prisma";

export interface DashboardStats {
  totalElementos: number;
  totalCategorias: number;
  totalUsuarios: number;
  totalMovimientos: number;
  elementosEnStock: number;
  elementosPrestados: number;
  ticketsPendientes: number;
  reportesGenerados: number;
  elementosMesAnterior: number;
  categoriasMesAnterior: number;
  usuariosMesAnterior: number;
  movimientosSemanaAnterior: number;
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
    totalMovimientos,
    elementosEnStock,
    elementosPrestados,
    ticketsPendientes,
    reportesGenerados,
    elementosMesAnterior,
    categoriasMesAnterior,
    usuariosMesAnterior,
    movimientosSemanaAnterior,
  ] = await Promise.all([
    // Totales
    prisma.elementos.count(),
    prisma.categorias.count(),
    prisma.usuarios.count(),
    prisma.movimientos.count(),
    
    // Estados específicos
    prisma.elementos.count({
      where: {
        cantidad: {
          gt: 0
        }
      }
    }),
    prisma.movimientos.count({
      where: {
        fecha_estimada_devolucion: {
          gte: now
        },
        tipo: "SALIDA"
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
    prisma.movimientos.count({
      where: {
        fecha_movimiento: {
          gte: inicioSemanaAnterior
        }
      }
    }),
  ]);

  return {
    totalElementos,
    totalCategorias,
    totalUsuarios,
    totalMovimientos,
    elementosEnStock,
    elementosPrestados,
    ticketsPendientes,
    reportesGenerados,
    elementosMesAnterior,
    categoriasMesAnterior,
    usuariosMesAnterior,
    movimientosSemanaAnterior,
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

  // Obtener movimientos recientes
  const movimientosRecientes = await prisma.movimientos.findMany({
    take: 3,
    orderBy: { fecha_movimiento: 'desc' },
    include: {
      elemento: true
    }
  });

  movimientosRecientes.forEach(movimiento => {
    actividades.push({
      id: movimiento.id,
      tipo: 'movimiento',
      descripcion: `Movimiento de elemento: ${movimiento.elemento.serie}`,
      fecha: movimiento.fecha_movimiento,
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