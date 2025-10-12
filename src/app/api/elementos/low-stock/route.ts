import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    // Obtener elementos con stock bajo (cantidad <= 3)
    const elementosConStockBajo = await prisma.elementos.findMany({
      where: {
        cantidad: {
          lte: 3
        }
      },
      include: {
        categoria: true,
        subcategoria: true
      }
    });

    // Calcular stock disponible y prestado para cada elemento
    const elementosConCalculos = await Promise.all(
      elementosConStockBajo.map(async (elemento: {
        id: number;
        cantidad: number;
        serie: string;
        marca: string | null;
        modelo: string | null;
        ubicacion: string | null;
        estado_funcional: string;
        estado_fisico: string;
        categoria: { nombre: string };
        subcategoria: { nombre: string } | null;
      }) => {
        // Contar movimientos activos (prestados)
        const totalPrestado = await prisma.movimientos.count({
          where: {
            elemento_id: elemento.id,
            tipo: 'SALIDA',
            fecha_estimada_devolucion: {
              gte: new Date()
            }
          }
        });

        const availableStock = Math.max(0, elemento.cantidad - totalPrestado);

        return {
          id: elemento.id,
          serie: elemento.serie,
          marca: elemento.marca,
          modelo: elemento.modelo,
          cantidad: elemento.cantidad,
          ubicacion: elemento.ubicacion,
          estado_funcional: elemento.estado_funcional,
          estado_fisico: elemento.estado_fisico,
          categoria: { nombre: elemento.categoria.nombre },
          subcategoria: elemento.subcategoria ? { nombre: elemento.subcategoria.nombre } : null,
          availableStock,
          totalPrestado
        };
      })
    );

    return NextResponse.json(elementosConCalculos);
  } catch (error) {
    console.error("Error obteniendo elementos con stock bajo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
