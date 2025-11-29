import type { PrismaClient } from "@prisma/client";

export const categoriasSeed = [
  { id: 1, nombre: "MUEBLES Y ENSERES", descripcion: "Mobiliario y enseres de oficina", estado: "activo" as const },
  { id: 2, nombre: "REFRIGERACION", descripcion: "Equipos de refrigeración y aire acondicionado", estado: "activo" as const },
  { id: 3, nombre: "SEGURIDAD", descripcion: "Equipos y sistemas de seguridad", estado: "activo" as const },
  { id: 4, nombre: "APOYO", descripcion: "Equipos de apoyo y auxiliares", estado: "activo" as const },
  { id: 5, nombre: "COMPUTO", descripcion: "Equipos de computación y tecnología", estado: "activo" as const },
  { id: 6, nombre: "HERRAMIENTAS VIAL", descripcion: "Herramientas y equipos para trabajo vial", estado: "activo" as const },
];

export async function seedCategorias(prisma: PrismaClient) {
  console.log("🌱 Sembrando categorías...");
  
  for (const c of categoriasSeed) {
    await prisma.categorias.upsert({
      where: { nombre: c.nombre },
      update: { descripcion: c.descripcion, estado: c.estado },
      create: { nombre: c.nombre, descripcion: c.descripcion, estado: c.estado },
    });
  }
  
  console.log(`✅ ${categoriasSeed.length} categorías sembradas correctamente`);
}


