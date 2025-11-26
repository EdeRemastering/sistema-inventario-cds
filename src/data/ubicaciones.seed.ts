import type { PrismaClient } from "@prisma/client";

export const ubicacionesSeed = [
  {
    codigo: "APART-SIS-001",
    nombre: "SALA DE SISTEMAS N°1",
    sede_nombre: "APARTADÓ",
    activo: true,
  },
  {
    codigo: "APART-SIS-002",
    nombre: "SALA DE SISTEMAS N°2",
    sede_nombre: "APARTADÓ",
    activo: true,
  },
  {
    codigo: "TURBO-SIS-001",
    nombre: "SALA DE SISTEMAS PRINCIPAL",
    sede_nombre: "TURBO",
    activo: true,
  },
  {
    codigo: "CHIGO-SIS-001",
    nombre: "SALA DE SISTEMAS",
    sede_nombre: "CHIGORODÓ",
    activo: true,
  },
  {
    codigo: "NECO-SIS-001",
    nombre: "SALA DE SISTEMAS",
    sede_nombre: "NECOCLÍ",
    activo: true,
  },
  {
    codigo: "ARBO-SIS-001",
    nombre: "SALA DE SISTEMAS",
    sede_nombre: "ARBOLETES",
    activo: true,
  },
  {
    codigo: "SANP-SIS-001",
    nombre: "SALA DE SISTEMAS",
    sede_nombre: "SAN PEDRO",
    activo: true,
  },
  {
    codigo: "LORI-SIS-001",
    nombre: "SALA DE SISTEMAS",
    sede_nombre: "LORICA CÓRDOBA",
    activo: true,
  },
];

export async function seedUbicaciones(prisma: PrismaClient) {
  console.log("🌱 Sembrando ubicaciones...");
  
  // Primero obtener todas las sedes usando any temporalmente hasta que se regenere Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sedes = await (prisma as any).sedes.findMany();
  const sedesMap = new Map(sedes.map((s: { nombre: string; id: number }) => [s.nombre, s.id]));
  
  let count = 0;
  
  for (const ubicacion of ubicacionesSeed) {
    const sedeId = sedesMap.get(ubicacion.sede_nombre);
    
    if (!sedeId) {
      console.warn(`⚠️  Sede "${ubicacion.sede_nombre}" no encontrada para ubicación ${ubicacion.codigo}`);
      continue;
    }
    
    // Usar unchecked para evitar problemas de tipos hasta que se regenere Prisma
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.ubicaciones as any).upsert({
      where: { codigo: ubicacion.codigo },
      update: {
        nombre: ubicacion.nombre,
        sede_id: sedeId,
        activo: ubicacion.activo,
      },
      create: {
        codigo: ubicacion.codigo,
        nombre: ubicacion.nombre,
        sede_id: sedeId,
        activo: ubicacion.activo,
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} ubicaciones sembradas correctamente`);
}

