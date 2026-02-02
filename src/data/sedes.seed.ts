import type { PrismaClient } from "@prisma/client";

export const sedesSeed = [
  {
    nombre: "APARTADÓ",
    ciudad: "Apartadó",
    municipio: "Apartadó",
    activo: true,
  },
  {
    nombre: "CHIGORODÓ",
    ciudad: "Chigorodó",
    municipio: "Chigorodó",
    activo: true,
  },
  {
    nombre: "TURBO",
    ciudad: "Turbo",
    municipio: "Turbo",
    activo: true,
  },
  {
    nombre: "NECOCLÍ",
    ciudad: "Necoclí",
    municipio: "Necoclí",
    activo: true,
  },
  {
    nombre: "ARBOLETES",
    ciudad: "Arboletes",
    municipio: "Arboletes",
    activo: true,
  },
  {
    nombre: "SAN PEDRO",
    ciudad: "San Pedro de Urabá",
    municipio: "San Pedro de Urabá",
    activo: true,
  },
  {
    nombre: "LORICA CÓRDOBA",
    ciudad: "Lorica",
    municipio: "Lorica",
    activo: true,
  },
];

export async function seedSedes(prisma: PrismaClient) {
  console.log("🌱 Sembrando sedes...");
  
  for (const sede of sedesSeed) {
    await prisma.sedes.upsert({
      where: { nombre: sede.nombre },
      update: {
        ciudad: sede.ciudad,
        municipio: sede.municipio,
        activo: sede.activo,
      },
      create: {
        nombre: sede.nombre,
        ciudad: sede.ciudad,
        municipio: sede.municipio,
        activo: sede.activo,
      },
    });
  }
  
  console.log(`✅ ${sedesSeed.length} sedes sembradas correctamente`);
}


