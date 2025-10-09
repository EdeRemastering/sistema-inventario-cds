import type { PrismaClient } from "@prisma/client";

export const elementosSeed = [
  { id: 1, categoria_id: 4, subcategoria_id: 38, cantidad: 1, serie: "N/A", marca: "LG", modelo: "N/A", ubicacion: "AMBIENTE DE APRENDIZAJE N°1", estado_funcional: "B" as const, estado_fisico: "B" as const, fecha_entrada: new Date("2025-09-19"), codigo_equipo: "AA01-ME-01-01", observaciones: "En buen estado" },
  { id: 2, categoria_id: 6, subcategoria_id: 62, cantidad: 10, serie: "001254", marca: "tesa", modelo: "2025", ubicacion: "AMBIENTE DE APRENDIZAJE N°1", estado_funcional: "B" as const, estado_fisico: "B" as const, fecha_entrada: new Date("2025-09-19"), codigo_equipo: "AA01-ME-01-01", observaciones: "En buen estado" },
];

export async function seedElementos(prisma: PrismaClient) {
  for (const e of elementosSeed) {
    await prisma.elementos.upsert({
      where: { id: e.id },
      update: {
        categoria_id: e.categoria_id,
        subcategoria_id: e.subcategoria_id ?? null,
        cantidad: e.cantidad,
        serie: e.serie,
        marca: e.marca,
        modelo: e.modelo,
        ubicacion: e.ubicacion,
        estado_funcional: e.estado_funcional,
        estado_fisico: e.estado_fisico,
        fecha_entrada: e.fecha_entrada,
        codigo_equipo: e.codigo_equipo,
        observaciones: e.observaciones,
      },
      create: {
        id: e.id,
        categoria_id: e.categoria_id,
        subcategoria_id: e.subcategoria_id ?? null,
        cantidad: e.cantidad,
        serie: e.serie,
        marca: e.marca,
        modelo: e.modelo,
        ubicacion: e.ubicacion,
        estado_funcional: e.estado_funcional,
        estado_fisico: e.estado_fisico,
        fecha_entrada: e.fecha_entrada,
        codigo_equipo: e.codigo_equipo,
        observaciones: e.observaciones,
      },
    });
  }
}


