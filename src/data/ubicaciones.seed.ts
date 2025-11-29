import type { PrismaClient } from "@prisma/client";

export const ubicacionesSeed = [
  // APARTADÓ
  { codigo: "APART-SIS-001", nombre: "SALA DE SISTEMAS N°1", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-SIS-002", nombre: "SALA DE SISTEMAS N°2", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-LAB-001", nombre: "LABORATORIO DE ELECTRÓNICA", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-AUD-001", nombre: "AUDITORIO PRINCIPAL", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-BIB-001", nombre: "BIBLIOTECA", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-ADM-001", nombre: "OFICINAS ADMINISTRATIVAS", sede_nombre: "APARTADÓ", activo: true },
  
  // CHIGORODÓ
  { codigo: "CHIGO-SIS-001", nombre: "SALA DE SISTEMAS N°1", sede_nombre: "CHIGORODÓ", activo: true },
  { codigo: "CHIGO-SIS-002", nombre: "SALA DE SISTEMAS N°2", sede_nombre: "CHIGORODÓ", activo: true },
  { codigo: "CHIGO-LAB-001", nombre: "LABORATORIO DE REDES", sede_nombre: "CHIGORODÓ", activo: true },
  { codigo: "CHIGO-AUD-001", nombre: "AUDITORIO", sede_nombre: "CHIGORODÓ", activo: true },
  { codigo: "CHIGO-TAL-001", nombre: "TALLER DE MECÁNICA", sede_nombre: "CHIGORODÓ", activo: true },
  
  // TURBO
  { codigo: "TURBO-SIS-001", nombre: "SALA DE SISTEMAS PRINCIPAL", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-SIS-002", nombre: "SALA DE SISTEMAS N°2", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-LAB-001", nombre: "LABORATORIO DE FÍSICA", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-AUD-001", nombre: "AUDITORIO CENTRAL", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-BIB-001", nombre: "BIBLIOTECA", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-CAF-001", nombre: "CAFETERÍA", sede_nombre: "TURBO", activo: true },
  
  // NECOCLÍ
  { codigo: "NECO-SIS-001", nombre: "SALA DE SISTEMAS", sede_nombre: "NECOCLÍ", activo: true },
  { codigo: "NECO-LAB-001", nombre: "LABORATORIO DE QUÍMICA", sede_nombre: "NECOCLÍ", activo: true },
  { codigo: "NECO-AUD-001", nombre: "AUDITORIO", sede_nombre: "NECOCLÍ", activo: true },
  { codigo: "NECO-TAL-001", nombre: "TALLER MÚLTIPLE", sede_nombre: "NECOCLÍ", activo: true },
  { codigo: "NECO-ADM-001", nombre: "ADMINISTRACIÓN", sede_nombre: "NECOCLÍ", activo: true },
  
  // ARBOLETES
  { codigo: "ARBO-SIS-001", nombre: "SALA DE SISTEMAS", sede_nombre: "ARBOLETES", activo: true },
  { codigo: "ARBO-SIS-002", nombre: "SALA DE SISTEMAS N°2", sede_nombre: "ARBOLETES", activo: true },
  { codigo: "ARBO-LAB-001", nombre: "LABORATORIO INTEGRADO", sede_nombre: "ARBOLETES", activo: true },
  { codigo: "ARBO-AUD-001", nombre: "AUDITORIO", sede_nombre: "ARBOLETES", activo: true },
  { codigo: "ARBO-BIB-001", nombre: "BIBLIOTECA", sede_nombre: "ARBOLETES", activo: true },
  
  // SAN PEDRO
  { codigo: "SANP-SIS-001", nombre: "SALA DE SISTEMAS", sede_nombre: "SAN PEDRO", activo: true },
  { codigo: "SANP-LAB-001", nombre: "LABORATORIO DE CIENCIAS", sede_nombre: "SAN PEDRO", activo: true },
  { codigo: "SANP-AUD-001", nombre: "AUDITORIO", sede_nombre: "SAN PEDRO", activo: true },
  { codigo: "SANP-TAL-001", nombre: "TALLER DE SOLDADURA", sede_nombre: "SAN PEDRO", activo: true },
  { codigo: "SANP-ADM-001", nombre: "OFICINAS", sede_nombre: "SAN PEDRO", activo: true },
  
  // LORICA CÓRDOBA
  { codigo: "LORI-SIS-001", nombre: "SALA DE SISTEMAS N°1", sede_nombre: "LORICA CÓRDOBA", activo: true },
  { codigo: "LORI-SIS-002", nombre: "SALA DE SISTEMAS N°2", sede_nombre: "LORICA CÓRDOBA", activo: true },
  { codigo: "LORI-LAB-001", nombre: "LABORATORIO DE PROGRAMACIÓN", sede_nombre: "LORICA CÓRDOBA", activo: true },
  { codigo: "LORI-AUD-001", nombre: "AUDITORIO PRINCIPAL", sede_nombre: "LORICA CÓRDOBA", activo: true },
  { codigo: "LORI-BIB-001", nombre: "BIBLIOTECA", sede_nombre: "LORICA CÓRDOBA", activo: true },
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

