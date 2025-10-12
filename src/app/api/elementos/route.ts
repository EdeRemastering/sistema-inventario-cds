import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const elementos = await prisma.elementos.findMany({
      where: {
        estado_funcional: "B", // Solo elementos en buen estado
        estado_fisico: "B",
      },
      include: {
        categoria: {
          select: {
            nombre: true,
          },
        },
        subcategoria: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        serie: "asc",
      },
    });

    return NextResponse.json(elementos);
  } catch (error) {
    console.error("Error fetching elementos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}