import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { logAction } from "../../../lib/audit-logger";

// GET /api/elementos - Obtener todos los elementos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const stock = searchParams.get("stock");
    const limit = searchParams.get("limit");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (categoria) {
      where.categoria = { nombre: { contains: categoria } };
    }

    if (stock === "bajo") {
      // Aquí implementarías la lógica para elementos con stock bajo
      // Por ahora simplemente filtramos por cantidad menor a 5
      where.cantidad = { lt: 5 };
    }

    const elementos = await prisma.elementos.findMany({
      where,
      include: {
        categoria: true,
        subcategoria: true,
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: { creado_en: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: elementos,
      count: elementos.length,
    });
  } catch (error) {
    console.error("Error obteniendo elementos:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/elementos - Crear nuevo elemento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.serie || !body.categoria_id) {
      return NextResponse.json(
        { success: false, error: "Serie y categoría son requeridos" },
        { status: 400 }
      );
    }

    const elemento = await prisma.elementos.create({
      data: {
        serie: body.serie,
        marca: body.marca || null,
        modelo: body.modelo || null,
        cantidad: body.cantidad || 1,
        ubicacion: body.ubicacion || null,
        estado_funcional: body.estado_funcional || "B",
        estado_fisico: body.estado_fisico || "B",
        categoria_id: parseInt(body.categoria_id),
        subcategoria_id: body.subcategoria_id ? parseInt(body.subcategoria_id) : null,
        codigo_equipo: body.codigo_equipo || null,
        observaciones: body.observaciones || null,
        fecha_entrada: body.fecha_entrada ? new Date(body.fecha_entrada) : new Date(),
      },
      include: {
        categoria: true,
        subcategoria: true,
      },
    });

    // Log de auditoría
    await logAction({
      action: "CREATE",
      entity: "elemento",
      entityId: elemento.id,
      details: `Elemento creado via API: ${elemento.serie}`,
    });

    return NextResponse.json({
      success: true,
      data: elemento,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creando elemento:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
