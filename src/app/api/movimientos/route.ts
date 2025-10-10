import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { logAction } from "../../../lib/audit-logger";

// GET /api/movimientos - Obtener todos los movimientos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo");
    const elemento_id = searchParams.get("elemento_id");
    const fecha_inicio = searchParams.get("fecha_inicio");
    const fecha_fin = searchParams.get("fecha_fin");
    const limit = searchParams.get("limit");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (elemento_id) {
      where.elemento_id = parseInt(elemento_id);
    }

    if (fecha_inicio || fecha_fin) {
      where.fecha_movimiento = {};
      if (fecha_inicio) {
        where.fecha_movimiento.gte = new Date(fecha_inicio);
      }
      if (fecha_fin) {
        where.fecha_movimiento.lte = new Date(fecha_fin);
      }
    }

    const movimientos = await prisma.movimientos.findMany({
      where,
      include: {
        elemento: {
          include: {
            categoria: true,
            subcategoria: true,
          },
        },
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: { fecha_movimiento: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: movimientos,
      count: movimientos.length,
    });
  } catch (error) {
    console.error("Error obteniendo movimientos:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/movimientos - Crear nuevo movimiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.elemento_id || !body.fecha_movimiento || !body.tipo) {
      return NextResponse.json(
        { success: false, error: "Elemento, fecha y tipo son requeridos" },
        { status: 400 }
      );
    }

    const movimiento = await prisma.movimientos.create({
      data: {
        elemento_id: parseInt(body.elemento_id),
        cantidad: body.cantidad || 1,
        orden_numero: body.orden_numero || "",
        fecha_movimiento: new Date(body.fecha_movimiento),
        dependencia_entrega: body.dependencia_entrega || "",
        firma_funcionario_entrega: body.firma_funcionario_entrega || null,
        cargo_funcionario_entrega: body.cargo_funcionario_entrega || null,
        dependencia_recibe: body.dependencia_recibe || "",
        firma_funcionario_recibe: body.firma_funcionario_recibe || null,
        cargo_funcionario_recibe: body.cargo_funcionario_recibe || null,
        motivo: body.motivo || "",
        fecha_estimada_devolucion: new Date(body.fecha_estimada_devolucion),
        tipo: body.tipo,
        numero_ticket: body.numero_ticket || "",
        observaciones_entrega: body.observaciones_entrega || null,
      },
      include: {
        elemento: {
          include: {
            categoria: true,
            subcategoria: true,
          },
        },
      },
    });

    // Log de auditoría
    await logAction({
      action: "CREATE",
      entity: "movimiento",
      entityId: movimiento.id,
      details: `Movimiento creado via API: ${movimiento.numero_ticket}`,
    });

    return NextResponse.json({
      success: true,
      data: movimiento,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creando movimiento:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
