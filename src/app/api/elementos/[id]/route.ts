import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { logAction } from "../../../../lib/audit-logger";

// GET /api/elementos/[id] - Obtener elemento por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const elemento = await prisma.elementos.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        subcategoria: true,
        movimientos: {
          orderBy: { fecha_movimiento: "desc" },
          take: 10,
        },
      },
    });

    if (!elemento) {
      return NextResponse.json(
        { success: false, error: "Elemento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: elemento,
    });
  } catch (error) {
    console.error("Error obteniendo elemento:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/elementos/[id] - Actualizar elemento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const elementoId = parseInt(id);

    const elemento = await prisma.elementos.update({
      where: { id: elementoId },
      data: {
        serie: body.serie,
        marca: body.marca,
        modelo: body.modelo,
        cantidad: body.cantidad,
        ubicacion: body.ubicacion,
        estado_funcional: body.estado_funcional,
        estado_fisico: body.estado_fisico,
        categoria_id: body.categoria_id ? parseInt(body.categoria_id) : undefined,
        subcategoria_id: body.subcategoria_id ? parseInt(body.subcategoria_id) : null,
        codigo_equipo: body.codigo_equipo,
        observaciones: body.observaciones,
      },
      include: {
        categoria: true,
        subcategoria: true,
      },
    });

    // Log de auditoría
    await logAction({
      action: "UPDATE",
      entity: "elemento",
      entityId: elemento.id,
      details: `Elemento actualizado via API: ${elemento.serie}`,
    });

    return NextResponse.json({
      success: true,
      data: elemento,
    });
  } catch (error) {
    console.error("Error actualizando elemento:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/elementos/[id] - Eliminar elemento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const elementoId = parseInt(id);

    // Verificar si el elemento existe
    const elemento = await prisma.elementos.findUnique({
      where: { id: elementoId },
    });

    if (!elemento) {
      return NextResponse.json(
        { success: false, error: "Elemento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar elemento
    await prisma.elementos.delete({
      where: { id: elementoId },
    });

    // Log de auditoría
    await logAction({
      action: "DELETE",
      entity: "elemento",
      entityId: elementoId,
      details: `Elemento eliminado via API: ${elemento.serie}`,
    });

    return NextResponse.json({
      success: true,
      message: "Elemento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando elemento:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
