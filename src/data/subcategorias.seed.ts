import type { PrismaClient } from "@prisma/client";

export const subcategoriasSeed = [
  { id: 1, nombre: "SILLA PLASTICA", categoria_id: 1 },
  { id: 2, nombre: "MESAS INSTITUCIONAL", categoria_id: 1 },
  { id: 3, nombre: "SILLA INSTITUCIONAL", categoria_id: 1 },
  { id: 4, nombre: "PAPELERA", categoria_id: 1 },
  { id: 5, nombre: "SILLAS UNIVERSITARIAS", categoria_id: 1 },
  { id: 6, nombre: "MESA INSTITUCIONAL", categoria_id: 1 },
  { id: 7, nombre: "SILLAS PLASTICAS", categoria_id: 1 },
  { id: 8, nombre: "MESAS PARA PC", categoria_id: 1 },
  { id: 9, nombre: "SILLA ERGONOMICA", categoria_id: 1 },
  { id: 10, nombre: "MESONES PC", categoria_id: 1 },
  { id: 11, nombre: "MESAS", categoria_id: 1 },
  { id: 12, nombre: "SILLA", categoria_id: 1 },
  { id: 13, nombre: "ARCHIVADORES METALICOS PEQUEÑOS", categoria_id: 1 },
  { id: 14, nombre: "ARCHIVADOR DE PARED", categoria_id: 1 },
  { id: 15, nombre: "MESON PC", categoria_id: 1 },
  { id: 16, nombre: "LAVAMANOS", categoria_id: 1 },
  { id: 17, nombre: "TAZA SANITARIA", categoria_id: 1 },
  { id: 18, nombre: "DISPENSADOR DE PAPEL PARA MANOS", categoria_id: 1 },
  { id: 19, nombre: "DISPENSADOR DE PAPEL HIGUIENICO", categoria_id: 1 },
  { id: 20, nombre: "DISPENSADOR DE JABON", categoria_id: 1 },
  { id: 21, nombre: "ORINALES DE PARED", categoria_id: 1 },
  { id: 22, nombre: "MINISPLIT", categoria_id: 2 },
  { id: 23, nombre: "VENTILADOR PISO PATON", categoria_id: 2 },
  { id: 24, nombre: "VENTILADOR PARED", categoria_id: 2 },
  { id: 25, nombre: "EXTINTOR", categoria_id: 3 },
  { id: 26, nombre: "BOTIQUIN", categoria_id: 3 },
  { id: 27, nombre: "ALARMA", categoria_id: 3 },
  { id: 28, nombre: "KIT DE EMERGENCIA", categoria_id: 3 },
  { id: 29, nombre: "LAMPARAS", categoria_id: 4 },
  { id: 30, nombre: "TABLERO", categoria_id: 4 },
  { id: 31, nombre: "VIDEOBEAMS", categoria_id: 4 },
  { id: 32, nombre: "AUDIO", categoria_id: 4 },
  { id: 33, nombre: "PENDON", categoria_id: 4 },
  { id: 34, nombre: "LAMPARAS 25X25", categoria_id: 4 },
  { id: 35, nombre: "PARLANTES", categoria_id: 4 },
  { id: 36, nombre: "TELEVISOR 32 LED", categoria_id: 4 },
  { id: 37, nombre: "AUDIO PC", categoria_id: 4 },
  { id: 38, nombre: "AMPLIFICADOR", categoria_id: 4 },
  { id: 39, nombre: "PARLANTE PORTABLE", categoria_id: 4 },
  { id: 40, nombre: "TABLERO INFORMATIVO", categoria_id: 4 },
  { id: 41, nombre: "MONITOR", categoria_id: 5 },
  { id: 42, nombre: "TORRE", categoria_id: 5 },
  { id: 43, nombre: "TECLADO", categoria_id: 5 },
  { id: 44, nombre: "MOUSE", categoria_id: 5 },
  { id: 45, nombre: "REGULADOR", categoria_id: 5 },
  { id: 46, nombre: "MODEM", categoria_id: 5 },
  { id: 47, nombre: "SWITCH", categoria_id: 5 },
  { id: 48, nombre: "CAMARA VIDEO", categoria_id: 5 },
  { id: 49, nombre: "SENSOR", categoria_id: 5 },
  { id: 50, nombre: "GABINETE DE RED", categoria_id: 5 },
  { id: 51, nombre: "REGULADORES", categoria_id: 5 },
  { id: 52, nombre: "ALL-IN-ONE", categoria_id: 5 },
  { id: 53, nombre: "CARGADOR", categoria_id: 5 },
  { id: 54, nombre: "ROUTER INALAMBRICO", categoria_id: 5 },
  { id: 55, nombre: "PORTATIL", categoria_id: 5 },
  { id: 56, nombre: "CONOS REFLECTIVOS MEDIANOS", categoria_id: 6 },
  { id: 57, nombre: "CONOS REFLECTIVOS GRANDES", categoria_id: 6 },
  { id: 58, nombre: "CRUZETA", categoria_id: 6 },
  { id: 59, nombre: "GUANTES", categoria_id: 6 },
  { id: 60, nombre: "CORREA DE REMOLQUE", categoria_id: 6 },
  { id: 61, nombre: "GATO TIPO CAIMAN", categoria_id: 6 },
  { id: 62, nombre: "CINTA PELIGRO", categoria_id: 6 },
  { id: 63, nombre: "ESPEJO", categoria_id: 6 },
];

export async function seedSubcategorias(prisma: PrismaClient) {
  console.log("🌱 Sembrando subcategorías...");
  
  // Mapeo de IDs antiguos a nombres de categorías
  const categoriaMap: Record<number, string> = {
    1: "MUEBLES Y ENSERES",
    2: "REFRIGERACION",
    3: "SEGURIDAD",
    4: "APOYO",
    5: "COMPUTO",
    6: "HERRAMIENTAS VIAL",
  };
  
  // Obtener las categorías reales de la BD
  const categorias = await prisma.categorias.findMany();
  const categoriasById = new Map(
    Object.entries(categoriaMap).map(([oldId, nombre]) => {
      const categoria = categorias.find(c => c.nombre === nombre);
      return [parseInt(oldId), categoria?.id];
    })
  );
  
  let count = 0;
  
  for (const s of subcategoriasSeed) {
    const realCategoriaId = categoriasById.get(s.categoria_id);
    
    if (!realCategoriaId) {
      console.warn(`⚠️  Categoría con ID ${s.categoria_id} no encontrada para subcategoría "${s.nombre}"`);
      continue;
    }
    
    await prisma.subcategorias.upsert({
      where: { 
        nombre_categoria_id: {
          nombre: s.nombre,
          categoria_id: realCategoriaId,
        }
      },
      update: { nombre: s.nombre },
      create: { nombre: s.nombre, categoria_id: realCategoriaId },
    });
    count++;
  }
  
  console.log(`✅ ${count} subcategorías sembradas correctamente`);
}


