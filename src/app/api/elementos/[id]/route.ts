import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const parsed = Number(id);
  if (!Number.isFinite(parsed)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const elemento = await prisma.elementos.findUnique({
    where: { id: parsed },
    select: {
      id: true,
      categoria_id: true,
      subcategoria_id: true,
      cantidad: true,
      serie: true,
      marca: true,
      modelo: true,
      ubicacion: true,
      ubicacion_id: true,
      imagen_url: true,
      estado_funcional: true,
      estado_fisico: true,
      fecha_entrada: true,
      fecha_salida: true,
      codigo_equipo: true,
      especificaciones: true,
      observaciones: true,
      activo: true,
      creado_en: true,
      actualizado_en: true,
      categoria: { select: { id: true, nombre: true } },
      subcategoria: { select: { id: true, nombre: true } },
      ubicacion_rel: {
        select: {
          id: true,
          codigo: true,
          nombre: true,
          sede: { select: { id: true, nombre: true, ciudad: true, municipio: true } },
        },
      },
    } as any,
  });

  if (!elemento) {
    return NextResponse.json({ error: "Elemento no encontrado" }, { status: 404 });
  }

  return NextResponse.json(elemento);
}

