import type { PrismaClient } from "../generated/prisma";

export const categoriasSeed = [
  { id: 1, nombre: "MUEBLES Y ENSERES", descripcion: "Mobiliario y enseres de oficina", estado: "activo" as const },
  { id: 2, nombre: "REFRIGERACION", descripcion: "Equipos de refrigeración y aire acondicionado", estado: "activo" as const },
  { id: 3, nombre: "SEGURIDAD", descripcion: "Equipos y sistemas de seguridad", estado: "activo" as const },
  { id: 4, nombre: "APOYO", descripcion: "Equipos de apoyo y auxiliares", estado: "activo" as const },
  { id: 5, nombre: "COMPUTO", descripcion: "Equipos de computación y tecnología", estado: "activo" as const },
  { id: 6, nombre: "HERRAMIENTAS VIAL", descripcion: "Herramientas y equipos para trabajo vial", estado: "activo" as const },
];

export async function seedCategorias(prisma: PrismaClient) {
  for (const c of categoriasSeed) {
    await prisma.categorias.upsert({
      where: { id: c.id },
      update: { nombre: c.nombre, descripcion: c.descripcion, estado: c.estado },
      create: { id: c.id, nombre: c.nombre, descripcion: c.descripcion, estado: c.estado },
    });
  }
}


