import type { PrismaClient } from "@prisma/client";

/** Subcategorías mínimas usadas por el seed de elementos (presentación). */
export const subcategoriasSeed = [
  { nombre: "SILLA PLASTICA", categoria_id: 1 },
  { nombre: "MESAS INSTITUCIONAL", categoria_id: 1 },
  { nombre: "MINISPLIT", categoria_id: 2 },
  { nombre: "VENTILADOR PISO PATON", categoria_id: 2 },
  { nombre: "EXTINTOR", categoria_id: 3 },
  { nombre: "BOTIQUIN", categoria_id: 3 },
  { nombre: "VIDEOBEAMS", categoria_id: 4 },
  { nombre: "TABLERO", categoria_id: 4 },
  { nombre: "PARLANTES", categoria_id: 4 },
  { nombre: "TELEVISOR 32 LED", categoria_id: 4 },
  { nombre: "MONITOR", categoria_id: 5 },
  { nombre: "TORRE", categoria_id: 5 },
  { nombre: "TECLADO", categoria_id: 5 },
  { nombre: "MOUSE", categoria_id: 5 },
  { nombre: "REGULADOR", categoria_id: 5 },
];

const categoriaMap: Record<number, string> = {
  1: "MUEBLES Y ENSERES",
  2: "REFRIGERACION",
  3: "SEGURIDAD",
  4: "APOYO",
  5: "COMPUTO",
};

export async function seedSubcategorias(prisma: PrismaClient) {
  console.log("🌱 Sembrando subcategorías...");
  const categorias = await prisma.categorias.findMany();
  const categoriasById = new Map(
    Object.entries(categoriaMap).map(([oldId, nombre]) => {
      const c = categorias.find((x) => x.nombre === nombre);
      return [parseInt(oldId), c?.id];
    })
  );
  let count = 0;
  for (const s of subcategoriasSeed) {
    const realCategoriaId = categoriasById.get(s.categoria_id);
    if (!realCategoriaId) continue;
    try {
      await prisma.subcategorias.upsert({
        where: {
          nombre_categoria_id: { nombre: s.nombre, categoria_id: realCategoriaId },
        },
        update: {},
        create: { nombre: s.nombre, categoria_id: realCategoriaId },
      });
      count++;
    } catch (e) {
      console.error(`Error creando subcategoría ${s.nombre}:`, e);
    }
  }
  console.log(`✅ ${count} subcategorías sembradas correctamente`);
}
