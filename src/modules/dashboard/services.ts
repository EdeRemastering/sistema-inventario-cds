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
